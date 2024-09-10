const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Agent extends Model {
    static associate(models) {
      Agent.belongsTo(models.User, { foreignKey: 'owner_id', as: 'owner' });
      Agent.hasMany(models.Task, { foreignKey: 'assigned_agent_id', as: 'tasks' });
      Agent.hasMany(models.Knowledge, { foreignKey: 'agentId', as: 'knowledge_acquired' });
    }
  }

  Agent.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'learning', 'error'),
      defaultValue: 'inactive'
    },
    last_active: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Agent',
    timestamps: true,
    underscored: true
  });

  return Agent;
};