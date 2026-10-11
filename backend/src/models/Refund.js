'use strict'

/**
 * Refund — a reversal of a captured payment.
 *
 * One row per refund request. The column is 1-to-many so partial refunds are
 * representable, but `process_refund()` refuses a second refund on a payment
 * that has already been reversed in full, and `trg_refunds_payment_guard`
 * re-checks that in the database. Between them, "ALREADY_REFUNDED" is a
 * property of the schema, not only of the controller.
 *
 * Team 5 · Database column · master table `refunds`.
 */

const { DataTypes, Model } = require('sequelize')

const TABLE = 'refunds'

const STATUSES = ['pending', 'processed', 'failed']

class Refund extends Model {
  static init(sequelize, DataType) {
    return super.init(
      {
        refundId: {
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

        /** UNIQUE — one gateway refund id can be recorded exactly once. */
        gatewayRefundId: { type: DataTypes.STRING(64), allowNull: false },

        amount: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          comment: 'paise',
        },
        currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'INR' },
        status: { type: DataTypes.ENUM(...STATUSES), allowNull: false, defaultValue: 'pending' },
        reason: { type: DataTypes.STRING(255), allowNull: true },
        failureCode: { type: DataTypes.STRING(64), allowNull: true },
        failureReason: { type: DataTypes.STRING(255), allowNull: true },

        /** Team 1 owns auth, so this is free text until then — 'system', 'user:7'. */
        initiatedBy: { type: DataTypes.STRING(64), allowNull: true },
        gatewayResponse: { type: DataTypes.JSON, allowNull: true },
        processedAt: { type: DataTypes.DATE(3), allowNull: true },
      },
      {
        sequelize,
        modelName: 'Refund',
        tableName: TABLE,
        underscored: true,
        freezeTableName: true,
        // underscored already maps createdAt/updatedAt onto created_at/updated_at.
        timestamps: true,

        indexes: [
          { name: 'uq_refunds_gateway_refund_id', unique: true, fields: ['gateway_refund_id'] },
          { name: 'idx_refunds_payment_id', fields: ['payment_id'] },
          { name: 'idx_refunds_status_created', fields: ['status', 'created_at'] },
        ],
      },
    )
  }
}

Refund.TABLE = TABLE
Refund.STATUSES = STATUSES

module.exports = (sequelize) => Refund.init(sequelize, DataTypes)
module.exports.Refund = Refund
module.exports.TABLE = TABLE
module.exports.DataTypes = DataTypes
module.exports.STATUSES = STATUSES