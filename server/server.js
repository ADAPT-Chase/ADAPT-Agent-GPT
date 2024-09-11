'use strict';

const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const Redis = require('ioredis');
const { Firestore } = require('@google-cloud/firestore');
const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const {
  DATABASE_URL,
  REDIS_URL,
  GCP_PROJECT_ID,
  FIRESTORE_COLLECTION
} = require('./config/gcp_config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Redis setup
const redis = new Redis(REDIS_URL);

// Firestore setup
const firestore = new Firestore({
  projectId: GCP_PROJECT_ID,
});

// Vertex AI setup
const vertexAI = new PredictionServiceClient();

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.error('Error connecting to database:', err));

// Routes
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const agentRoutes = require('./routes/agents');
const projectRoutes = require('./routes/projects');
const knowledgeRoutes = require('./routes/knowledge');

app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;