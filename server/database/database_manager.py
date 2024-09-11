import os
import logging
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from pymongo import MongoClient
from azure.cosmos import CosmosClient, PartitionKey

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

Base = declarative_base()

project_knowledge = Table('project_knowledge', Base.metadata,
    Column('project_id', Integer, ForeignKey('projects.id')),
    Column('knowledge_id', Integer, ForeignKey('knowledge.id'))
)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    projects = relationship('Project', back_populates='user')
    tasks = relationship('Task', back_populates='user')
    knowledge_entries = relationship('Knowledge', back_populates='user')

class Project(Base):
    __tablename__ = 'projects'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    user = relationship('User', back_populates='projects')
    tasks = relationship('Task', back_populates='project')
    knowledge = relationship('Knowledge', secondary=project_knowledge, back_populates='projects')

class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    status = Column(String(20), default='To Do')
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=True)
    user = relationship('User', back_populates='tasks')
    project = relationship('Project', back_populates='tasks')

class Knowledge(Base):
    __tablename__ = 'knowledge'
    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    tags = Column(String(200))
    model = Column(String(50), default='gpt-3.5-turbo')
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    user = relationship('User', back_populates='knowledge_entries')
    projects = relationship('Project', secondary=project_knowledge, back_populates='knowledge')

class CosmosDBManager:
    def __init__(self, url, key, database_name, container_name):
        self.client = CosmosClient(url, credential=key)
        self.database = self.client.get_database_client(database_name)
        self.container = self.database.get_container_client(container_name)

    def create_item(self, item):
        return self.container.create_item(body=item)

    def read_item(self, item_id, partition_key):
        return self.container.read_item(item=item_id, partition_key=partition_key)

    def query_items(self, query, parameters=None):
        return list(self.container.query_items(query=query, parameters=parameters))

    def update_item(self, item_id, updated_item):
        return self.container.upsert_item(body=updated_item)

    def delete_item(self, item_id, partition_key):
        return self.container.delete_item(item=item_id, partition_key=partition_key)

class DatabaseManager:
    def __init__(self):
        logger.info("Initializing DatabaseManager")
        self.db_url = os.getenv('DATABASE_URL', 'sqlite:///adapt_agent_gpt.db')
        self.engine = create_engine(self.db_url)
        self.SessionLocal = sessionmaker(bind=self.engine)
        Base.metadata.create_all(self.engine)
        logger.info(f"Database initialized with URL: {self.db_url}")

        # MongoDB setup
        mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
        mongo_db_name = os.getenv('MONGO_DB_NAME', 'adapt_agent_gpt')
        self.mongo_client = MongoClient(mongo_url)
        self.mongo_db = self.mongo_client[mongo_db_name]
        logger.info(f"MongoDB initialized with URL: {mongo_url}, DB: {mongo_db_name}")

        # Azure Cosmos DB setup
        cosmos_url = os.getenv('COSMOS_URL')
        cosmos_key = os.getenv('COSMOS_KEY')
        cosmos_db_name = os.getenv('COSMOS_DB_NAME')
        cosmos_container_name = os.getenv('COSMOS_CONTAINER_NAME')
        self.cosmos_db = CosmosDBManager(cosmos_url, cosmos_key, cosmos_db_name, cosmos_container_name)
        logger.info(f"Azure Cosmos DB initialized with URL: {cosmos_url}, DB: {cosmos_db_name}")

    def get_session(self):
        return self.SessionLocal()

    # User operations
    def create_user(self, username, email, password_hash):
        logger.info(f"Creating user: {username}")
        with self.get_session() as session:
            new_user = User(username=username, email=email, password_hash=password_hash)
            session.add(new_user)
            session.commit()
            logger.info(f"User created: {username}")
            return new_user

    def get_user_by_username(self, username):
        logger.info(f"Fetching user by username: {username}")
        with self.get_session() as session:
            return session.query(User).filter(User.username == username).first()

    # Project operations
    def create_project(self, name, description, user_id):
        logger.info(f"Creating project: {name} for user_id: {user_id}")
        with self.get_session() as session:
            new_project = Project(name=name, description=description, user_id=user_id)
            session.add(new_project)
            session.commit()
            logger.info(f"Project created: {name}")
            return new_project

    def get_projects_by_user(self, user_id):
        logger.info(f"Fetching projects for user_id: {user_id}")
        with self.get_session() as session:
            return session.query(Project).filter(Project.user_id == user_id).all()

    def get_project_by_id(self, project_id):
        logger.info(f"Fetching project by id: {project_id}")
        with self.get_session() as session:
            return session.query(Project).filter(Project.id == project_id).first()

    # Task operations
    def create_task(self, title, description, user_id, project_id=None):
        logger.info(f"Creating task: {title} for user_id: {user_id}, project_id: {project_id}")
        with self.get_session() as session:
            new_task = Task(title=title, description=description, user_id=user_id, project_id=project_id)
            session.add(new_task)
            session.commit()
            logger.info(f"Task created: {title}")
            return new_task

    def get_tasks_by_user(self, user_id):
        logger.info(f"Fetching tasks for user_id: {user_id}")
        with self.get_session() as session:
            return session.query(Task).filter(Task.user_id == user_id).all()

    def get_tasks_by_project(self, project_id):
        logger.info(f"Fetching tasks for project_id: {project_id}")
        with self.get_session() as session:
            return session.query(Task).filter(Task.project_id == project_id).all()

    def update_task_status(self, task_id, new_status):
        logger.info(f"Updating task status: task_id: {task_id}, new_status: {new_status}")
        with self.get_session() as session:
            task = session.query(Task).filter(Task.id == task_id).first()
            if task:
                task.status = new_status
                session.commit()
                logger.info(f"Task status updated: {task_id}")
                return task
            logger.warning(f"Task not found: {task_id}")
            return None

    # Knowledge operations
    def create_knowledge(self, content, tags, model, user_id):
        logger.info(f"Creating knowledge entry for user_id: {user_id}")
        with self.get_session() as session:
            new_knowledge = Knowledge(content=content, tags=tags, model=model, user_id=user_id)
            session.add(new_knowledge)
            session.commit()
            logger.info(f"Knowledge entry created: {new_knowledge.id}")
            return new_knowledge

    def get_knowledge_entries(self, user_id):
        logger.info(f"Fetching knowledge entries for user_id: {user_id}")
        with self.get_session() as session:
            return session.query(Knowledge).filter(Knowledge.user_id == user_id).all()

    def search_knowledge(self, query, user_id):
        logger.info(f"Searching knowledge entries: query: {query}, user_id: {user_id}")
        with self.get_session() as session:
            return session.query(Knowledge).filter(
                Knowledge.user_id == user_id,
                Knowledge.content.ilike(f'%{query}%')
            ).all()

    def add_knowledge_to_project(self, knowledge_id, project_id):
        logger.info(f"Adding knowledge to project: knowledge_id: {knowledge_id}, project_id: {project_id}")
        with self.get_session() as session:
            knowledge = session.query(Knowledge).filter(Knowledge.id == knowledge_id).first()
            project = session.query(Project).filter(Project.id == project_id).first()
            if knowledge and project:
                project.knowledge.append(knowledge)
                session.commit()
                logger.info(f"Knowledge added to project: knowledge_id: {knowledge_id}, project_id: {project_id}")
                return True
            logger.warning(f"Failed to add knowledge to project: knowledge_id: {knowledge_id}, project_id: {project_id}")
            return False

    # MongoDB operations
    def create_document(self, collection_name, document):
        logger.info(f"Creating document in MongoDB collection: {collection_name}")
        collection = self.mongo_db[collection_name]
        result = collection.insert_one(document)
        logger.info(f"Document created in MongoDB: {result.inserted_id}")
        return result.inserted_id

    def get_documents(self, collection_name, query=None):
        logger.info(f"Fetching documents from MongoDB collection: {collection_name}")
        collection = self.mongo_db[collection_name]
        return list(collection.find(query or {}))

    # Azure Cosmos DB operations
    def create_cosmos_item(self, item):
        logger.info(f"Creating item in Cosmos DB")
        return self.cosmos_db.create_item(item)

    def get_cosmos_item(self, item_id, partition_key):
        logger.info(f"Fetching item from Cosmos DB: item_id: {item_id}")
        return self.cosmos_db.read_item(item_id, partition_key)

    def query_cosmos_items(self, query, parameters=None):
        logger.info(f"Querying items from Cosmos DB")
        return self.cosmos_db.query_items(query, parameters)

    def update_cosmos_item(self, item_id, updated_item):
        logger.info(f"Updating item in Cosmos DB: item_id: {item_id}")
        return self.cosmos_db.update_item(item_id, updated_item)

    def delete_cosmos_item(self, item_id, partition_key):
        logger.info(f"Deleting item from Cosmos DB: item_id: {item_id}")
        return self.cosmos_db.delete_item(item_id, partition_key)

# Initialize the database manager
db_manager = DatabaseManager()
logger.info("DatabaseManager initialized")