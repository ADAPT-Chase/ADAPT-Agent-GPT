'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the table already exists
    const tableExists = await queryInterface.sequelize.query(
      "SELECT to_regclass('public.Projects') IS NOT NULL AS exists",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!tableExists[0].exists) {
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
    }
    
    // Check if the full-text search index exists before creating it
    const [results] = await queryInterface.sequelize.query(
      "SELECT to_regclass('public.idx_project_search') IS NOT NULL AS exists"
    );
    const indexExists = results[0].exists;

    if (!indexExists) {
      // Add full-text search index
      await queryInterface.sequelize.query(`
        CREATE INDEX idx_project_search ON "Projects" USING gin(to_tsvector('english', "name" || ' ' || COALESCE("description", '')));
      `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Projects');
  }
};