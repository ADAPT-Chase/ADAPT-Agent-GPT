# ADAPT-Agent-GPT Server

This is the backend server for the ADAPT-Agent-GPT project. It's built with Node.js, Express, and Sequelize ORM, and uses PostgreSQL as the database.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up your environment variables by creating a `.env` file in the server directory. Use the `.env.example` file as a template.

3. Set up your local PostgreSQL database:
   - Create a database named `adapt_agent_gpt_db`
   - Update the `.env` file with your database credentials

4. Run migrations:
   ```
   npx sequelize-cli db:migrate
   ```

## Running the Server

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

## Migrating to Google Cloud Platform (GCP)

1. Set up a Google Cloud SQL PostgreSQL instance.

2. Update your `.env` file with the GCP database connection details.

3. Run the migration script:
   ```
   npm run migrate:gcp
   ```

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

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.