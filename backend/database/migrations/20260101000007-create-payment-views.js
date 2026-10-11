'use strict'

/**
 * v_payment_history — the GET /api/payment/history shape, one row per payment.
 *
 * Also the read surface Team 7's reporting builds on, so analytics never has to
 * reach into Team 5's tables (integration contract: T7 reads through approved
 * APIs and views).
 */

const path = require('path')
const { runSqlScript } = require('../../src/config/database')

const SCRIPT = path.join(__dirname, '..', 'sql', 'views.sql')

module.exports = {
  async up() {
    await runSqlScript(SCRIPT)
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS `v_payment_history`')
  },
}