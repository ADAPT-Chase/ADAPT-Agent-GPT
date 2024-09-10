const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    underscored: true
  });

  Project.associate = (models) => {
    Project.belongsTo(models.User, { foreignKey: 'owner_id', as: 'owner' });
    Project.hasMany(models.Task, { foreignKey: 'project_id', as: 'tasks' });
    Project.hasMany(models.Knowledge, { foreignKey: 'projectId', as: 'knowledge' });
  };

  return Project;
};