from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.database_manager import Base, User, Project, Task, Knowledge, Tag
from dotenv import load_dotenv
import os

load_dotenv()

# Get the database URL from the environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

# Create an engine that stores data in the local directory's
# sqlalchemy_example.db file.
engine = create_engine(DATABASE_URL)

# Create all tables in the engine. This is equivalent to "Create Table"
# statements in raw SQL.
Base.metadata.create_all(engine)

# Create a configured "Session" class
Session = sessionmaker(bind=engine)

# Create a Session
session = Session()

def setup_database():
    # Check if there are any existing users
    existing_users = session.query(User).first()
    
    if not existing_users:
        # Create a sample user
        sample_user = User(username="sample_user", password="hashed_password")
        session.add(sample_user)
        
        # Create a sample project
        sample_project = Project(name="Sample Project", description="This is a sample project", user=sample_user)
        session.add(sample_project)
        
        # Create a sample task
        sample_task = Task(title="Sample Task", description="This is a sample task", project=sample_project)
        session.add(sample_task)
        
        # Create a sample knowledge entry
        sample_knowledge = Knowledge(content="This is a sample knowledge entry", model="gpt-3.5-turbo", user=sample_user)
        session.add(sample_knowledge)
        
        # Create sample tags
        sample_tag1 = Tag(name="sample")
        sample_tag2 = Tag(name="example")
        session.add(sample_tag1)
        session.add(sample_tag2)
        
        # Associate tags with the knowledge entry
        sample_knowledge.tags.extend([sample_tag1, sample_tag2])
        
        # Commit the changes
        session.commit()
        
        print("Sample data has been added to the database.")
    else:
        print("Database already contains data. Skipping sample data creation.")

if __name__ == "__main__":
    setup_database()
    print("Database setup complete.")

# Close the session
session.close()