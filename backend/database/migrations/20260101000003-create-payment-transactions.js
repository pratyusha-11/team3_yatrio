'use strict'

/**
 * payment_transactions — one row per (attempt, event).
 *
 * The audit trail the assignment asks for: which gateway id was presented,
 * whether the HMAC verified, and what the gateway said. Each gateway
 * identifier is UNIQUE, so a replayed callback cannot record a second
 * transaction or credit twice.
 */

const { DataTypes, literal } = require('sequelize')

const { TABLE, EVENTS } = require('../../src/models/PaymentTransaction')

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
        transaction_id: {
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

        /* ---- which attempt, and what happened ---- */
        attempt_number: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
        event: { type: DataTypes.ENUM(...EVENTS), allowNull: false, defaultValue: 'ORDER_CREATED' },
        status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'created' },

        /* ---- gateway identifiers: the duplicate guards ---- */
        gateway_order_id: { type: DataTypes.STRING(64), allowNull: false },
        gateway_payment_id: { type: DataTypes.STRING(64), allowNull: true },
        gateway_refund_id: { type: DataTypes.STRING(64), allowNull: true },

        /* ---- verification ---- */
        signature_valid: { type: DataTypes.BOOLEAN, allowNull: true },
        signature_fingerprint: { type: DataTypes.CHAR(64), allowNull: true },
        verified_at: { type: DataTypes.DATE(3), allowNull: true },

        /* ---- outcome ---- */
        amount: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
        currency: { type: DataTypes.STRING(3), allowNull: true },
        method_code: { type: DataTypes.STRING(32), allowNull: true },
        failure_code: { type: DataTypes.STRING(64), allowNull: true },
        failure_reason: { type: DataTypes.STRING(255), allowNull: true },
        latency_ms: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },

        // Gateway payload for debugging — redact keys and secrets before write.
        gateway_response: { type: DataTypes.JSON, allowNull: true },

        created_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: STAMP },
        updated_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: STAMP },
        
      },
      { charset: 'utf8mb4' },
    )

    await queryInterface.addIndex(TABLE, ['gateway_order_id'], {
      name: 'uq_ptx_gateway_order_id',
      unique: true,
    })
    await queryInterface.addIndex(TABLE, ['gateway_payment_id'], {
      name: 'uq_ptx_gateway_payment_id',
      unique: true,
    })
    await queryInterface.addIndex(TABLE, ['gateway_refund_id'], {
      name: 'uq_ptx_gateway_refund_id',
      unique: true,
    })
    await queryInterface.addIndex(TABLE, ['payment_id', 'attempt_number', 'event'], {
      name: 'uq_ptx_payment_attempt_event',
      unique: true,
    })
    await queryInterface.addIndex(TABLE, ['status', 'created_at'], { name: 'idx_ptx_status_created' })
    await queryInterface.addIndex(TABLE, ['payment_id'], { name: 'idx_ptx_payment_id' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE)
  },
}