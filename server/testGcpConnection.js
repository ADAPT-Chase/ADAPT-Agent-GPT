require('dotenv').config();
const { Sequelize } = require('sequelize');
const getGcpConfig = require('./config/gcp_config');

async function testConnection() {
  try {
    const gcpConfig = getGcpConfig();
    console.log('GCP Config:', gcpConfig);

    const sequelize = new Sequelize(gcpConfig.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    await sequelize.authenticate();
    console.log('Connection to GCP Cloud SQL has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to GCP Cloud SQL:', error);
  }
}

testConnection();