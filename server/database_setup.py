import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine
from database.database_manager import Base, User, Project, Task, Knowledge, DatabaseManager

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///adapt_agent_gpt.db')

def setup_database():
    logger.info(f"Setting up database with URL: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    logger.info("Database tables created successfully.")

def create_initial_data():
    logger.info("Creating initial data")
    db_manager = DatabaseManager()

    # Create an admin user
    admin_user = db_manager.create_user(
        username="admin",
        email="admin@example.com",
        password_hash="hashed_password"  # In a real scenario, use a proper password hashing function
    )
    logger.info(f"Admin user created with id: {admin_user.id}")

    # Create an initial project
    initial_project = db_manager.create_project(
        name="Welcome Project",
        description="This is your first project in ADAPT-Agent-GPT.",
        user_id=admin_user.id
    )
    logger.info(f"Initial project created with id: {initial_project.id}")

    # Create an initial task
    initial_task = db_manager.create_task(
        title="Get started with ADAPT-Agent-GPT",
        description="Explore the features of ADAPT-Agent-GPT and create your first real project.",
        user_id=admin_user.id,
        project_id=initial_project.id
    )
    logger.info(f"Initial task created with id: {initial_task.id}")

    # Create an initial knowledge entry
    initial_knowledge = db_manager.create_knowledge(
        content="ADAPT-Agent-GPT is a powerful tool for managing projects and tasks with AI assistance.",
        tags="ADAPT-Agent-GPT,introduction",
        model="gpt-3.5-turbo",
        user_id=admin_user.id
    )
    logger.info(f"Initial knowledge entry created with id: {initial_knowledge.id}")

    logger.info("Initial data created successfully.")

if __name__ == "__main__":
    logger.info("Starting database setup")
    setup_database()
    create_initial_data()
    logger.info("Database setup complete.")