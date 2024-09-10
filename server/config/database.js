const { Sequelize } = require('sequelize');
const { DATABASE_URL } = require('./gcp_config');

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false // Set to console.log to see the raw SQL queries
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('../models/User')(sequelize, Sequelize);
db.Task = require('../models/Task')(sequelize, Sequelize);
db.Agent = require('../models/Agent')(sequelize, Sequelize);
db.Project = require('../models/Project')(sequelize, Sequelize);
db.Knowledge = require('../models/Knowledge')(sequelize, Sequelize);

// Define associations
db.User.hasMany(db.Task, { foreignKey: 'userId' });
db.Task.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Project, { foreignKey: 'userId' });
db.Project.belongsTo(db.User, { foreignKey: 'userId' });

db.Project.hasMany(db.Agent, { foreignKey: 'projectId' });
db.Agent.belongsTo(db.Project, { foreignKey: 'projectId' });

db.Project.hasMany(db.Knowledge, { foreignKey: 'projectId' });
db.Knowledge.belongsTo(db.Project, { foreignKey: 'projectId' });

db.Agent.hasMany(db.Knowledge, { foreignKey: 'agentId' });
db.Knowledge.belongsTo(db.Agent, { foreignKey: 'agentId' });

module.exports = db;