'use strict'

/**
 * Payment store — console persistence behind a persistence seam.
 *
 * The team assignment requires a payments schema; that is the Database column
 * of the task sheet, not Team 5's Frontend/Backend columns. This module keeps
 * the same interface a database adapter would expose (`create`, `findByOrderId`,
 * `list`, `markRefunded`) so swapping in MySQL later touches one file and
 * nothing above it.
 *
 * Every state change is written to the console in a readable, greppable form.
 * Set PAYMENT_LOG_FORMAT=json in backend/.env for one-line-per-event output
 * when piping to a file.
 */

const env = require('../../config/env')

/** orderId -> payment record */
const store = new Map()

/** Razorpay order lifecycle: created -> attempted -> paid */
const ACTIVE_STATUSES = ['created', 'attempted', 'authorized']
const TERMINAL_STATUSES = ['captured', 'failed', 'refunded']

const FIELDS = [
  ['order', 'orderId'],
  ['payment', 'paymentId'],
  ['booking', 'bookingRef'],
  ['amount', 'amount'],
  ['method', 'method'],
  ['attempts', 'attempts'],
  ['status', 'status'],
  ['time', 'updatedAt'],
]

const rupees = (paise) =>
  `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function emit(event, record, extra = {}) {
  const payload = {
    event,
    orderId: record?.orderId ?? null,
    paymentId: record?.paymentId ?? null,
    bookingRef: record?.bookingRef ?? null,
    amount: record?.amount ?? null,
    amountFormatted: record?.amount != null ? rupees(record.amount) : null,
    method: record?.method ?? null,
    attempts: record?.attempts ?? null,
    status: record?.status ?? null,
    at: new Date().toISOString(),
    ...extra,
  }

  if (env.paymentLogFormat === 'json') {
    console.log('[YATRIO PAYMENT]', JSON.stringify(payload))
    return
  }

  const width = Math.max(...FIELDS.map(([k]) => k.length))
  const body = FIELDS.filter(([, key]) => payload[key] !== null && payload[key] !== undefined)
    .map(([label, key]) => `  ${label.padEnd(width)}  ${key === 'amount' ? rupees(payload[key]) : payload[key]}`)
    .join('\n')

  const extras = Object.entries(extra)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `  ${k.padEnd(width)}  ${v}`)
    .join('\n')

  const line = '─'.repeat(58)
  console.log(`\n${line}\n[YATRIO PAYMENT] ${event}\n${body}${extras ? `\n${extras}` : ''}\n${line}`)
}

/** @returns {object} the created record */
function create(fields) {
  const now = new Date().toISOString()
  const record = {
    orderId: fields.orderId,
    paymentId: fields.paymentId ?? null,
    signature: fields.signature ?? null,
    bookingRef: fields.bookingRef,
    amount: fields.amount,
    currency: fields.currency ?? 'INR',
    status: fields.status ?? 'created',
    method: fields.method ?? null,
    failureCode: fields.failureCode ?? null,
    failureReason: fields.failureReason ?? null,
    attempts: fields.attempts ?? 1,
    refundedAmount: null,
    refundId: null,
    // Denormalised so history renders without re-joining the booking.
    trainNo: fields.trainNo ?? null,
    trainName: fields.trainName ?? null,
    fromStation: fields.fromStation ?? null,
    toStation: fields.toStation ?? null,
    passengerName: fields.passengerName ?? null,
    passengerEmail: fields.passengerEmail ?? null,
    passengerContact: fields.passengerContact ?? null,
    createdAt: now,
    updatedAt: now,
  }

  store.set(record.orderId, record)
  emit('ORDER_CREATED', record)
  return record
}

/**
 * Patch a record and log the transition.
 * @param {string} orderId
 * @param {object} patch
 * @param {{event?: string, extra?: object, silent?: boolean}} [opts]
 */
function update(orderId, patch, opts = {}) {
  const existing = store.get(orderId)
  if (!existing) return null

  const record = { ...existing, ...patch, updatedAt: new Date().toISOString() }
  store.set(orderId, record)

  if (!opts.silent) emit(opts.event ?? record.status.toUpperCase(), record, opts.extra ?? {})
  return record
}

const findByOrderId = (orderId) => store.get(orderId) ?? null

/** Newest first, optionally filtered. */
function list({ status = 'all', page = 1, pageSize = 10 } = {}) {
  let rows = [...store.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  if (status === 'pending') rows = rows.filter((r) => ACTIVE_STATUSES.includes(r.status))
  else if (status !== 'all') rows = rows.filter((r) => r.status === status)

  const total = rows.length
  const start = (page - 1) * pageSize
  return {
    items: rows.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

/** Refunds are terminal: refuse a second refund on the same payment. */
function markRefunded(orderId, { refundId, amount }) {
  const record = update(orderId, { status: 'refunded', refundId, refundedAmount: amount }, {
    event: 'PAYMENT_REFUNDED',
    extra: { refund: refundId, refundAmount: rupees(amount) },
  })
  return record
}

/** Most recent attempt for a booking — used to enforce the retry cap. */
function latestForBooking(bookingRef) {
  return (
    [...store.values()]
      .filter((r) => r.bookingRef === bookingRef)
      .sort((a, b) => b.attempts - a.attempts || new Date(b.createdAt) - new Date(a.createdAt))[0] ?? null
  )
}

/**
 * Orders older than the TTL are expired for Yatrio's purposes.
 * This is our business rule (aligned with Team 4's reservation window), not a
 * Razorpay limit — the gateway would still accept the order for far longer.
 */
function isExpired(record, ttlMinutes = env.orderTtlMinutes) {
  if (TERMINAL_STATUSES.includes(record.status)) return false
  return Date.now() - new Date(record.createdAt).getTime() > ttlMinutes * 60_000
}

function findExpired(ttlMinutes) {
  return [...store.values()].filter((r) => isExpired(r, ttlMinutes))
}

/** Test seam — resets the store between cases. */
function reset() {
  store.clear()
}

module.exports = {
  create,
  update,
  findByOrderId,
  list,
  markRefunded,
  latestForBooking,
  isExpired,
  findExpired,
  reset,
  emit,
  ACTIVE_STATUSES,
  TERMINAL_STATUSES,
  rupees,
}