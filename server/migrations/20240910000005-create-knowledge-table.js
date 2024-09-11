'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Knowledge', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      projectId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Projects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      agentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Agents',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      source: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM('document', 'code', 'conversation', 'custom'),
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB
      },
      vectorEmbedding: {
        type: Sequelize.ARRAY(Sequelize.FLOAT)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('Knowledge', ['projectId']);
    await queryInterface.addIndex('Knowledge', ['agentId']);
    await queryInterface.addIndex('Knowledge', ['type']);
    await queryInterface.addIndex('Knowledge', ['title']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Knowledge');
  }
};