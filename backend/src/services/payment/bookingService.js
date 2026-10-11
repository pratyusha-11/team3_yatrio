'use strict'

/**
 * Booking lookup — Team 5's view of a booking.
 *
 * In production this is Team 4's booking service. Team 5 must never receive a
 * fare from the browser: it asks this module what a booking costs and uses
 * that figure, so a tampered client payload cannot change what is charged.
 * (Team assignment, Team 5 *Backend*: "Never trust amount/status directly
 * from the client.")
 *
 * The seed below mirrors Frontend/src/data/demoBooking.js so the two agree
 * during integration. Replace `resolveBooking` with a call to Team 4's API when
 * it lands; nothing else in the payment flow changes.
 */

const { notFound } = require('../../utils/errors')

/** Fare basis per class, in paise. Server-owned — never sent by the client. */
const CLASS_RATES = {
  '1A': { base: 82500, taxes: 7425 }, // AC First AC
  '2A': { base: 68000, taxes: 6120 }, // AC 2 Tier
  '3A': { base: 54000, taxes: 4860 }, // AC 3 Tier
  SL: { base: 31000, taxes: 2790 }, // Sleeper
  '2S': { base: 22000, taxes: 1980 }, // Chair Car
}

const CONVENIENCE_FEE = 3000 // ₹30 platform charge, per booking
const INSURANCE_PER_PERSON = 45 // ₹0.45
const COUPONS = {
  YATRIO10: { percentOffBase: 10, label: '10% off base fare' },
}

/** Optional add-ons a booking may carry. Applied server-side. */
const DEFAULT_EXTRAS = { insurance: false, coupon: null }

const SEED_BOOKINGS = {
  'YTR-12951-7QX2': {
    bookingRef: 'YTR-12951-7QX2',
    status: 'CONFIRMED',
    availabilityCode: 'AVAILABLE-0460',
    train: { number: '12951', name: 'Rajdhani', class: '3A', coach: 'B4', seat: '27' },
    route: { from: 'NDLS', fromName: 'New Delhi', to: 'MTJ', toName: 'Mathura Junction', distanceKm: 159 },
    departureAt: '2026-09-12T16:55:00+05:30',
    arrivalAt: '2026-09-12T19:35:00+05:30',
    passengers: [
      { id: 'p1', name: 'Arjun Mehta', age: 34, gender: 'male', berth: 'window' },
    ],
    contact: { email: 'arjun.mehta@example.com', phone: '+919000090000' },
    extras: DEFAULT_EXTRAS,
  },
  'YTR-12951-7QX3': {
    bookingRef: 'YTR-12951-7QX3',
    status: 'CONFIRMED',
    availabilityCode: 'AVAILABLE-0117',
    train: { number: '12951', name: 'Rajdhani', class: '2A', coach: 'A2', seat: '14' },
    route: { from: 'NDLS', fromName: 'New Delhi', to: 'MTJ', toName: 'Mathura Junction', distanceKm: 159 },
    departureAt: '2026-09-13T08:15:00+05:30',
    arrivalAt: '2026-09-13T10:55:00+05:30',
    passengers: [
      { id: 'p1', name: 'Arjun Mehta', age: 34, gender: 'male', berth: 'window' },
      { id: 'p2', name: 'Ira Mehta', age: 29, gender: 'female', berth: 'aisle' },
    ],
    contact: { email: 'arjun.mehta@example.com', phone: '+919000090000' },
    extras: DEFAULT_EXTRAS,
  },
}

/**
 * Resolve a booking by reference.
 *
 * @param {string} bookingRef
 * @throws {HttpError} 404 when the booking is unknown
 */
function resolveBooking(bookingRef) {
  const booking = SEED_BOOKINGS[bookingRef]
  if (!booking) {
    throw notFound(`No booking found for reference "${bookingRef}".`)
  }
  return booking
}

/** Every booking the flow can be entered for — used by the frontend demo. */
const listBookings = () => Object.values(SEED_BOOKINGS)

const isKnownBooking = (bookingRef) => Object.hasOwn(SEED_BOOKINGS, bookingRef)

module.exports = { resolveBooking, listBookings, isKnownBooking, CLASS_RATES, COUPONS, CONVENIENCE_FEE, INSURANCE_PER_PERSON }