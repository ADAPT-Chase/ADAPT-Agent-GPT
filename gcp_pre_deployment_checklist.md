# GCP Pre-Deployment Checklist

Before deploying ADAPT-Agent-GPT to Google Cloud Platform (GCP), ensure you have completed the following steps:

## GCP Project Setup

- [ ] Create a new GCP project or select an existing one
- [ ] Enable billing for the project
- [ ] Note down the Project ID

## API Enablement

Enable the following APIs in your GCP project:

- [ ] Cloud SQL Admin API
- [ ] Cloud Run API
- [ ] Cloud Build API
- [ ] Vertex AI API
- [ ] Firestore API
- [ ] Secret Manager API

## Service Account and Permissions

- [ ] Create a new service account for ADAPT-Agent-GPT
- [ ] Grant the following roles to the service account:
  - [ ] Cloud SQL Admin
  - [ ] Cloud Run Admin
  - [ ] Secret Manager Admin
  - [ ] Storage Admin
  - [ ] Vertex AI User
  - [ ] Firestore User
- [ ] Generate and download a JSON key for the service account

## Database Setup

- [ ] Create a Cloud SQL PostgreSQL instance
- [ ] Note down the instance connection name
- [ ] Create a database for ADAPT-Agent-GPT
- [ ] Create a database user and set a strong password

## Environment Variables

Ensure the following environment variables are set in your `.env` file:

- [ ] GCP_PROJECT_ID
- [ ] GCP_REGION
- [ ] CLOUD_SQL_INSTANCE_NAME
- [ ] DB_NAME
- [ ] DB_USER
- [ ] DB_PASSWORD
- [ ] REDIS_HOST (if using Cloud Memorystore)
- [ ] REDIS_PORT
- [ ] FIRESTORE_COLLECTION
- [ ] VERTEX_AI_ENDPOINT

## Secrets

- [ ] Run the `setup_gcp_secrets.sh` script to set up secrets in Secret Manager

## Configuration Files

- [ ] Update `shared_config.json` with correct GCP settings
- [ ] Verify `config/gcp_config.js` is correctly configured

## Testing

- [ ] Run `node testGcpConnection.js` to verify GCP connections

## Deployment Preparation

- [ ] Review and update `app.yaml` if necessary
- [ ] Ensure `Dockerfile` is correctly configured
- [ ] Review `deploy_to_gcp.sh` script and make any necessary adjustments

## Final Checks

- [ ] All required dependencies are listed in `package.json`
- [ ] `.gitignore` is updated to exclude sensitive files
- [ ] README.md is up-to-date with deployment instructions

Once you have completed all items on this checklist, you should be ready to deploy ADAPT-Agent-GPT to Google Cloud Platform using the `deploy_to_gcp.sh` script.