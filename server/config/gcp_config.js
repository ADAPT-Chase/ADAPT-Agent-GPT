require('dotenv').config();

async function getGcpConfig() {
  if (process.env.NODE_ENV === 'development') {
    return {
      DATABASE_URL: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      REDIS_URL: 'redis://localhost:6379',
      GCP_PROJECT_ID: 'development',
      GCP_REGION: 'development',
      CLOUD_SQL_INSTANCE_NAME: 'development',
      CLOUD_SQL_DATABASE_NAME: process.env.DB_NAME,
      CLOUD_SQL_USER: process.env.DB_USER,
      CLOUD_SQL_PASSWORD: process.env.DB_PASSWORD,
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      FIRESTORE_COLLECTION: 'development',
      VERTEX_AI_ENDPOINT: 'development'
    };
  }

  // Production GCP configuration (unchanged)
  const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
  const secretClient = new SecretManagerServiceClient();

  async function accessSecret(secretName) {
    try {
      const [version] = await secretClient.accessSecretVersion({
        name: `projects/${process.env.GCP_PROJECT_ID}/secrets/${secretName}/versions/latest`,
      });
      return version.payload.data.toString();
    } catch (error) {
      console.error(`Error accessing secret ${secretName}:`, error);
      return null;
    }
  }

  const [
    GCP_PROJECT_ID,
    GCP_REGION,
    CLOUD_SQL_INSTANCE_NAME,
    CLOUD_SQL_DATABASE_NAME,
    CLOUD_SQL_USER,
    CLOUD_SQL_PASSWORD,
    REDIS_HOST,
    REDIS_PORT,
    FIRESTORE_COLLECTION,
    VERTEX_AI_ENDPOINT
  ] = await Promise.all([
    accessSecret('GCP_PROJECT_ID'),
    accessSecret('GCP_REGION'),
    accessSecret('CLOUD_SQL_INSTANCE_NAME'),
    accessSecret('CLOUD_SQL_DATABASE_NAME'),
    accessSecret('CLOUD_SQL_USER'),
    accessSecret('CLOUD_SQL_PASSWORD'),
    accessSecret('REDIS_HOST'),
    accessSecret('REDIS_PORT'),
    accessSecret('FIRESTORE_COLLECTION'),
    accessSecret('VERTEX_AI_ENDPOINT')
  ]);

  const DATABASE_URL = `postgresql://${CLOUD_SQL_USER}:${CLOUD_SQL_PASSWORD}@/${CLOUD_SQL_DATABASE_NAME}?host=/cloudsql/${GCP_PROJECT_ID}:${GCP_REGION}:${CLOUD_SQL_INSTANCE_NAME}`;
  const REDIS_URL = `redis://${REDIS_HOST}:${REDIS_PORT}`;

  return {
    GCP_PROJECT_ID,
    GCP_REGION,
    CLOUD_SQL_INSTANCE_NAME,
    CLOUD_SQL_DATABASE_NAME,
    CLOUD_SQL_USER,
    CLOUD_SQL_PASSWORD,
    REDIS_HOST,
    REDIS_PORT,
    FIRESTORE_COLLECTION,
    VERTEX_AI_ENDPOINT,
    DATABASE_URL,
    REDIS_URL
  };
}

module.exports = getGcpConfig;