'use strict'

/**
 * refunds — reversals of a captured payment.
 *
 * One-to-many, so a partial refund is representable, but
 * uq_refunds_gateway_refund_id plus trg_refunds_payment_guard make a second
 * reversal impossible however the row is inserted.
 *
 * created after payments and payment_transactions because it references both
 * through the payment_id FK and the guarded amount.
 */

const { DataTypes, literal } = require('sequelize')

const { TABLE, STATUSES } = require('../../src/models/Refund')

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
        refund_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        payment_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'payments', key: 'payment_id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },

        gateway_refund_id: { type: DataTypes.STRING(64), allowNull: false },
        amount: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'INR' },
        status: { type: DataTypes.ENUM(...STATUSES), allowNull: false, defaultValue: 'pending' },
        reason: { type: DataTypes.STRING(255), allowNull: true },
        failure_code: { type: DataTypes.STRING(64), allowNull: true },
        failure_reason: { type: DataTypes.STRING(255), allowNull: true },
        // Team 1 owns auth, so free text until then: 'system', 'user:7', ...
        initiated_by: { type: DataTypes.STRING(64), allowNull: true },
        gateway_response: { type: DataTypes.JSON, allowNull: true },
        processed_at: { type: DataTypes.DATE(3), allowNull: true },

        created_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: STAMP },
        updated_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: STAMP },
        
      },
      { charset: 'utf8mb4' },
    )

    // A refund of nothing is never a valid row.
    await queryInterface.sequelize.query(
      `ALTER TABLE \`${TABLE}\` ADD CONSTRAINT \`chk_refunds_amount_positive\` CHECK (\`amount\` > 0)`,
    )

    await queryInterface.addIndex(TABLE, ['gateway_refund_id'], {
      name: 'uq_refunds_gateway_refund_id',
      unique: true,
    })
    await queryInterface.addIndex(TABLE, ['payment_id'], { name: 'idx_refunds_payment_id' })
    await queryInterface.addIndex(TABLE, ['status', 'created_at'], { name: 'idx_refunds_status_created' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE)
  },
}