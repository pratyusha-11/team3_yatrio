'use strict'

/**
 * Demo payments for the two seeded bookings in PAYMENTS.md section 6/10.
 *
 * Four rows between them, so every filter on GET /api/payment/history has
 * something to show:
 *
 *   YTR-12951-7QX2  attempt 1  failed      a declined card, then a retry
 *   YTR-12951-7QX2  attempt 2  captured    UPI, settled - the happy path
 *   YTR-12951-7QX3  attempt 1  refunded    captured then reversed in full
 *   YTR-12951-7QX3  attempt 2  authorized  bank approved, not yet settled
 *
 * Amounts come from the server fare engine (services/fareService.js), never
 * from the client: 3A x1 = 54000 + 4860 + 3000 = 61860, and 2A x2 = 136000 +
 * 12240 + 3000 = 151240. All in paise.
 *
 * Insert order matters. The refunded payment is written as 'captured' first,
 * because trg_refunds_payment_guard refuses a refund row against a payment
 * that is not captured - the same rule the real flow goes through.
 */

const crypto = require('crypto')
const { TABLE: PAYMENTS } = require('../../src/models/Payment')
const { TABLE: TRANSACTIONS } = require('../../src/models/PaymentTransaction')
const { TABLE: REFUNDS } = require('../../src/models/Refund')

const REFUND_ID = 'rfnd_T5demoQX3a1'
const REFUNDED_ORDER = 'order_T5demo0003QX3a1'

/* ------------------------------------------------------------------- time */

/**
 * MySQL DATETIME(3) literal in IST.
 *
 * config/database.js writes JS Dates as IST wall clock, so seeded values are
 * formatted the same way instead of going through the driver's conversion —
 * otherwise an ISO/UTC string would land five and a half hours off.
 */
const ist = (date) =>
  new Date(date.getTime() + 5.5 * 3_600_000).toISOString().slice(0, 23).replace('T', ' ')

/** Fixed seed times, so a reseed reproduces the same history. */
const IST = (h, m, s = 0) =>
  new Date(`2026-10-03T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}+05:30`)

const ttl = (date, minutes) => ist(new Date(date.getTime() + minutes * 60_000))

/** A realistic fingerprint: the SHA-256 a real signature would produce. */
const fingerprint = (seed) => crypto.createHash('sha256').update(seed).digest('hex')

const JOURNEY = {
  train_no: '12951',
  train_name: 'Rajdhani',
  from_station: 'NDLS',
  to_station: 'MTJ',
}

const CONTACT = {
  passenger_email: 'arjun.mehta@example.com',
  passenger_contact: '+919000090000',
}

/* ---------------------------------------------------------------- payments */

const PAYMENT_ROWS = [
  {
    gateway_order_id: 'order_T5demo0001QX2a1',
    gateway_payment_id: null,
    booking_ref: 'YTR-12951-7QX2',
    booking_id: null, // Team 4's bookings table is not in this schema yet
    gateway: 'razorpay',
    amount: 61860,
    refunded_amount: 0,
    currency: 'INR',
    status: 'failed',
    attempt_number: 1,
    method_code: 'card',
    failure_code: 'BAD_REQUEST_ERROR',
    failure_reason: 'Your card was declined.',
    signature_fingerprint: null,
    expires_at: ttl(IST(14, 22, 47), 30),
    ...JOURNEY,
    passenger_name: 'Arjun Mehta',
    ...CONTACT,
    captured_at: null,
    failed_at: ist(IST(14, 23, 4)),
    created_at: ist(IST(14, 22, 47)),
    updated_at: ist(IST(14, 23, 4)),
  },
  {
    gateway_order_id: 'order_T5demo0002QX2a2',
    gateway_payment_id: 'pay_T5demo0002QX2a2',
    booking_ref: 'YTR-12951-7QX2',
    booking_id: null,
    gateway: 'razorpay',
    amount: 61860,
    refunded_amount: 0,
    currency: 'INR',
    status: 'captured',
    attempt_number: 2,
    method_code: 'upi',
    failure_code: null,
    failure_reason: null,
    signature_fingerprint: fingerprint('demo-signature-YTR-12951-7QX2-a2'),
    expires_at: ttl(IST(14, 30, 12), 30),
    ...JOURNEY,
    passenger_name: 'Arjun Mehta',
    ...CONTACT,
    captured_at: ist(IST(14, 31, 26)),
    failed_at: null,
    created_at: ist(IST(14, 30, 12)),
    updated_at: ist(IST(14, 31, 26)),
  },
  {
    // Written as captured; the reversal is applied in step 3 below.
    gateway_order_id: REFUNDED_ORDER,
    gateway_payment_id: 'pay_T5demo0003QX3a1',
    booking_ref: 'YTR-12951-7QX3',
    booking_id: null,
    gateway: 'razorpay',
    amount: 151240,
    refunded_amount: 0,
    currency: 'INR',
    status: 'captured',
    attempt_number: 1,
    method_code: 'card',
    failure_code: null,
    failure_reason: null,
    signature_fingerprint: fingerprint('demo-signature-YTR-12951-7QX3-a1'),
    expires_at: ttl(IST(10, 4, 2), 30),
    ...JOURNEY,
    passenger_name: 'Ira Mehta',
    ...CONTACT,
    captured_at: ist(IST(10, 5, 0)),
    failed_at: null,
    created_at: ist(IST(10, 4, 2)),
    updated_at: ist(IST(10, 5, 0)),
  },
  {
    gateway_order_id: 'order_T5demo0004QX3a2',
    gateway_payment_id: 'pay_T5demo0004QX3a2',
    booking_ref: 'YTR-12951-7QX3',
    booking_id: null,
    gateway: 'razorpay',
    amount: 151240,
    refunded_amount: 0,
    currency: 'INR',
    // Bank approved, money not yet moved - what the pending screen polls on.
    status: 'authorized',
    attempt_number: 2,
    method_code: 'upi',
    failure_code: null,
    failure_reason: null,
    signature_fingerprint: fingerprint('demo-signature-YTR-12951-7QX3-a2'),
    expires_at: ttl(IST(11, 40, 0), 30),
    ...JOURNEY,
    passenger_name: 'Ira Mehta',
    ...CONTACT,
    captured_at: null,
    failed_at: null,
    created_at: ist(IST(11, 40, 0)),
    updated_at: ist(IST(11, 40, 9)),
  },
]

/* ----------------------------------------------------------- transactions */

/** One audit row per attempt, in the state the flow would have left it. */
const TRANSACTION_ROWS = [
  {
    gateway_order_id: 'order_T5demo0001QX2a1',
    attempt_number: 1,
    event: 'PAYMENT_FAILED',
    status: 'failed',
    gateway_payment_id: null,
    gateway_refund_id: null,
    signature_valid: null,
    signature_fingerprint: null,
    verified_at: null,
    amount: 61860,
    currency: 'INR',
    method_code: 'card',
    failure_code: 'BAD_REQUEST_ERROR',
    failure_reason: 'Your card was declined.',
    latency_ms: 412,
    gateway_response: JSON.stringify({ status: 'failed', error_code: 'BAD_REQUEST_ERROR' }),
    created_at: ist(IST(14, 22, 47)),
    updated_at: ist(IST(14, 23, 4)),
  },
  {
    gateway_order_id: 'order_T5demo0002QX2a2',
    attempt_number: 2,
    event: 'PAYMENT_VERIFIED',
    status: 'captured',
    gateway_payment_id: 'pay_T5demo0002QX2a2',
    gateway_refund_id: null,
    signature_valid: true,
    signature_fingerprint: fingerprint('demo-signature-YTR-12951-7QX2-a2'),
    verified_at: ist(IST(14, 31, 26)),
    amount: 61860,
    currency: 'INR',
    method_code: 'upi',
    failure_code: null,
    failure_reason: null,
    latency_ms: 268,
    gateway_response: JSON.stringify({ status: 'captured', method: 'upi' }),
    created_at: ist(IST(14, 30, 12)),
    updated_at: ist(IST(14, 31, 26)),
  },
  {
    gateway_order_id: REFUNDED_ORDER,
    attempt_number: 1,
    event: 'PAYMENT_REFUNDED',
    status: 'refunded',
    gateway_payment_id: 'pay_T5demo0003QX3a1',
    gateway_refund_id: REFUND_ID,
    signature_valid: true,
    signature_fingerprint: fingerprint('demo-signature-YTR-12951-7QX3-a1'),
    verified_at: ist(IST(10, 5, 0)),
    amount: 151240,
    currency: 'INR',
    method_code: 'card',
    failure_code: null,
    failure_reason: null,
    latency_ms: 301,
    gateway_response: JSON.stringify({ status: 'captured', method: 'card' }),
    created_at: ist(IST(10, 4, 2)),
    updated_at: ist(IST(10, 22, 40)),
  },
  {
    gateway_order_id: 'order_T5demo0004QX3a2',
    attempt_number: 2,
    event: 'ORDER_CREATED',
    status: 'authorized',
    gateway_payment_id: 'pay_T5demo0004QX3a2',
    gateway_refund_id: null,
    signature_valid: true,
    signature_fingerprint: fingerprint('demo-signature-YTR-12951-7QX3-a2'),
    verified_at: ist(IST(11, 40, 9)),
    amount: 151240,
    currency: 'INR',
    method_code: 'upi',
    failure_code: null,
    failure_reason: null,
    latency_ms: 197,
    gateway_response: JSON.stringify({ status: 'authorized', method: 'upi' }),
    created_at: ist(IST(11, 40, 0)),
    updated_at: ist(IST(11, 40, 9)),
  },
]

const REFUND_ROWS = [
  {
    payment_ref: REFUNDED_ORDER,
    gateway_refund_id: REFUND_ID,
    amount: 151240,
    currency: 'INR',
    status: 'processed',
    reason: 'Cancelled by traveller before departure.',
    failure_code: null,
    failure_reason: null,
    initiated_by: 'system', // Team 1 owns auth; free text until then
    gateway_response: JSON.stringify({ id: REFUND_ID, status: 'processed', amount: 151240 }),
    processed_at: ist(IST(10, 22, 40)),
    created_at: ist(IST(10, 22, 40)),
    updated_at: ist(IST(10, 22, 40)),
  },
]

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(PAYMENTS, PAYMENT_ROWS)

    // Read the generated keys back rather than assuming an AUTO_INCREMENT
    // pattern - the refund path depends on them.
    const [ids] = await queryInterface.sequelize.query(
      `SELECT gateway_order_id, payment_id FROM ${PAYMENTS}`,
    )
    const idFor = (ref) => {
      const row = ids.find((r) => r.gateway_order_id === ref)
      if (!row) throw new Error(`seed: no payment row for ${ref}`)
      return row.payment_id
    }

    await queryInterface.bulkInsert(
      TRANSACTIONS,
      TRANSACTION_ROWS.map((row) => ({ ...row, payment_id: idFor(row.gateway_order_id) })),
    )

    await queryInterface.bulkInsert(
      REFUNDS,
      REFUND_ROWS.map(({ payment_ref, ...row }) => ({ ...row, payment_id: idFor(payment_ref) })),
    )

    // Only now does the payment become refunded. trg_payments_status_guard
    // permits exactly this move and no other.
    await queryInterface.sequelize.query(
      `UPDATE ${PAYMENTS}
          SET status          = 'refunded',
              refunded_amount = ${REFUND_ROWS[0].amount},
              refunded_at     = ${queryInterface.sequelize.escape(REFUND_ROWS[0].processed_at)},
              updated_at      = ${queryInterface.sequelize.escape(REFUND_ROWS[0].processed_at)}
        WHERE gateway_order_id = '${REFUNDED_ORDER}'`,
    )
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(REFUNDS, { gateway_refund_id: REFUND_ID }, {})
    // payment_transactions and payments go with the ON DELETE CASCADE.
    await queryInterface.bulkDelete(PAYMENTS, { booking_ref: ['YTR-12951-7QX2', 'YTR-12951-7QX3'] }, {})
  },
}