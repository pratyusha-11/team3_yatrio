'use strict'

/**
 * create_payment_record(), confirm_payment() and process_refund().
 *
 * The SQL lives in database/sql/procedures.sql rather than inline here, so it
 * stays readable and reviewable — and so the assignment's "stored procedures
 * must be committed and reproducible" rule is met by a .sql file anyone can
 * run with a plain mysql client.
 */

const path = require('path')
const { runSqlScript } = require('../../src/config/database')

const SCRIPT = path.join(__dirname, '..', 'sql', 'procedures.sql')

module.exports = {
  async up() {
    await runSqlScript(SCRIPT)
  },

  async down(queryInterface) {
    for (const name of ['process_refund', 'confirm_payment', 'create_payment_record']) {
      await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS \`${name}\``)
    }
  },
}