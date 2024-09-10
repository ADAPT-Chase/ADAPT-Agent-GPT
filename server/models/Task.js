const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Failed'),
      defaultValue: 'Pending'
    }
  }, {
    timestamps: true,
    underscored: true
  });

  Task.associate = (models) => {
    Task.belongsTo(models.Project, { foreignKey: 'project_id', as: 'project' });
    Task.belongsTo(models.Agent, { foreignKey: 'assigned_agent_id', as: 'assigned_agent' });
    Task.belongsToMany(models.Knowledge, { 
      through: 'TaskKnowledge',
      foreignKey: 'task_id',
      otherKey: 'knowledge_id',
      as: 'related_knowledge'
    });
  };

  return Task;
};