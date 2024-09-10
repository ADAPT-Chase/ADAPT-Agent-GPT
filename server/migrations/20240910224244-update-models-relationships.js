'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Agents', 'configuration', {
      type: Sequelize.JSONB,
      allowNull: true
    });

    await queryInterface.addColumn('Agents', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'learning', 'error'),
      defaultValue: 'inactive'
    });

    await queryInterface.addColumn('Agents', 'last_active', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Knowledge', 'contributorId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('Knowledge', 'confidence', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 1.0
    });

    await queryInterface.addColumn('Knowledge', 'version', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    await queryInterface.addColumn('Knowledge', 'parentId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Knowledge',
        key: 'id'
      }
    });

    // Add any other necessary changes here
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Agents', 'configuration');
    await queryInterface.removeColumn('Agents', 'status');
    await queryInterface.removeColumn('Agents', 'last_active');
    await queryInterface.removeColumn('Knowledge', 'contributorId');
    await queryInterface.removeColumn('Knowledge', 'confidence');
    await queryInterface.removeColumn('Knowledge', 'version');
    await queryInterface.removeColumn('Knowledge', 'parentId');

    // Add any other necessary rollback operations here
  }
};
