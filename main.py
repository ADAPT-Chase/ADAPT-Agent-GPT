import os
import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from agent import AgentGPT
from dotenv import load_dotenv
from database.database_manager import db_manager
from database_setup import setup_postgresql, setup_mongodb, setup_redis, setup_pinecone, setup_dynamodb

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the AgentGPT
agent = AgentGPT(api_key=os.getenv("OPENAI_API_KEY"))

# Authentication setup
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models
class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class ProjectCreate(BaseModel):
    name: str
    description: str

class TaskCreate(BaseModel):
    title: str
    description: str
    project_id: Optional[str] = None

class KnowledgeCreate(BaseModel):
    content: str
    tags: List[str]

class VectorQuery(BaseModel):
    query: List[float]
    top_k: int = 5

class CacheItem(BaseModel):
    value: str

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db_manager.dynamodb_get_item("users", {"username": username})
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db_manager.dynamodb_get_item("users", {"username": form_data.username})
    if not user or not verify_password(form_data.password, user['password']):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users", response_model=Token)
async def create_user(user: UserCreate):
    hashed_password = get_password_hash(user.password)
    new_user = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password
    }
    db_manager.dynamodb_put_item("users", new_user)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user['username']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/projects")
async def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    project_data = project.dict()
    project_data['user_id'] = current_user['username']
    result = db_manager.mongo_insert("projects", project_data)
    return {"id": str(result.inserted_id), **project_data}

@app.get("/projects")
async def get_projects(current_user: dict = Depends(get_current_user)):
    projects = db_manager.mongo_find("projects", {"user_id": current_user['username']})
    return list(projects)

@app.post("/tasks")
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    task_data = task.dict()
    task_data['user_id'] = current_user['username']
    task_data['status'] = "TODO"
    result = db_manager.mongo_insert("tasks", task_data)
    return {"id": str(result.inserted_id), **task_data}

@app.get("/tasks")
async def get_tasks(current_user: dict = Depends(get_current_user)):
    tasks = db_manager.mongo_find("tasks", {"user_id": current_user['username']})
    return list(tasks)

@app.post("/knowledge")
async def create_knowledge(knowledge: KnowledgeCreate, current_user: dict = Depends(get_current_user)):
    knowledge_data = knowledge.dict()
    knowledge_data['user_id'] = current_user['username']
    result = db_manager.mongo_insert("knowledge", knowledge_data)
    
    # Store in vector database for similarity search
    vector = agent.get_embedding(knowledge_data['content'])
    db_manager.vector_upsert([(str(result.inserted_id), vector, {"content": knowledge_data['content']})])
    
    return {"id": str(result.inserted_id), **knowledge_data}

@app.get("/knowledge")
async def get_knowledge(current_user: dict = Depends(get_current_user)):
    knowledge = db_manager.mongo_find("knowledge", {"user_id": current_user['username']})
    return list(knowledge)

@app.post("/knowledge/search")
async def search_knowledge(query: VectorQuery, current_user: dict = Depends(get_current_user)):
    results = db_manager.vector_query(query.query, query.top_k)
    return results

@app.get("/cache/{key}")
async def get_cache(key: str, current_user: dict = Depends(get_current_user)):
    value = db_manager.redis_get(f"{current_user['username']}:{key}")
    if value is None:
        raise HTTPException(status_code=404, detail="Key not found")
    return {"key": key, "value": value}

@app.post("/cache/{key}")
async def set_cache(key: str, item: CacheItem, current_user: dict = Depends(get_current_user)):
    db_manager.redis_set(f"{current_user['username']}:{key}", item.value, ex=3600)  # Cache for 1 hour
    return {"message": "Value cached successfully"}

@app.on_event("startup")
async def startup_event():
    try:
        setup_postgresql()
        setup_mongodb()
        setup_redis()
        setup_pinecone()
        setup_dynamodb()
        logger.info("All databases have been set up successfully")
    except Exception as e:
        logger.error(f"Error setting up databases: {str(e)}")
        raise

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)