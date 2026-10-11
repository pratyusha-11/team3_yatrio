'use strict'

/**
 * Align the payment tables on utf8mb4_unicode_ci.
 *
 * Teams 1, 2 and 7 declare `COLLATE=utf8mb4_unicode_ci` on their tables, but
 * MySQL 8's default is `utf8mb4_0900_ai_ci`, which is what Aiven applied when
 * the database was created — so Team 5's tables were built on 0900_ai_ci while
 * everyone else's were on unicode_ci.
 *
 * That only bites where the two meet: a stored procedure whose parameters
 * inherit the database default, called against a table in unicode_ci, fails
 * with "Illegal mix of collations". One collation across the schema removes
 * the whole class of problem.
 *
 * This is a new migration rather than an edit to the table-creating ones,
 * because those have already run and their filenames are recorded in
 * sequelize_meta. Reversible.
 */

const path = require('path')
const { runSqlScript } = require('../../src/config/database')

const TABLES = ['payments', 'payment_transactions', 'refunds', 'payment_methods']
const TARGET = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
const PREVIOUS = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci'
const sql = (name) => path.join(__dirname, '..', 'sql', name)

/**
 * Rebuild every DDL object after moving the tables.
 *
 * This is the part that is easy to miss. A procedure's parameters and local
 * variables capture the database's collation *when it is created*, so
 * converting the tables underneath it changes nothing — the procedure keeps
 * the old collation and every comparison it makes then fails with "Illegal mix
 * of collations". The scripts open with DROP ... IF EXISTS, so re-running them
 * recreates each object under the current default.
 *
 * Views cannot be ALTERed in MySQL 8 at all (`ALTER TABLE ... CONVERT TO`
 * rejects one with "'v' is not BASE TABLE"); re-running the definition is the
 * supported way to give them the new collations.
 */
async function convert(queryInterface, clause, convertTables) {
    if (convertTables) {
        for (const table of TABLES) {
            await queryInterface.sequelize.query(`ALTER TABLE \`${table}\` CONVERT TO ${clause}`)
        }
    }

    await runSqlScript(sql('procedures.sql'))
    await runSqlScript(sql('triggers.sql'))
    await runSqlScript(sql('views.sql'))
}

module.exports = {
    async up(queryInterface) {
        await convert(queryInterface, TARGET, true)
    },

    async down(queryInterface) {
        await convert(queryInterface, PREVIOUS, true)
    },
}