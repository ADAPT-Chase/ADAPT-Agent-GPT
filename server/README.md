# ADAPT-Agent-GPT Server

This is the backend server for the ADAPT-Agent-GPT project, integrated with ADAPT-Agent-System. It's built with Node.js, Express, and Sequelize ORM, and uses PostgreSQL as the database. The server is configured to work with Google Cloud Platform (GCP) services.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up your environment variables by creating a `.env` file in the server directory. Use the `.env.example` file as a template.

3. Set up your GCP project:
   - Create a new GCP project or use an existing one
   - Enable the necessary APIs (Cloud SQL, Cloud Memorystore, Firestore, Vertex AI, Secret Manager)
   - Set up a Cloud SQL PostgreSQL instance
   - Set up a Cloud Memorystore Redis instance
   - Create a Firestore database
   - Set up Vertex AI

4. Update the `.env` file with your GCP configurations.

5. Run migrations:
   ```
   npm run migrate
   ```

## Running the Server Locally

To start the server in development mode:
```
npm run dev
```

For production:
```
npm start
```

## Testing

Run tests with:
```
npm test
```

## Deploying to Google Cloud Platform (GCP)

1. Install the Google Cloud SDK and initialize it:
   ```
   gcloud init
   ```

2. Authenticate with Google Cloud:
   ```
   gcloud auth login
   ```

3. Set up GCP secrets:
   ```
   ./setup_gcp_secrets.sh
   ```

4. Deploy the application:
   ```
   ./deploy_to_gcp.sh
   ```

This script will:
- Set up environment variables
- Set up secrets in Google Cloud Secret Manager
- Build and push a Docker image to Google Container Registry
- Deploy the application to Cloud Run
- Run database migrations

## Migrating Data to GCP

To migrate your local data to GCP:

1. Ensure your GCP configurations are correctly set in the `.env` file.

2. Run the migration script:
   ```
   npm run migrate:gcp
   ```

## CI/CD

The project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/ci-cd.yml`. It runs tests on every push and pull request, and deploys to GCP on pushes to the main branch.

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Project Structure

- `config/`: Configuration files
- `middleware/`: Custom middleware functions
- `migrations/`: Database migration files
- `models/`: Sequelize model definitions
- `routes/`: API route definitions
- `tests/`: Test files
- `server.js`: Main application file
- `migrateToGCP.js`: Script for migrating data to GCP
- `deploy_to_gcp.sh`: Script for deploying to GCP
- `setup_gcp_secrets.sh`: Script for setting up GCP secrets
- `Dockerfile`: Docker configuration for the application
- `app.yaml`: Google App Engine configuration
- `secret_manager.yaml`: Secret Manager configuration

## GCP Services Used

- Cloud SQL: PostgreSQL database
- Cloud Memorystore: Redis for caching
- Firestore: NoSQL database for certain data types
- Vertex AI: For machine learning capabilities
- Cloud Run: For hosting the application
- Secret Manager: For managing sensitive information
- Container Registry: For storing Docker images

## Integration with ADAPT-Agent-System

This server is integrated with ADAPT-Agent-System. The integration allows for shared database access and unified deployment. Refer to the `shared_config.json` file for shared configuration details.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.