'use strict'

/**
 * Model registry — Team 5's slice of the schema.
 *
 * Importing this file registers the payment models on the shared Sequelize
 * instance and wires their associations. It connects to nothing; the first
 * query opens the pool.
 *
 *   const db = require('./models')
 *   const payment = await db.Payment.findOne({ where: { gatewayOrderId } })
 *
 * Only Team 5's tables are registered. models/User.js is Team 1's and is still
 * a placeholder, so nothing here references a user.
 */

const { sequelize } = require('../config/database')

const Payment = require('./Payment')(sequelize)
const PaymentTransaction = require('./PaymentTransaction')(sequelize)
const Refund = require('./Refund')(sequelize)
const PaymentMethod = require('./PaymentMethod')(sequelize)

/* --------------------------------------------------------------- associations */

// A payment is made of attempts, and can be reversed at most once in full.
Payment.hasMany(PaymentTransaction, {
  foreignKey: 'payment_id',
  as: 'transactions',
  onDelete: 'CASCADE',
})
PaymentTransaction.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' })

Payment.hasMany(Refund, { foreignKey: 'payment_id', as: 'refunds', onDelete: 'CASCADE' })
Refund.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' })

// method_code is a soft reference on purpose: a payment keeps the method it
// was actually taken with even if the method is later deactivated in the master.
// `targetKey` matters here — method_code holds an instrument code, not a row id.
Payment.belongsTo(PaymentMethod, {
  foreignKey: 'method_code',
  targetKey: 'code',
  as: 'method',
  constraints: false,
})

module.exports = {
  sequelize,
  Sequelize: require('sequelize').Sequelize,
  Payment,
  PaymentTransaction,
  Refund,
  PaymentMethod,
}