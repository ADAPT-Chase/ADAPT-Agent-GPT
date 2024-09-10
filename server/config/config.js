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

async function getGcpConfig() {
  return {
    dialect: 'postgres',
    host: await accessSecret('postgres-host') || process.env.DB_HOST,
    port: await accessSecret('postgres-port') || process.env.DB_PORT,
    username: await accessSecret('postgres-user') || process.env.DB_USER,
    password: await accessSecret('postgres-password') || process.env.DB_PASSWORD,
    database: await accessSecret('postgres-database') || process.env.DB_NAME,
    dialectOptions: {
      socketPath: process.env.DB_SOCKET_PATH ? `${process.env.DB_SOCKET_PATH}/${process.env.CLOUD_SQL_CONNECTION_NAME}` : undefined,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  };
}

const config = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER || 'adapt_user',
    password: process.env.DB_PASSWORD || 'adapt_password',
    database: process.env.DB_NAME || 'adaptdb',
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:'
  },
  production: {
    dialect: 'postgres',
    use_env_variable: 'DATABASE_URL',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  gcp: getGcpConfig()
};

module.exports = config;