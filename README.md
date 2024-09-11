# ADAPT-Agent-GPT

ADAPT-Agent-GPT is an advanced AI agent platform integrated with ADAPT-Agent-System. It provides a powerful, scalable, and flexible environment for developing and deploying AI agents.

## Features

- Full-stack application with Node.js backend and React frontend
- Integration with ADAPT-Agent-System for enhanced AI capabilities
- Deployment ready for Google Cloud Platform (GCP)
- Scalable database solution using PostgreSQL
- Real-time communication with Socket.IO
- API documentation with Swagger
- Containerization with Docker
- Continuous Integration and Deployment (CI/CD) with GitHub Actions

## Prerequisites

- Node.js (v20 or later)
- Python (v3.9 or later)
- PostgreSQL
- Google Cloud SDK (for deployment)
- Docker (for containerization)

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ADAPT-Agent-GPT.git
   cd ADAPT-Agent-GPT
   ```

2. Install dependencies for the server:
   ```
   cd server
   npm install
   ```

3. Install dependencies for the client:
   ```
   cd ../client
   npm install
   ```

4. Set up your environment variables by creating a `.env` file in the server directory. Use the `.env.example` file as a template.

5. Set up your GCP project and update the `.env` file with your GCP configurations.

6. Run database migrations:
   ```
   cd ../server
   npm run migrate
   ```

## Running the Integrated Platform

To run the entire ADAPT platform (including ADAPT-Agent-GPT and ADAPT-Agent-System):

```
python run_adapt_platform.py
```

This script will start the server, client, and ADAPT-Agent-System components.

## Development

For development, you can run the server and client separately:

1. Start the server:
   ```
   cd server
   npm run dev
   ```

2. Start the client:
   ```
   cd client
   npm start
   ```

## Testing

Run tests for the server:
```
cd server
npm test
```

## Deployment to Google Cloud Platform (GCP)

The deployment process has been updated to allow for partial deployments, which is useful when dealing with rate limits or when you want to deploy specific components.

1. Make sure you have authenticated with Google Cloud:
   ```
   gcloud auth login
   ```

2. Navigate to the server directory:
   ```
   cd server
   ```

3. Deploy using one of the following options:

   - To deploy everything:
     ```
     ./deploy_to_gcp.sh --all
     ```

   - To deploy only the database:
     ```
     ./deploy_to_gcp.sh --db
     ```

   - To deploy only the application:
     ```
     ./deploy_to_gcp.sh --app
     ```

   - To set up only the secrets:
     ```
     ./deploy_to_gcp.sh --secrets
     ```

   You can also combine options, for example:
   ```
   ./deploy_to_gcp.sh --db --app
   ```

This new deployment process allows for more flexibility and helps manage rate limits by allowing you to deploy components separately.

## Migrating Data to GCP

To migrate your local data to GCP:

1. Ensure your GCP configurations are correctly set in the `.env` file.

2. Run the migration script:
   ```
   npm run migrate:gcp
   ```

The migration script now includes throttling to respect GCP rate limits.

## Documentation

- API documentation is available at `/api-docs` when the server is running.
- For more detailed information about the server, client, or ADAPT-Agent-System, refer to their respective README files.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- ADAPT-Agent-System team for their collaboration and integration support.
- All contributors who have helped shape and improve this project.