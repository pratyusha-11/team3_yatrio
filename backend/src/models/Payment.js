'use strict'

/**
 * Payment — the business-level payment for one booking.
 *
 * One row per booking *attempt*. Razorpay orders are single-use, so a retry
 * mints a new order: that is a new gateway_order_id and therefore a new row,
 * with `attemptNumber` counting up. `gateway_order_id` and
 * (booking_ref, attempt_number) are both UNIQUE, which is what stops a retry
 * loop from ever double-charging a booking.
 *
 * Amounts are paise (Razorpay's smallest unit) — never rupees, never a float.
 * See PAYMENTS.md §4.
 *
 * `bookingId` carries Team 4's `bookings.booking_id` and is indexed but has NO
 * foreign key: that table is owned by Team 4 and does not exist in this schema
 * yet. Add the FK in the migration that lands alongside Team 4's bookings.
 *
 * Team 5 · Database column · master table `payments`.
 */

const { DataTypes, Model } = require('sequelize')

const TABLE = 'payments'

/** Mirrors PAYMENTS.md §5; the order is the lifecycle order. */
const STATUSES = ['created', 'attempted', 'authorized', 'captured', 'failed', 'refunded']

/** Statuses that can never change again. */
const TERMINAL_STATUSES = ['captured', 'failed', 'refunded']

class Payment extends Model {
  static init(sequelize, DataType) {
    return super.init(
      {
        paymentId: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },

        /* ---- booking (Team 4, no FK yet — see note above) ---- */
        bookingId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
        bookingRef: { type: DataTypes.STRING(32), allowNull: false },

        /* ---- gateway ---- */
        gateway: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'razorpay' },
        gatewayOrderId: { type: DataTypes.STRING(64), allowNull: false },
        gatewayPaymentId: { type: DataTypes.STRING(64), allowNull: true },

        /* ---- money ---- */
        amount: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          comment: 'paise — the amount actually charged',
        },
        refundedAmount: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'INR' },

        /* ---- state ---- */
        status: {
          type: DataTypes.ENUM(...STATUSES),
          allowNull: false,
          defaultValue: 'created',
        },
        attemptNumber: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
        methodCode: { type: DataTypes.STRING(32), allowNull: true },
        failureCode: { type: DataTypes.STRING(64), allowNull: true },
        failureReason: { type: DataTypes.STRING(255), allowNull: true },

        /**
         * SHA-256 of the Checkout signature, never the signature itself.
         * A raw signature is replayable next to its payment id, so storing it
         * would write HMAC material to disk. The fingerprint is enough to prove
         * two verifications carried the same signature.
         */
        signatureFingerprint: { type: DataTypes.CHAR(64), allowNull: true },

        /**
         * Yatrio's own order lifetime (ORDER_TTL_MINUTES), not a gateway limit.
         * Stored so the pending screen's expiry query can use an index.
         */
        expiresAt: { type: DataTypes.DATE(3), allowNull: true },

        /* ---- denormalised for history rendering (PAYMENTS.md §4) ---- */
        trainNo: { type: DataTypes.STRING(16), allowNull: true },
        trainName: { type: DataTypes.STRING(96), allowNull: true },
        fromStation: { type: DataTypes.STRING(8), allowNull: true },
        toStation: { type: DataTypes.STRING(8), allowNull: true },
        passengerName: { type: DataTypes.STRING(96), allowNull: true },
        passengerEmail: { type: DataTypes.STRING(160), allowNull: true },
        passengerContact: { type: DataTypes.STRING(32), allowNull: true },

        capturedAt: { type: DataTypes.DATE(3), allowNull: true },
        failedAt: { type: DataTypes.DATE(3), allowNull: true },
        refundedAt: { type: DataTypes.DATE(3), allowNull: true },
      },
      {
        sequelize,
        modelName: 'Payment',
        tableName: TABLE,
        underscored: true,
        freezeTableName: true,
        // underscored already maps createdAt/updatedAt onto created_at/updated_at.
        timestamps: true,

        indexes: [
          { name: 'uq_payments_gateway_order_id', unique: true, fields: ['gateway_order_id'] },
          {
            name: 'uq_payments_gateway_payment_id',
            unique: true,
            fields: ['gateway_payment_id'],
          },
          // A retry mints a new order, so a booking can never hold two attempts.
          {
            name: 'uq_payments_booking_attempt',
            unique: true,
            fields: ['booking_ref', 'attempt_number'],
          },
          { name: 'idx_payments_status_created', fields: ['status', 'created_at'] },
          { name: 'idx_payments_booking_id', fields: ['booking_id'] },
          { name: 'idx_payments_expires_at', fields: ['expires_at'] },
        ],
      },
    )
  }
}

Payment.TABLE = TABLE
Payment.STATUSES = STATUSES
Payment.TERMINAL_STATUSES = TERMINAL_STATUSES
/** `pending` on the history endpoint means "created, attempted or authorized". */
Payment.ACTIVE_STATUSES = ['created', 'attempted', 'authorized']

module.exports = (sequelize) => Payment.init(sequelize, DataTypes)
module.exports.Payment = Payment
module.exports.TABLE = TABLE
module.exports.DataTypes = DataTypes
module.exports.STATUSES = STATUSES
module.exports.TERMINAL_STATUSES = TERMINAL_STATUSES
module.exports.ACTIVE_STATUSES = ['created', 'attempted', 'authorized']