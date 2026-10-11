'use strict'

/**
 * payment_methods — the instruments Yatrio requests in Checkout.
 *
 * Master data, not a picker: Razorpay owns method selection (PAYMENTS.md §3),
 * so this records which instruments the account has enabled and in what order
 * they should be requested.
 */

const { DataTypes, literal } = require('sequelize')

const { TABLE } = require('../../src/models/PaymentMethod')

/**
 * Raw SQL - the procedures in database/sql insert without Sequelize, so the
 * database stamps its own timestamps rather than trusting a client to.
 */
const STAMP = literal('CURRENT_TIMESTAMP(3)')

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable(
      TABLE,
      {
        payment_method_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        code: { type: DataTypes.STRING(32), allowNull: false },
        display_name: { type: DataTypes.STRING(64), allowNull: false },
        gateway: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'razorpay' },
        sort_order: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: STAMP },
        updated_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: STAMP },
        
      },
      { charset: 'utf8mb4' },
    )

    // The natural key: one row per instrument code.
    await queryInterface.addIndex(TABLE, ['code'], {
      name: 'uq_payment_methods_code',
      unique: true,
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE)
  },
}