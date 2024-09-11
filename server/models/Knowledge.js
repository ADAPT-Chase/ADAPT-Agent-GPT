const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Knowledge extends Model {
    static associate(models) {
      // define associations here if needed
    }
  }

  Knowledge.init({
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Knowledge',
  });

  return Knowledge;
};