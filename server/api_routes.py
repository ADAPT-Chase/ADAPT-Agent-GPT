from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional
from database.database_manager import DatabaseManager
from agent import ADAPTAgent
import jwt
from datetime import datetime, timedelta
import bcrypt
import os

router = APIRouter()

# Database setup
db_url = os.getenv("DATABASE_URL")
db_manager = DatabaseManager(db_url)

# Agent setup
agent = ADAPTAgent()

# JWT setup
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models
class UserCreate(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ProjectCreate(BaseModel):
    name: str
    description: str

class Project(BaseModel):
    id: int
    name: str
    description: str

class TaskCreate(BaseModel):
    title: str
    description: str
    project_id: int

class Task(BaseModel):
    id: int
    title: str
    description: str
    status: str
    completed: bool

class KnowledgeCreate(BaseModel):
    content: str
    model: str
    tags: List[str]

class Knowledge(BaseModel):
    id: int
    content: str
    model: str
    tags: List[str]

class Query(BaseModel):
    query: str

class AgentResponse(BaseModel):
    query: str
    response: str

# Helper functions
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
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        user = db_manager.get_user(username)
        if user is None:
            raise credentials_exception
        return user
    except jwt.PyJWTError:
        raise credentials_exception

# Routes
@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db_manager.get_user(form_data.username)
    if not user or not bcrypt.checkpw(form_data.password.encode('utf-8'), user.password.encode('utf-8')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    user_id = db_manager.create_user(user.username, hashed_password.decode('utf-8'))
    return {"id": user_id, "username": user.username}

@router.post("/projects", response_model=Project)
async def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user)):
    project_id = db_manager.create_project(project.name, project.description, current_user.id)
    return {"id": project_id, **project.dict()}

@router.get("/projects", response_model=List[Project])
async def get_projects(current_user: User = Depends(get_current_user)):
    return db_manager.get_projects(current_user.id)

@router.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate, current_user: User = Depends(get_current_user)):
    task_id = db_manager.create_task(task.title, task.description, task.project_id)
    return {"id": task_id, **task.dict(), "status": "Not Started", "completed": False}

@router.get("/tasks/{project_id}", response_model=List[Task])
async def get_tasks(project_id: int, current_user: User = Depends(get_current_user)):
    return db_manager.get_tasks(project_id)

@router.post("/knowledge", response_model=Knowledge)
async def create_knowledge_entry(entry: KnowledgeCreate, current_user: User = Depends(get_current_user)):
    entry_id = db_manager.create_knowledge_entry(entry.content, entry.model, current_user.id, entry.tags)
    return {"id": entry_id, **entry.dict()}

@router.get("/knowledge", response_model=List[Knowledge])
async def get_knowledge_entries(current_user: User = Depends(get_current_user)):
    return db_manager.get_knowledge_entries(current_user.id)

@router.get("/knowledge/search", response_model=List[Knowledge])
async def search_knowledge(query: str, current_user: User = Depends(get_current_user)):
    return db_manager.search_knowledge(query, current_user.id)

@router.get("/tasks/recent", response_model=List[Task])
async def get_recent_tasks(current_user: User = Depends(get_current_user)):
    return db_manager.get_recent_tasks(current_user.id)

@router.get("/knowledge/recent", response_model=List[Knowledge])
async def get_recent_knowledge(current_user: User = Depends(get_current_user)):
    return db_manager.get_recent_knowledge(current_user.id)

@router.get("/stats")
async def get_stats(current_user: User = Depends(get_current_user)):
    return db_manager.get_user_stats(current_user.id)

@router.post("/agent/query", response_model=AgentResponse)
async def query_agent(query: Query, current_user: User = Depends(get_current_user)):
    response = await agent.process_query(query.query, current_user.id)
    return response

@router.post("/agent/create_task", response_model=Task)
async def agent_create_task(task: TaskCreate, current_user: User = Depends(get_current_user)):
    task_details = await agent.create_task(task.project_id, task.description)
    return {"id": task_details["id"], "title": task_details["title"], "description": task_details["description"], "project_id": task.project_id, "status": "Not Started", "completed": False}

@router.get("/agent/analyze_project/{project_id}")
async def agent_analyze_project(project_id: int, current_user: User = Depends(get_current_user)):
    analysis = await agent.analyze_project(project_id)
    return analysis