'use strict'

const Razorpay = require('razorpay')
const env = require('../../config/env')

/**
 * Razorpay Orders / Payments / Refunds wrapper.
 *
 * The key secret is read from config/env.js and never returned to a client.
 * A single instance is reused so the SDK pools its internal agent.
 */

let instance = null

function client() {
  if (!instance) {
    instance = new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret,
    })
  }
  return instance
}

/**
 * Create an order. Razorpay requires one per payment — a payment made without
 * an order_id cannot be captured and is auto-refunded.
 *
 * @param {{amount: number, currency?: string, receipt: string, notes?: object}} params
 *        amount in paise
 */
async function createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
  const order = await client().orders.create({
    amount,
    currency,
    receipt,
    notes,
    // Auto-capture is configured on the Dashboard; declared here so the
    // intent is visible in code.
    payment_capture: 1,
  })

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    receipt: order.receipt,
  }
}

/**
 * Fetch a payment — the authoritative status. Never infer success from the
 * client alone.
 *
 * @param {string} paymentId pay_xxx
 */
async function fetchPayment(paymentId) {
  const payment = await client().payments.fetch(paymentId)
  return {
    paymentId: payment.id,
    orderId: payment.order_id,
    status: payment.status, // created | authorized | captured | failed | refunded
    method: payment.method ?? null,
    amount: payment.amount,
    currency: payment.currency,
    errorCode: payment.error_code ?? null,
    errorDescription: payment.error_description ?? null,
    errorReason: payment.error_reason ?? null,
  }
}

/**
 * Refund a captured payment.
 *
 * @param {string} paymentId pay_xxx
 * @param {number} [amountPaise] omit for a full refund
 */
async function refundPayment(paymentId, amountPaise) {
  const payload = amountPaise ? { amount: amountPaise } : {}
  const refund = await client().payments.refund(paymentId, payload)
  return {
    refundId: refund.id,
    paymentId: refund.payment_id,
    amount: refund.amount,
    status: refund.status,
  }
}

/** Fetch the order itself — used to reconcile a payment id we have not seen. */
async function fetchOrder(orderId) {
  const order = await client().orders.fetch(orderId)
  return {
    orderId: order.id,
    amount: order.amount,
    amountPaid: order.amount_paid,
    amountDue: order.amount_due,
    status: order.status, // created | attempted | paid
    attempts: order.attempts,
    notes: order.notes ?? {},
  }
}

const isConfigured = () => !env.isMockRazorpay

module.exports = { createOrder, fetchPayment, refundPayment, fetchOrder, isConfigured, client }