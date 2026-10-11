'use strict'

/**
 * PaymentMethod — normalised list of the instruments Yatrio offers.
 *
 * Razorpay owns method selection in Checkout (PAYMENTS.md §3), so this table is
 * not a user-facing picker; it records which instruments the account has
 * enabled and in what order they should be requested.
 *
 * Team 5 · Database column · master table `payment_methods`.
 */

const { DataTypes, Model } = require('sequelize')

const TABLE = 'payment_methods'

class PaymentMethod extends Model {
  static init(sequelize, DataType) {
    return super.init(
      {
        paymentMethodId: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        code: {
          type: DataTypes.STRING(32),
          allowNull: false,
          unique: true,
          comment: 'upi | card | netbanking | wallet | emandate',
        },
        displayName: { type: DataTypes.STRING(64), allowNull: false },
        gateway: { type: DataTypes.STRING(32), allowNull: false, defaultValue: 'razorpay' },
        /** Order the Checkout block requests instruments in (PAYMENTS.md §3). */
        sortOrder: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      },
      {
        sequelize,
        modelName: 'PaymentMethod',
        tableName: TABLE,
        underscored: true,
        freezeTableName: true,
        // underscored already maps createdAt/updatedAt onto created_at/updated_at.
        timestamps: true,
      },
    )
  }
}

PaymentMethod.TABLE = TABLE

module.exports = (sequelize) => PaymentMethod.init(sequelize, DataTypes)
module.exports.PaymentMethod = PaymentMethod
module.exports.TABLE = TABLE
module.exports.DataTypes = DataTypes