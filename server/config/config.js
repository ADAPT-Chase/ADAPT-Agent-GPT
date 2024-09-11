const getGcpConfig = require('./gcp_config');

module.exports = async () => {
  const gcpConfig = await getGcpConfig();

  return {
    development: {
      username: gcpConfig.CLOUD_SQL_USER,
      password: gcpConfig.CLOUD_SQL_PASSWORD,
      database: gcpConfig.CLOUD_SQL_DATABASE_NAME,
      host: gcpConfig.CLOUD_SQL_INSTANCE_NAME,
      dialect: 'postgres',
      dialectOptions: {
        socketPath: `/cloudsql/${gcpConfig.GCP_PROJECT_ID}:${gcpConfig.GCP_REGION}:${gcpConfig.CLOUD_SQL_INSTANCE_NAME}`
      }
    },
    test: {
      username: gcpConfig.CLOUD_SQL_USER,
      password: gcpConfig.CLOUD_SQL_PASSWORD,
      database: gcpConfig.CLOUD_SQL_DATABASE_NAME,
      host: gcpConfig.CLOUD_SQL_INSTANCE_NAME,
      dialect: 'postgres',
      dialectOptions: {
        socketPath: `/cloudsql/${gcpConfig.GCP_PROJECT_ID}:${gcpConfig.GCP_REGION}:${gcpConfig.CLOUD_SQL_INSTANCE_NAME}`
      }
    },
    production: {
      username: gcpConfig.CLOUD_SQL_USER,
      password: gcpConfig.CLOUD_SQL_PASSWORD,
      database: gcpConfig.CLOUD_SQL_DATABASE_NAME,
      host: gcpConfig.CLOUD_SQL_INSTANCE_NAME,
      dialect: 'postgres',
      dialectOptions: {
        socketPath: `/cloudsql/${gcpConfig.GCP_PROJECT_ID}:${gcpConfig.GCP_REGION}:${gcpConfig.CLOUD_SQL_INSTANCE_NAME}`
      }
    }
  };
};