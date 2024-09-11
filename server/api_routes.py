from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from server.database.database_manager import DatabaseManager
from agent import ADAPTAgent

router = APIRouter()
db_manager = DatabaseManager()
agent = ADAPTAgent()

# Security
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str = None

class User(BaseModel):
    username: str
    email: str = None
    full_name: str = None
    disabled: bool = None

class UserInDB(User):
    hashed_password: str

class ProjectCreate(BaseModel):
    name: str
    description: str

class TaskCreate(BaseModel):
    title: str
    description: str
    project_id: int

class KnowledgeCreate(BaseModel):
    content: str
    tags: str
    model: str

class Query(BaseModel):
    query: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(username: str, password: str):
    user = db_manager.get_user_by_username(username)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
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
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db_manager.get_user_by_username(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# Routes
@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/users")
async def create_user(username: str, email: str, password: str):
    hashed_password = get_password_hash(password)
    user = db_manager.create_user(username, email, hashed_password)
    return {"username": user.username, "email": user.email}

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/projects")
async def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user)):
    db_project = db_manager.create_project(project.name, project.description, current_user.id)
    return {"id": db_project.id, "name": db_project.name, "description": db_project.description}

@router.get("/projects")
async def get_projects(current_user: User = Depends(get_current_user)):
    projects = db_manager.get_projects_by_user(current_user.id)
    return [{"id": p.id, "name": p.name, "description": p.description} for p in projects]

@router.post("/tasks")
async def create_task(task: TaskCreate, current_user: User = Depends(get_current_user)):
    db_task = db_manager.create_task(task.title, task.description, current_user.id, task.project_id)
    return {"id": db_task.id, "title": db_task.title, "description": db_task.description, "status": db_task.status}

@router.get("/tasks")
async def get_tasks(project_id: int = None, current_user: User = Depends(get_current_user)):
    if project_id:
        tasks = db_manager.get_tasks_by_project(project_id)
    else:
        tasks = db_manager.get_tasks_by_user(current_user.id)
    return [{"id": t.id, "title": t.title, "description": t.description, "status": t.status} for t in tasks]

@router.post("/knowledge")
async def create_knowledge(knowledge: KnowledgeCreate, current_user: User = Depends(get_current_user)):
    db_knowledge = db_manager.create_knowledge(knowledge.content, knowledge.tags, knowledge.model, current_user.id)
    return {"id": db_knowledge.id, "content": db_knowledge.content, "tags": db_knowledge.tags, "model": db_knowledge.model}

@router.get("/knowledge")
async def get_knowledge(current_user: User = Depends(get_current_user)):
    knowledge_entries = db_manager.get_knowledge_entries(current_user.id)
    return [{"id": k.id, "content": k.content, "tags": k.tags, "model": k.model} for k in knowledge_entries]

@router.post("/agent/query")
async def agent_query(query: Query, current_user: User = Depends(get_current_user)):
    result = await agent.process_query(query.query, current_user.id)
    return result

@router.post("/agent/create_task")
async def agent_create_task(task: TaskCreate, current_user: User = Depends(get_current_user)):
    result = await agent.create_task(task.project_id, task.description, current_user.id)
    return result

@router.get("/agent/analyze_project/{project_id}")
async def agent_analyze_project(project_id: int, current_user: User = Depends(get_current_user)):
    result = await agent.analyze_project(project_id)
    return result