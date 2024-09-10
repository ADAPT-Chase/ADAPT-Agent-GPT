const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const agentRoutes = require('./routes/agents');
const projectRoutes = require('./routes/projects');
const knowledgeRoutes = require('./routes/knowledge');
const { sequelize } = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger');
const { setupMetrics } = require('./metrics');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Setup Prometheus metrics
setupMetrics(app);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();

module.exports = app; // For testing purposes