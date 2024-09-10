'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Projects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      owner_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    await queryInterface.addIndex('Projects', ['name']);
    await queryInterface.addIndex('Projects', ['owner_id']);
    
    // Add full-text search index
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_project_search ON "Projects" USING gin(to_tsvector('english', "name" || ' ' || "description"));
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Projects');
  }
};