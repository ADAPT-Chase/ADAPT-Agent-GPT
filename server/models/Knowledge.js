const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Knowledge extends Model {
    static associate(models) {
      Knowledge.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
      Knowledge.belongsTo(models.Agent, { foreignKey: 'agentId', as: 'agent' });
      Knowledge.belongsTo(models.User, { foreignKey: 'contributorId', as: 'contributor' });
    }
  }
  
  Knowledge.init({
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Agents',
        key: 'id'
      }
    },
    contributorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    source: DataTypes.STRING,
    type: {
      type: DataTypes.ENUM('document', 'code', 'conversation', 'custom'),
      allowNull: false
    },
    metadata: DataTypes.JSONB,
    vectorEmbedding: DataTypes.ARRAY(DataTypes.FLOAT),
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1.0
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Knowledge',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Knowledge',
    timestamps: true,
    underscored: true
  });
  
  return Knowledge;
};