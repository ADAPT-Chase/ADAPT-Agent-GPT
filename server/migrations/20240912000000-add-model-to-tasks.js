'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tasks', 'model', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'gpt-3.5-turbo'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tasks', 'model');
  }
};