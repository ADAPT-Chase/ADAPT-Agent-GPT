const { Sequelize } = require('sequelize');
const getGcpConfig = require('./config/gcp_config');
require('dotenv').config();

async function migrateData() {
  try {
    const gcpConfig = await getGcpConfig();

    // Local database configuration
    const localDb = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres'
    });

    // GCP database configuration
    const gcpDb = new Sequelize(gcpConfig.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    // Test connections
    await localDb.authenticate();
    console.log('Connected to local database.');
    await gcpDb.authenticate();
    console.log('Connected to GCP database.');

    // Define models for both databases
    const models = ['User', 'Project', 'Agent', 'Task', 'Knowledge'];

    for (const modelName of models) {
      const LocalModel = localDb.define(modelName, require(`./models/${modelName}`)(localDb, Sequelize.DataTypes));
      const GcpModel = gcpDb.define(modelName, require(`./models/${modelName}`)(gcpDb, Sequelize.DataTypes));

      const items = await LocalModel.findAll();
      for (const item of items) {
        await GcpModel.create(item.toJSON());
      }
      console.log(`${modelName}s migrated successfully.`);
    }

    console.log('All data migrated successfully.');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    process.exit();
  }
}

migrateData();