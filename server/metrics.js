const promClient = require('prom-client');

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'adapt-agent-gpt'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // 0.1 to 10 seconds
});

const dbQueryDurationMicroseconds = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5] // 0.01 to 5 seconds
});

const activeUsers = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of active users'
});

const taskCount = new promClient.Gauge({
  name: 'task_count',
  help: 'Number of tasks',
  labelNames: ['status']
});

// Register the custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(dbQueryDurationMicroseconds);
register.registerMetric(activeUsers);
register.registerMetric(taskCount);

module.exports = {
  register,
  httpRequestDurationMicroseconds,
  dbQueryDurationMicroseconds,
  activeUsers,
  taskCount
};