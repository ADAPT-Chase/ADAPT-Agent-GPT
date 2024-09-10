'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add indexes to Users table
    await queryInterface.addIndex('Users', ['email'], {
      name: 'users_email_index',
      unique: true
    });
    await queryInterface.addIndex('Users', ['username'], {
      name: 'users_username_index',
      unique: true
    });

    // Add indexes to Tasks table
    await queryInterface.addIndex('Tasks', ['userId'], {
      name: 'tasks_userId_index'
    });
    await queryInterface.addIndex('Tasks', ['status'], {
      name: 'tasks_status_index'
    });

    // Add indexes to Agents table
    await queryInterface.addIndex('Agents', ['userId'], {
      name: 'agents_userId_index'
    });
    await queryInterface.addIndex('Agents', ['name'], {
      name: 'agents_name_index'
    });

    // Add indexes to Projects table
    await queryInterface.addIndex('Projects', ['userId'], {
      name: 'projects_userId_index'
    });
    await queryInterface.addIndex('Projects', ['name'], {
      name: 'projects_name_index'
    });

    // Add indexes to Knowledge table
    await queryInterface.addIndex('Knowledge', ['userId'], {
      name: 'knowledge_userId_index'
    });
    await queryInterface.addIndex('Knowledge', ['title'], {
      name: 'knowledge_title_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes from Users table
    await queryInterface.removeIndex('Users', 'users_email_index');
    await queryInterface.removeIndex('Users', 'users_username_index');

    // Remove indexes from Tasks table
    await queryInterface.removeIndex('Tasks', 'tasks_userId_index');
    await queryInterface.removeIndex('Tasks', 'tasks_status_index');

    // Remove indexes from Agents table
    await queryInterface.removeIndex('Agents', 'agents_userId_index');
    await queryInterface.removeIndex('Agents', 'agents_name_index');

    // Remove indexes from Projects table
    await queryInterface.removeIndex('Projects', 'projects_userId_index');
    await queryInterface.removeIndex('Projects', 'projects_name_index');

    // Remove indexes from Knowledge table
    await queryInterface.removeIndex('Knowledge', 'knowledge_userId_index');
    await queryInterface.removeIndex('Knowledge', 'knowledge_title_index');
  }
};
