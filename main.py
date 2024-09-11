import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from server.database.database_manager import DatabaseManager
from server.api_routes import router as api_router
from agent import ADAPTAgent

load_dotenv()

app = FastAPI(title="ADAPT Agent GPT API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
db_url = os.getenv("DATABASE_URL")
db_manager = DatabaseManager(db_url)

# Initialize AI agent
ai_agent = ADAPTAgent()

# Include API routes
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    # Perform any necessary startup tasks
    print("ADAPT Agent GPT API is starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    # Perform any necessary cleanup tasks
    print("ADAPT Agent GPT API is shutting down...")

@app.get("/")
async def root():
    return {"message": "Welcome to ADAPT Agent GPT API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)