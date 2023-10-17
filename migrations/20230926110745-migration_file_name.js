'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.renameColumn('users','firstName','first_name')
   await queryInterface.renameColumn('users','lastName','last_name')
   await queryInterface.renameColumn('users','isAdmin','is_admin')
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
