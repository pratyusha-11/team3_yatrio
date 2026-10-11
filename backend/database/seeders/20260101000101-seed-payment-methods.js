'use strict'

/**
 * The instruments Yatrio requests, in Checkout's order.
 *
 * The `sort_order` values mirror the `instruments` block in the Checkout
 * config (PAYMENTS.md §3): UPI first, because it carries no PG charge.
 *
 * `is_active` is Yatrio's own switch, not Razorpay's — an instrument the
 * account has not activated is simply absent from the response, so this row
 * records intent rather than gateway state.
 */

const { TABLE } = require('../../src/models/PaymentMethod')

const METHODS = [
  { code: 'upi', displayName: 'UPI', sortOrder: 1 },
  { code: 'card', displayName: 'Cards', sortOrder: 2 },
  { code: 'netbanking', displayName: 'Netbanking', sortOrder: 3 },
  { code: 'wallet', displayName: 'Wallet', sortOrder: 4 },
]

module.exports = {
  async up(queryInterface) {
    const now = new Date()
    await queryInterface.bulkInsert(
      TABLE,
      METHODS.map((m) => ({
        code: m.code,
        display_name: m.displayName,
        gateway: 'razorpay',
        sort_order: m.sortOrder,
        is_active: true,
        created_at: now,
        updated_at: now,
      })),
    )
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(TABLE, { code: METHODS.map((m) => m.code) }, {})
  },
}