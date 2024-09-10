const { Sequelize } = require('sequelize');
const { DATABASE_URL } = require('./config/gcp_config');
const db = require('./config/database');

// Local database configuration
const localDb = new Sequelize('adapt_agent_gpt_db', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres'
});

// GCP database configuration
const gcpDb = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function migrateData() {
  try {
    // Test connections
    await localDb.authenticate();
    console.log('Connected to local database.');
    await gcpDb.authenticate();
    console.log('Connected to GCP database.');

    // Migrate Users
    const users = await db.User.findAll();
    for (const user of users) {
      await gcpDb.models.User.create(user.toJSON());
    }
    console.log('Users migrated successfully.');

    // Migrate Projects
    const projects = await db.Project.findAll();
    for (const project of projects) {
      await gcpDb.models.Project.create(project.toJSON());
    }
    console.log('Projects migrated successfully.');

    // Migrate Agents
    const agents = await db.Agent.findAll();
    for (const agent of agents) {
      await gcpDb.models.Agent.create(agent.toJSON());
    }
    console.log('Agents migrated successfully.');

    // Migrate Tasks
    const tasks = await db.Task.findAll();
    for (const task of tasks) {
      await gcpDb.models.Task.create(task.toJSON());
    }
    console.log('Tasks migrated successfully.');

    // Migrate Knowledge
    const knowledge = await db.Knowledge.findAll();
    for (const item of knowledge) {
      await gcpDb.models.Knowledge.create(item.toJSON());
    }
    console.log('Knowledge migrated successfully.');

    console.log('All data migrated successfully.');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await localDb.close();
    await gcpDb.close();
  }
}

migrateData();