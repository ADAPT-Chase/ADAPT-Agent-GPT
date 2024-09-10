const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const promBundle = require('express-prom-bundle');
const swaggerSpecs = require('./swagger');
const errorHandler = require('./middleware/errorHandler');
const sequelize = require('./config/database');
const socketHandlers = require('./socketHandlers');
const logger = require('./config/logger');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Prometheus metrics
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { project_name: 'adapt-agent-gpt' },
  promClient: {
    collectDefaultMetrics: {},
  },
});

// Middleware
app.use(metricsMiddleware);
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// API versioning
const apiVersion = '/api/v1';

// Routes
app.use(`${apiVersion}/users`, require('./routes/users'));
app.use(`${apiVersion}/tasks`, require('./routes/tasks'));

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// WebSocket handlers
socketHandlers(io);

// Start server
const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await sequelize.sync();
    logger.info('Database synced');

    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`Metrics available at http://localhost:${PORT}/metrics`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
  }
}

startServer();

// Monitoring
setInterval(() => {
  const used = process.memoryUsage();
  logger.info(`Memory usage: ${JSON.stringify(used)}`);
}, 300000); // Log every 5 minutes

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

module.exports = { app, server, io }; // Export for testing