'use strict'

const crypto = require('crypto')

/**
 * Razorpay payment signature verification.
 *
 * Per Razorpay's docs the HMAC is:
 *     hmac_sha256(order_id + "|" + razorpay_payment_id, key_secret)
 *
 * Two rules that are easy to get wrong and are the difference between a real
 * verification and theatre:
 *
 *  1. The `order_id` used to build the HMAC must be the one stored on OUR
 *     server — never the `razorpay_order_id` echoed back by Checkout, which
 *     an attacker fully controls.
 *  2. Compare with crypto.timingSafeEqual, not `===`, so a mismatched
 *     signature cannot be discovered byte by byte.
 */

/**
 * @param {{orderId: string, paymentId: string}} params orderId from our DB
 * @param {string} signature the razorpay_signature returned by Checkout
 * @param {string} secret RAZORPAY_KEY_SECRET
 * @returns {boolean}
 */
function verifyPaymentSignature({ orderId, paymentId }, signature, secret) {
  if (!orderId || !paymentId || !signature || !secret) return false

  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')

  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(String(signature), 'utf8')

  // timingSafeEqual throws on length mismatch, so guard first.
  if (a.length !== b.length) return false

  try {
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

module.exports = { verifyPaymentSignature }