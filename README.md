# ADAPT Agent GPT

ADAPT Agent GPT is a sophisticated AI-powered platform that integrates multiple databases and AI capabilities to provide a comprehensive solution for project management, task tracking, and knowledge management.

## Features

- User authentication and authorization
- Project management
- Task tracking
- Knowledge base with vector search capabilities
- AI-powered agent for various tasks

## Technology Stack

- Backend: FastAPI
- Frontend: React
- Databases:
  - PostgreSQL (relational data)
  - MongoDB (document storage)
  - Redis (caching)
  - Pinecone (vector database)
  - AWS DynamoDB (user data)
- AI: OpenAI GPT models

## Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL
- MongoDB
- Redis
- Pinecone account
- AWS account with DynamoDB access

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-repo/adapt-agent-gpt.git
   cd adapt-agent-gpt
   ```

2. Set up a virtual environment and install dependencies:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Create a `.env` file in the `server` directory with the following content:
   ```
   SECRET_KEY=your_secret_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL=postgresql://user:password@localhost/adapt_agent_gpt
   MONGO_URL=mongodb://localhost:27017
   MONGO_DB_NAME=adapt_agent_gpt
   REDIS_URL=redis://localhost:6379
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_ENVIRONMENT=your_pinecone_environment_here
   PINECONE_INDEX_NAME=your_pinecone_index_name_here
   AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
   AWS_REGION=your_aws_region_here
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

4. Initialize the databases:
   ```
   python server/database_setup.py
   ```

5. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

6. Set up the frontend:
   ```
   cd client
   npm install
   ```

7. Start the frontend development server:
   ```
   npm start
   ```

## Usage

Access the application by navigating to `http://localhost:3000` in your web browser. You can create an account, log in, and start using the various features of the ADAPT Agent GPT platform.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for their GPT models
- FastAPI for the efficient backend framework
- React for the responsive frontend library
- All the database providers for their powerful storage solutions
