'use strict'

/**
 * sequelize-cli configuration.
 *
 * Credentials come straight from config/database.js, so `db:migrate` and the
 * running server cannot drift onto different databases. The same discrete
 * DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD variables drive both.
 *
 *   npx sequelize-cli db:migrate
 */

const path = require('path')
const { connection } = require('./database')

/** One hosted MySQL serves every environment for the project. */
const base = {
  ...connection,
  timezone: '+05:30',
  logging: process.env.DB_LOGGING ? /^(1|true|yes)$/i.test(process.env.DB_LOGGING) : false,
  define: { underscored: true, freezeTableName: true },
  migrationStorageTableName: 'sequelize_meta',
  seederStorage: 'sequelize',
  seederStorageTableName: 'sequelize_seeders',
}

module.exports = {
  development: { ...base },
  test: { ...base },
  production: { ...base },
  modelPaths: [path.join(__dirname, '..', 'models')],
}