'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('Users', ['email'], {
      name: 'users_email_index',
      unique: true
    });

    await queryInterface.addIndex('Users', ['username'], {
      name: 'users_username_index',
      unique: true
    });

    await queryInterface.addIndex('Tasks', ['userId'], {
      name: 'tasks_userId_index'
    });

    await queryInterface.addIndex('Tasks', ['status'], {
      name: 'tasks_status_index'
    });

    await queryInterface.addIndex('Tasks', ['dueDate'], {
      name: 'tasks_dueDate_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Users', 'users_email_index');
    await queryInterface.removeIndex('Users', 'users_username_index');
    await queryInterface.removeIndex('Tasks', 'tasks_userId_index');
    await queryInterface.removeIndex('Tasks', 'tasks_status_index');
    await queryInterface.removeIndex('Tasks', 'tasks_dueDate_index');
  }
};
