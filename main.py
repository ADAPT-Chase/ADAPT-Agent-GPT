from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def root():
    return {"message": "Welcome to ADAPT-Agent-GPT API"}

@app.get("/tasks")
async def get_tasks():
    # This is a placeholder. In a real application, you would fetch tasks from a database.
    return {"tasks": ["Task 1", "Task 2", "Task 3"]}

# Add more endpoints as needed