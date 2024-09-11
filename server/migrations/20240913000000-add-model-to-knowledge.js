'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Knowledge', 'model', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'gpt-3.5-turbo'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Knowledge', 'model');
  }
};