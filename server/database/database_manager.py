import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pymongo import MongoClient
import redis
import pinecone
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.setup_postgresql()
        self.setup_mongodb()
        self.setup_redis()
        self.setup_pinecone()
        self.setup_dynamodb()

    def setup_postgresql(self):
        db_url = os.getenv('DATABASE_URL', 'sqlite:///adapt_agent_gpt.db')
        self.engine = create_engine(db_url)
        self.SessionLocal = sessionmaker(bind=self.engine)

    def setup_mongodb(self):
        mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
        self.mongo_client = MongoClient(mongo_url)
        self.mongo_db = self.mongo_client[os.getenv('MONGO_DB_NAME', 'adapt_agent_gpt')]

    def setup_redis(self):
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        self.redis_client = redis.from_url(redis_url)

    def setup_pinecone(self):
        pinecone.init(
            api_key=os.getenv('PINECONE_API_KEY'),
            environment=os.getenv('PINECONE_ENVIRONMENT')
        )
        self.pinecone_index = pinecone.Index(os.getenv('PINECONE_INDEX_NAME'))

    def setup_dynamodb(self):
        self.dynamodb = boto3.resource(
            'dynamodb',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION')
        )

    # PostgreSQL operations
    def get_db(self):
        db = self.SessionLocal()
        try:
            yield db
        finally:
            db.close()

    # MongoDB operations
    def mongo_insert(self, collection, document):
        return self.mongo_db[collection].insert_one(document)

    def mongo_find(self, collection, query):
        return self.mongo_db[collection].find(query)

    def mongo_update(self, collection, query, update):
        return self.mongo_db[collection].update_one(query, {'$set': update})

    def mongo_delete(self, collection, query):
        return self.mongo_db[collection].delete_one(query)

    # Redis operations
    def redis_set(self, key, value, ex=None):
        return self.redis_client.set(key, value, ex=ex)

    def redis_get(self, key):
        return self.redis_client.get(key)

    def redis_delete(self, key):
        return self.redis_client.delete(key)

    # Pinecone operations
    def vector_upsert(self, vectors):
        return self.pinecone_index.upsert(vectors=vectors)

    def vector_query(self, vector, top_k):
        return self.pinecone_index.query(vector=vector, top_k=top_k)

    def vector_delete(self, ids):
        return self.pinecone_index.delete(ids=ids)

    # DynamoDB operations
    def dynamodb_put_item(self, table_name, item):
        table = self.dynamodb.Table(table_name)
        try:
            response = table.put_item(Item=item)
            return response
        except ClientError as e:
            print(f"Error putting item in DynamoDB: {e.response['Error']['Message']}")
            return None

    def dynamodb_get_item(self, table_name, key):
        table = self.dynamodb.Table(table_name)
        try:
            response = table.get_item(Key=key)
            return response.get('Item')
        except ClientError as e:
            print(f"Error getting item from DynamoDB: {e.response['Error']['Message']}")
            return None

    def dynamodb_update_item(self, table_name, key, update_expression, expression_attribute_values):
        table = self.dynamodb.Table(table_name)
        try:
            response = table.update_item(
                Key=key,
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_attribute_values,
                ReturnValues="UPDATED_NEW"
            )
            return response.get('Attributes')
        except ClientError as e:
            print(f"Error updating item in DynamoDB: {e.response['Error']['Message']}")
            return None

    def dynamodb_delete_item(self, table_name, key):
        table = self.dynamodb.Table(table_name)
        try:
            response = table.delete_item(Key=key)
            return response
        except ClientError as e:
            print(f"Error deleting item from DynamoDB: {e.response['Error']['Message']}")
            return None

db_manager = DatabaseManager()