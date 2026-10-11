'use strict'

/**
 * The two guard triggers.
 *
 * Guards, not business logic: the procedures decide what happens, and these
 * make the illegal states unreachable from any writer — including a future
 * admin tool or a hand-run console query.
 */

const path = require('path')
const { runSqlScript } = require('../../src/config/database')

const SCRIPT = path.join(__dirname, '..', 'sql', 'triggers.sql')

module.exports = {
  async up() {
    await runSqlScript(SCRIPT)
  },

  async down(queryInterface) {
    for (const name of ['trg_refunds_payment_guard', 'trg_payments_status_guard']) {
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS \`${name}\``)
    }
  },
}