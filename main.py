import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from agent import AgentGPT
from dotenv import load_dotenv

# Import ADAPT-Agent-System components
from Projects.ADAPT_Agent_System.database import engine, SessionLocal, Base
from Projects.ADAPT_Agent_System.models import User, Project, Task, Knowledge
from Projects.ADAPT_Agent_System.schemas import ProjectCreate, ProjectUpdate, KnowledgeCreate, KnowledgeUpdate
from Projects.ADAPT_Agent_System.routes import user_router, project_router, task_router, knowledge_router

load_dotenv()

app = FastAPI()

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize the AgentGPT
agent = AgentGPT(api_key=os.getenv("OPENAI_API_KEY"))

# Include ADAPT-Agent-System routers
app.include_router(user_router, prefix="/api/users", tags=["users"])
app.include_router(project_router, prefix="/api/projects", tags=["projects"])
app.include_router(task_router, prefix="/api/tasks", tags=["tasks"])
app.include_router(knowledge_router, prefix="/api/knowledge", tags=["knowledge"])

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
async def startup():
    # Create tables for ADAPT-Agent-System
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Welcome to the unified ADAPT platform"}

# Project management endpoints
@app.post("/api/projects", response_model=Project)
async def create_project(project: ProjectCreate, db: SessionLocal = Depends(get_db)):
    db_project = Project(**project.dict())
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

@app.get("/api/projects/{project_id}", response_model=Project)
async def read_project(project_id: int, db: SessionLocal = Depends(get_db)):
    project = await db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.put("/api/projects/{project_id}", response_model=Project)
async def update_project(project_id: int, project: ProjectUpdate, db: SessionLocal = Depends(get_db)):
    db_project = await db.query(Project).filter(Project.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    update_data = project.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    await db.commit()
    await db.refresh(db_project)
    return db_project

# Knowledge management endpoints
@app.post("/api/knowledge", response_model=Knowledge)
async def create_knowledge(knowledge: KnowledgeCreate, db: SessionLocal = Depends(get_db)):
    db_knowledge = Knowledge(**knowledge.dict())
    db.add(db_knowledge)
    await db.commit()
    await db.refresh(db_knowledge)
    return db_knowledge

@app.get("/api/knowledge/{knowledge_id}", response_model=Knowledge)
async def read_knowledge(knowledge_id: int, db: SessionLocal = Depends(get_db)):
    knowledge = await db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()
    if knowledge is None:
        raise HTTPException(status_code=404, detail="Knowledge not found")
    return knowledge

@app.put("/api/knowledge/{knowledge_id}", response_model=Knowledge)
async def update_knowledge(knowledge_id: int, knowledge: KnowledgeUpdate, db: SessionLocal = Depends(get_db)):
    db_knowledge = await db.query(Knowledge).filter(Knowledge.id == knowledge_id).first()
    if db_knowledge is None:
        raise HTTPException(status_code=404, detail="Knowledge not found")
    update_data = knowledge.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_knowledge, key, value)
    await db.commit()
    await db.refresh(db_knowledge)
    return db_knowledge

# Existing ADAPT-Agent-GPT endpoints
# ... (keep all existing endpoints)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)