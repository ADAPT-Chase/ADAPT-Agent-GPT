const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

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

// Start server
const PORT = process.env.PORT || 5001;

function startServer(address) {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, address, () => {
      console.log(`Server is running on ${address === '::' ? 'IPv6' : 'IPv4'}: http://${address === '::' ? '[::1]' : 'localhost'}:${PORT}`);
      resolve(server);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Address ${address}:${PORT} is already in use, skipping...`);
        resolve(null);
      } else {
        reject(error);
      }
    });
  });
}

async function startServers() {
  try {
    const server4 = await startServer('0.0.0.0');
    const server6 = await startServer('::');

    [server4, server6].forEach(server => {
      if (server) {
        server.on('error', (error) => {
          console.error('Server error:', error);
        });
      }
    });
  } catch (error) {
    console.error('Error starting servers:', error);
  }
}

startServers();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});