'use strict'

/**
 * Fare calculation — the server's authoritative amount.
 *
 * This is the boundary that stops the "tampered amount" attack. The browser
 * never sends an amount; it sends a booking reference, and the charge is
 * derived here from a server-owned price list. Any `amount` in the request
 * body is ignored, and `createOrder` rejects the request outright if one is
 * present, so a caller who expects to be believed gets a loud failure rather
 * than a silently discounted charge.
 *
 * Every figure is in paise — Razorpay's smallest currency unit. Storing or
 * sending rupees introduces a 100x error.
 */

const { CLASS_RATES, COUPONS, CONVENIENCE_FEE, INSURANCE_PER_PERSON } = require('./bookingService')
const { badRequest } = require('../../utils/errors')

const MAX_PASSENGERS = 6

/**
 * @param {object} booking from bookingService.resolveBooking()
 * @param {{insurance?: boolean, coupon?: string|null}} extras optional add-ons
 * @returns {{currency: string, amount: number, total: number, breakdown: object[]}}
 */
function calculateFare(booking, extras = {}) {
  const rate = CLASS_RATES[booking.train.class]
  if (!rate) throw badRequest(`No fare configured for class ${booking.train.class}.`, 'class')

  const passengers = booking.passengers?.length ?? 0
  if (passengers < 1) throw badRequest('A booking needs at least one passenger.', 'passengers')
  if (passengers > MAX_PASSENGERS) {
    throw badRequest(`A single booking cannot exceed ${MAX_PASSENGERS} passengers.`, 'passengers')
  }

  const base = rate.base * passengers
  const taxes = rate.taxes * passengers
  const convenienceFee = CONVENIENCE_FEE

  const insurance = extras.insurance ? INSURANCE_PER_PERSON * passengers : 0

  let discount = 0
  let couponLabel = null
  const couponCode = extras.coupon ? String(extras.coupon).trim().toUpperCase() : null
  if (couponCode) {
    const coupon = COUPONS[couponCode]
    if (!coupon) throw badRequest(`"${couponCode}" is not a valid coupon code.`, 'coupon')
    discount = Math.round((base * coupon.percentOffBase) / 100)
    couponLabel = `${couponCode} — ${coupon.label}`
  }

  const total = Math.max(0, base + taxes + convenienceFee + insurance - discount)

  const breakdown = [
    { key: 'base', label: `Base fare (${booking.train.class})`, amount: base },
    { key: 'taxes', label: 'Taxes & surcharges', amount: taxes },
    { key: 'convenienceFee', label: 'Convenience fee', amount: convenienceFee },
  ]
  if (insurance > 0) breakdown.push({ key: 'insurance', label: 'Travel insurance', amount: insurance })
  if (discount > 0) breakdown.push({ key: 'discount', label: couponLabel, amount: -discount, tone: 'discount' })

  return {
    currency: 'INR',
    amount: total,
    total,
    breakdown,
    passengers,
    couponApplied: Boolean(couponLabel),
  }
}

/**
 * Reject a request that carries an amount.
 *
 * Returning 400 rather than quietly discarding the field means a caller who
 * believes the browser sets the price finds out immediately, instead of
 * debugging a mismatch later.
 */
function assertNoClientAmount(body = {}) {
  const supplied = ['amount', 'total', 'fare', 'payableAmount'].filter((k) => body[k] !== undefined)
  if (supplied.length) {
    throw badRequest(
      `Amount is computed server-side and must not be supplied by the client. Ignored field(s): ${supplied.join(', ')}.`,
      supplied[0],
    )
  }
}

module.exports = { calculateFare, assertNoClientAmount, MAX_PASSENGERS }