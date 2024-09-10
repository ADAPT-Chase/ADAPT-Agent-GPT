from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
from agent import AgentGPT
import os
import uuid
from databases import Database
from sqlalchemy import create_engine, MetaData, Table, Column, String, Boolean, Integer, ForeignKey

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/adaptgpt")
database = Database(DATABASE_URL)
metadata = MetaData()

# Define tables
users = Table(
    "users",
    metadata,
    Column("username", String, primary_key=True),
    Column("hashed_password", String)
)

user_profiles = Table(
    "user_profiles",
    metadata,
    Column("username", String, ForeignKey("users.username"), primary_key=True),
    Column("full_name", String),
    Column("email", String),
    Column("bio", String)
)

tasks = Table(
    "tasks",
    metadata,
    Column("id", String, primary_key=True),
    Column("description", String),
    Column("completed", Boolean),
    Column("username", String, ForeignKey("users.username"))
)

stats = Table(
    "stats",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("analysis_requests", Integer),
    Column("code_generation_requests", Integer),
    Column("question_answering_requests", Integer)
)

# Create tables
engine = create_engine(DATABASE_URL)
metadata.create_all(engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key"  # Replace with a secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# User model
class User(BaseModel):
    username: str
    password: str

# Token model
class Token(BaseModel):
    access_token: str
    token_type: str

# Task model
class Task(BaseModel):
    id: str
    description: str
    completed: bool

class TaskCreate(BaseModel):
    description: str

# Code Generation model
class CodeGeneration(BaseModel):
    task: str
    language: str

# Question model
class Question(BaseModel):
    question: str

# Dashboard Stats model
class DashboardStats(BaseModel):
    totalTasks: int
    completedTasks: int
    pendingTasks: int
    analysisRequests: int
    codeGenerationRequests: int
    questionAnsweringRequests: int

# User Profile model
class UserProfile(BaseModel):
    full_name: str
    email: str
    bio: str

# Initialize AgentGPT
agent = AgentGPT(os.getenv("OPENAI_API_KEY"))

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
    except JWTError:
        raise credentials_exception
    user = await database.fetch_one(users.select().where(users.c.username == username))
    if user is None:
        raise credentials_exception
    return username

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.post("/register")
async def register(user: User):
    query = users.select().where(users.c.username == user.username)
    existing_user = await database.fetch_one(query)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = pwd_context.hash(user.password)
    query = users.insert().values(username=user.username, hashed_password=hashed_password)
    await database.execute(query)
    return {"message": "User registered successfully"}

@app.post("/login")
async def login(user: User):
    query = users.select().where(users.c.username == user.username)
    db_user = await database.fetch_one(query)
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if not pwd_context.verify(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/")
async def root():
    return {"message": "Welcome to ADAPT-Agent-GPT API"}

@app.get("/tasks")
async def get_tasks(current_user: str = Depends(get_current_user)):
    query = tasks.select().where(tasks.c.username == current_user)
    return {"tasks": await database.fetch_all(query)}

@app.post("/tasks")
async def create_task(task: TaskCreate, current_user: str = Depends(get_current_user)):
    task_id = str(uuid.uuid4())
    query = tasks.insert().values(id=task_id, description=task.description, completed=False, username=current_user)
    await database.execute(query)
    return {"id": task_id, "description": task.description, "completed": False}

@app.put("/tasks/{task_id}")
async def update_task(task_id: str, task: Task, current_user: str = Depends(get_current_user)):
    query = tasks.update().where(tasks.c.id == task_id).where(tasks.c.username == current_user).values(description=task.description, completed=task.completed)
    result = await database.execute(query)
    if result == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task updated successfully"}

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: str = Depends(get_current_user)):
    query = tasks.delete().where(tasks.c.id == task_id).where(tasks.c.username == current_user)
    result = await database.execute(query)
    if result == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

@app.get("/protected")
async def protected_route(current_user: str = Depends(get_current_user)):
    return {"message": f"Hello, {current_user}! This is a protected route."}

@app.post("/analyze_task")
async def analyze_task(task: TaskCreate, current_user: str = Depends(get_current_user)):
    await database.execute(stats.update().values(analysis_requests=stats.c.analysis_requests + 1))
    result = agent.analyze_task(task.description)
    return result

@app.post("/generate_code")
async def generate_code(code_gen: CodeGeneration, current_user: str = Depends(get_current_user)):
    await database.execute(stats.update().values(code_generation_requests=stats.c.code_generation_requests + 1))
    result = agent.generate_code(code_gen.task, code_gen.language)
    return {"code": result}

@app.post("/answer_question")
async def answer_question(question: Question, current_user: str = Depends(get_current_user)):
    await database.execute(stats.update().values(question_answering_requests=stats.c.question_answering_requests + 1))
    result = agent.answer_question(question.question)
    return {"answer": result}

@app.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(current_user: str = Depends(get_current_user)):
    tasks_query = tasks.select().where(tasks.c.username == current_user)
    user_tasks = await database.fetch_all(tasks_query)
    total_tasks = len(user_tasks)
    completed_tasks = sum(1 for task in user_tasks if task["completed"])
    pending_tasks = total_tasks - completed_tasks

    stats_query = stats.select()
    stats_data = await database.fetch_one(stats_query)

    return DashboardStats(
        totalTasks=total_tasks,
        completedTasks=completed_tasks,
        pendingTasks=pending_tasks,
        analysisRequests=stats_data["analysis_requests"],
        codeGenerationRequests=stats_data["code_generation_requests"],
        questionAnsweringRequests=stats_data["question_answering_requests"]
    )

@app.get("/profile")
async def get_profile(current_user: str = Depends(get_current_user)):
    query = user_profiles.select().where(user_profiles.c.username == current_user)
    profile = await database.fetch_one(query)
    if profile:
        return UserProfile(**profile)
    else:
        return {"message": "Profile not found"}

@app.post("/profile")
async def create_or_update_profile(profile: UserProfile, current_user: str = Depends(get_current_user)):
    query = user_profiles.select().where(user_profiles.c.username == current_user)
    existing_profile = await database.fetch_one(query)
    if existing_profile:
        query = user_profiles.update().where(user_profiles.c.username == current_user).values(**profile.dict())
        await database.execute(query)
        return {"message": "Profile updated successfully"}
    else:
        query = user_profiles.insert().values(username=current_user, **profile.dict())
        await database.execute(query)
        return {"message": "Profile created successfully"}

# Add more endpoints as needed