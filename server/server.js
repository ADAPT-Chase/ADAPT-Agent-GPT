const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const errorHandler = require('./middleware/errorHandler');
const sequelize = require('./config/database');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
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

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Add more socket event handlers here
});

// Start server
const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await sequelize.sync();
    console.log('Database synced');

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

module.exports = { app, server, io }; // Export for testing