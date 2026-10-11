'use strict'

/**
 * payments — one row per booking payment attempt.
 *
 * The three UNIQUE indexes are the schema-level answer to "constraints
 * preventing duplicate transaction IDs":
 *   uq_payments_gateway_order_id   a gateway order can be recorded once
 *   uq_payments_gateway_payment_id a gateway payment can be captured once
 *   uq_payments_booking_attempt    a booking holds one row per attempt number
 *
 * booking_id is indexed but has no foreign key — bookings belongs to Team 4
 * and is not in this schema yet. Add the FK in the migration that ships
 * alongside Team 4's bookings table.
 */

const { DataTypes, literal } = require('sequelize')

const { TABLE, STATUSES } = require('../../src/models/Payment')

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
        payment_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },

        /* ---- booking (Team 4; FK added later) ---- */
        booking_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
        booking_ref: { type: DataTypes.STRING(32), allowNull: false },

        /* ---- gateway ---- */
        gateway: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'razorpay' },
        gateway_order_id: { type: DataTypes.STRING(64), allowNull: false },
        gateway_payment_id: { type: DataTypes.STRING(64), allowNull: true },

        /* ---- money, in paise ---- */
        amount: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        refunded_amount: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'INR' },

        /* ---- state ---- */
        status: { type: DataTypes.ENUM(...STATUSES), allowNull: false, defaultValue: 'created' },
        attempt_number: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
        method_code: { type: DataTypes.STRING(32), allowNull: true },
        failure_code: { type: DataTypes.STRING(64), allowNull: true },
        failure_reason: { type: DataTypes.STRING(255), allowNull: true },

        // SHA-256 of the Checkout signature — never the signature itself, which
        // would be replayable next to its payment id.
        signature_fingerprint: { type: DataTypes.CHAR(64), allowNull: true },

        // Yatrio's own order lifetime (ORDER_TTL_MINUTES), not a gateway limit.
        expires_at: { type: DataTypes.DATE(3), allowNull: true },

        /* ---- denormalised so history renders without joining bookings ---- */
        train_no: { type: DataTypes.STRING(16), allowNull: true },
        train_name: { type: DataTypes.STRING(96), allowNull: true },
        from_station: { type: DataTypes.STRING(8), allowNull: true },
        to_station: { type: DataTypes.STRING(8), allowNull: true },
        passenger_name: { type: DataTypes.STRING(96), allowNull: true },
        passenger_email: { type: DataTypes.STRING(160), allowNull: true },
        passenger_contact: { type: DataTypes.STRING(32), allowNull: true },

        captured_at: { type: DataTypes.DATE(3), allowNull: true },
        failed_at: { type: DataTypes.DATE(3), allowNull: true },
        refunded_at: { type: DataTypes.DATE(3), allowNull: true },
        created_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: STAMP },
        updated_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: STAMP },
        
      },
      { charset: 'utf8mb4' },
    )

    await queryInterface.addIndex(TABLE, ['gateway_order_id'], {
      name: 'uq_payments_gateway_order_id',
      unique: true,
    })
    await queryInterface.addIndex(TABLE, ['gateway_payment_id'], {
      name: 'uq_payments_gateway_payment_id',
      unique: true,
    })
    await queryInterface.addIndex(TABLE, ['booking_ref', 'attempt_number'], {
      name: 'uq_payments_booking_attempt',
      unique: true,
    })
    // GET /payment/history sorts and filters on exactly this pair.
    await queryInterface.addIndex(TABLE, ['status', 'created_at'], {
      name: 'idx_payments_status_created',
    })
    await queryInterface.addIndex(TABLE, ['booking_id'], { name: 'idx_payments_booking_id' })
    await queryInterface.addIndex(TABLE, ['expires_at'], { name: 'idx_payments_expires_at' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable(TABLE)
  },
}