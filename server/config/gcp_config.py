import os
from google.cloud import secretmanager

# GCP Project configuration
GCP_PROJECT_ID = os.environ.get('GCP_PROJECT_ID')
GCP_REGION = os.environ.get('GCP_REGION', 'us-central1')

# Cloud SQL (PostgreSQL) configuration
CLOUD_SQL_INSTANCE_NAME = os.environ.get('CLOUD_SQL_INSTANCE_NAME')
CLOUD_SQL_DATABASE_NAME = os.environ.get('CLOUD_SQL_DATABASE_NAME')
CLOUD_SQL_USER = os.environ.get('CLOUD_SQL_USER')
CLOUD_SQL_PASSWORD = os.environ.get('CLOUD_SQL_PASSWORD')

# Cloud Memorystore (Redis) configuration
REDIS_HOST = os.environ.get('REDIS_HOST')
REDIS_PORT = os.environ.get('REDIS_PORT', 6379)

# Cloud Firestore configuration
FIRESTORE_COLLECTION = os.environ.get('FIRESTORE_COLLECTION', 'adapt_agent_data')

# Vertex AI configuration
VERTEX_AI_ENDPOINT = os.environ.get('VERTEX_AI_ENDPOINT')

def get_secret(secret_id):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{GCP_PROJECT_ID}/secrets/{secret_id}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")

# Use Secret Manager for sensitive information
if not CLOUD_SQL_PASSWORD:
    CLOUD_SQL_PASSWORD = get_secret('cloud-sql-password')

# Database URL for SQLAlchemy
DATABASE_URL = f"postgresql://{CLOUD_SQL_USER}:{CLOUD_SQL_PASSWORD}@/{CLOUD_SQL_DATABASE_NAME}?host=/cloudsql/{GCP_PROJECT_ID}:{GCP_REGION}:{CLOUD_SQL_INSTANCE_NAME}"

# Redis URL
REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}"

# Firestore client initialization
from google.cloud import firestore
db = firestore.Client(project=GCP_PROJECT_ID)

# Vertex AI client initialization
from google.cloud import aiplatform
aiplatform.init(project=GCP_PROJECT_ID, location=GCP_REGION)