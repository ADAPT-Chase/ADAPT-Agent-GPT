const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');
const { REDIS_URL } = require('../config/config')[process.env.NODE_ENV || 'development'];

const redisClient = redis.createClient(REDIS_URL);

const rateLimitMiddleware = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use the user's ID as the key if available, otherwise use IP
    return req.user ? req.user.id : req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.'
      }
    });
  }
});

module.exports = rateLimitMiddleware;