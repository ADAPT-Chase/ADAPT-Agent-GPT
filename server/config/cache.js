const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

client.on('error', (err) => console.log('Redis Client Error', err));

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const cache = {
  get: async (key) => {
    try {
      const value = await getAsync(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },
  set: async (key, value, expirationInSeconds = 3600) => {
    try {
      await setAsync(key, JSON.stringify(value), 'EX', expirationInSeconds);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },
};

module.exports = cache;