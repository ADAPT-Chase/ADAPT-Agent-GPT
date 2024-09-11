'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Indexes for Users table
    await queryInterface.addIndex('Users', ['email'], {
      name: 'users_email_index',
      unique: true
    });

    await queryInterface.addIndex('Users', ['username'], {
      name: 'users_username_index',
      unique: true
    });

    // Indexes for Tasks table
    await queryInterface.addIndex('Tasks', ['project_id'], {
      name: 'tasks_project_id_index'
    });

    await queryInterface.addIndex('Tasks', ['assigned_agent_id'], {
      name: 'tasks_assigned_agent_id_index'
    });

    await queryInterface.addIndex('Tasks', ['status'], {
      name: 'tasks_status_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Users', 'users_email_index');
    await queryInterface.removeIndex('Users', 'users_username_index');
    await queryInterface.removeIndex('Tasks', 'tasks_project_id_index');
    await queryInterface.removeIndex('Tasks', 'tasks_assigned_agent_id_index');
    await queryInterface.removeIndex('Tasks', 'tasks_status_index');
  }
};
