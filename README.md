# ADAPT Agent GPT

ADAPT Agent GPT is an AI-powered project management and knowledge base system that integrates task tracking, project analysis, and intelligent querying capabilities.

## Features

- User authentication and authorization
- Project management
- Task tracking with AI-assisted task creation
- Knowledge base with AI-powered search and retrieval
- AI agent for answering queries and providing project insights

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm 6+
- SQLite (or PostgreSQL if preferred)
- OpenAI API key

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ADAPT-Agent-GPT.git
   cd ADAPT-Agent-GPT
   ```

2. Set up the backend:
   ```
   cd server
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   pip install -r ../requirements.txt
   ```

3. Create a `.env` file in the `server` directory with the following content:
   ```
   DATABASE_URL=sqlite:///./adapt_agent_gpt.db
   OPENAI_API_KEY=your_openai_api_key_here
   SECRET_KEY=your_secret_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```
   Replace `your_openai_api_key_here` with your actual OpenAI API key, and `your_secret_key_here` with a secure random string.

4. Set up the database:
   ```
   python database_setup.py
   ```

5. Start the backend server:
   ```
   python ../main.py
   ```

6. Set up the frontend:
   ```
   cd ../client
   npm install
   ```

7. Start the frontend development server:
   ```
   npm start
   ```

8. Open your browser and navigate to `http://localhost:3000` to use ADAPT Agent GPT.

## Usage

1. Register a new account or log in with existing credentials.
2. Create a new project or explore existing ones.
3. Add tasks to your projects, optionally using AI assistance for task creation.
4. Use the knowledge base to store and retrieve important information.
5. Interact with the AI agent to get answers to your questions or analyze your projects.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- OpenAI for providing the GPT models
- The FastAPI and React communities for their excellent frameworks and documentation
