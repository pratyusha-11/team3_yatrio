'use strict'

/**
 * PaymentTransaction — one row per gateway attempt and its verification result.
 *
 * This is the audit trail the assignment asks for: "gateway order/payment
 * attempts and verification results". Every write carries which gateway id was
 * presented, whether the HMAC checked out, how long the gateway took, and the
 * (redacted) gateway response.
 *
 * The UNIQUE indexes here are the assignment's "constraints preventing
 * duplicate transaction IDs": a gateway order id, a payment id or a refund id
 * can each be recorded exactly once, so a replayed webhook or a repeated
 * verify call cannot mint a second transaction row or credit twice.
 *
 * Team 5 · Database column · master table `payment_transactions`.
 */

const { DataTypes, Model } = require('sequelize')

const TABLE = 'payment_transactions'

/** The lifecycle events PAYMENTS.md section 7 logs. */
const EVENTS = [
  'ORDER_CREATED',
  'ORDER_EXPIRED',
  'PAYMENT_VERIFIED',
  'PAYMENT_FAILED',
  'PAYMENT_REFUNDED',
]

class PaymentTransaction extends Model {
  static init(sequelize, DataType) {
    return super.init(
      {
        transactionId: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        paymentId: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          references: { model: 'payments', key: 'payment_id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },

        /* ---- which attempt, and what happened to it ---- */
        attemptNumber: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
        event: { type: DataTypes.ENUM(...EVENTS), allowNull: false, defaultValue: 'ORDER_CREATED' },
        status: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'created' },

        /* ---- gateway identifiers: the duplicate guards ---- */
        gatewayOrderId: { type: DataTypes.STRING(64), allowNull: false },
        gatewayPaymentId: { type: DataTypes.STRING(64), allowNull: true },
        gatewayRefundId: { type: DataTypes.STRING(64), allowNull: true },

        /* ---- verification ---- */
        /** NULL until a verification attempt; TRUE/FALSE after one. */
        signatureValid: { type: DataTypes.BOOLEAN, allowNull: true },
        signatureFingerprint: { type: DataTypes.CHAR(64), allowNull: true },
        verifiedAt: { type: DataTypes.DATE(3), allowNull: true },

        /* ---- outcome ---- */
        amount: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
        currency: { type: DataTypes.STRING(3), allowNull: true },
        methodCode: { type: DataTypes.STRING(32), allowNull: true },
        failureCode: { type: DataTypes.STRING(64), allowNull: true },
        failureReason: { type: DataTypes.STRING(255), allowNull: true },

        /** Gateway round-trip time, for the analytics view. */
        latencyMs: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },

        /**
         * Raw gateway response for debugging. Must be redacted before writing —
         * never a key, secret or signature (PAYMENTS.md §1, SECURITY.md).
         */
        gatewayResponse: { type: DataTypes.JSON, allowNull: true },
      },
      {
        sequelize,
        modelName: 'PaymentTransaction',
        tableName: TABLE,
        underscored: true,
        freezeTableName: true,
        // underscored already maps createdAt/updatedAt onto created_at/updated_at.
        timestamps: true,

        indexes: [
          { name: 'uq_ptx_gateway_order_id', unique: true, fields: ['gateway_order_id'] },
          { name: 'uq_ptx_gateway_payment_id', unique: true, fields: ['gateway_payment_id'] },
          { name: 'uq_ptx_gateway_refund_id', unique: true, fields: ['gateway_refund_id'] },
          // One row per (attempt, event): a replayed confirmation rewrites the
          // row it finds rather than stacking up duplicates.
          {
            name: 'uq_ptx_payment_attempt_event',
            unique: true,
            fields: ['payment_id', 'attempt_number', 'event'],
          },
          { name: 'idx_ptx_status_created', fields: ['status', 'created_at'] },
          { name: 'idx_ptx_payment_id', fields: ['payment_id'] },
        ],
      },
    )
  }
}

PaymentTransaction.TABLE = TABLE
PaymentTransaction.EVENTS = EVENTS

module.exports = (sequelize) => PaymentTransaction.init(sequelize, DataTypes)
module.exports.PaymentTransaction = PaymentTransaction
module.exports.TABLE = TABLE
module.exports.DataTypes = DataTypes
module.exports.EVENTS = EVENTS