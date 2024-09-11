#!/bin/bash

# Set variables
PROJECT_ID="adapt-434803"
REGION="us-central1"
INSTANCE_NAME="adapt-gpt-instance"
SERVICE_ACCOUNT="adapt-gcp-service-admin-cr@adapt-434803.iam.gserviceaccount.com"

# Export the current database
echo "Exporting the current database..."
bash /home/x/ADAPT/TeamComm/export_database.sh

# Upload the exported database to Google Cloud Storage
echo "Uploading database export to Google Cloud Storage..."
gsutil cp /home/x/ADAPT/adaptdb_export.sql gs://$PROJECT_ID-db-backups/

# Import the database to Cloud SQL
echo "Importing the database to Cloud SQL..."
bash /home/x/ADAPT/TeamComm/import_database_to_gcp.sh

# Build and push the Docker image
echo "Building and pushing Docker image..."
docker build -t gcr.io/$PROJECT_ID/adapt-gpt-server .
docker push gcr.io/$PROJECT_ID/adapt-gpt-server

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $INSTANCE_NAME \
  --image gcr.io/$PROJECT_ID/adapt-gpt-server \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --service-account $SERVICE_ACCOUNT \
  --set-env-vars "$(cat .env | xargs)"

echo "Deployment completed successfully!"