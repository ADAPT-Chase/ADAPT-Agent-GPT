#!/bin/bash

# Enable Secret Manager API
echo "Enabling Secret Manager API..."
gcloud services enable secretmanager.googleapis.com

# Check if .env file exists
if [ ! -f .env ]; then
    echo ".env file not found. Please create it with your environment variables."
    exit 1
fi

# Read .env file and create secrets
while IFS='=' read -r key value
do
    # Ignore comments and empty lines
    if [[ ! $key =~ ^#.*$ ]] && [ ! -z "$key" ]; then
        # Remove any surrounding quotes from the value
        value=$(echo $value | sed -e 's/^"//' -e 's/"$//')
        
        echo "Creating secret for $key"
        gcloud secrets create $key --replication-policy="automatic"
        echo -n "$value" | gcloud secrets versions add $key --data-file=-
    fi
done < .env

echo "All secrets have been created in Google Cloud Secret Manager."