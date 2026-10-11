'use strict'

/**
 * Team 5 payment tests — the seven cases the assignment requires:
 * success, failure, duplicate verification, tampered amount, expired order,
 * retry, and refund.
 *
 * Runs offline: the Razorpay gateway is stubbed, so no network or keys needed.
 *
 *   node backend/tests/payment.test.js
 */

const assert = require('assert')

// Stub the gateway before anything loads it.
const razorpay = require('../src/services/payment/razorpayService')
const BOOKING = 'YTR-12951-7QX2' // 3A, 1 passenger, ₹619 base+tax+fee
const SECRET = process.env.RAZORPAY_KEY_SECRET

let seq = 0
let gateway = null
/** Overridable gateway behaviour per test. */
function stubGateway(overrides = {}) {
  gateway = {
    createOrder: async ({ amount }) => ({
      orderId: `order_stub_${String(++seq).padStart(4, '0')}`,
      amount,
      currency: 'INR',
      status: 'created',
      receipt: 'stub',
      ...overrides.createOrder,
    }),
    fetchPayment: async (paymentId) => ({
      paymentId,
      orderId: gateway.createdFor ?? null,
      status: 'captured',
      method: 'upi',
      amount: 61900,
      currency: 'INR',
      errorCode: null,
      errorDescription: null,
      errorReason: null,
      ...overrides.fetchPayment,
    }),
    refundPayment: async (paymentId, amount) => ({
      id: `rfnd_stub_${String(++seq).padStart(4, '0')}`,
      entity: 'refund',
      payment_id: paymentId,
      amount,
      status: 'processed',
      ...overrides.refundPayment,
    }),
    createdFor: null,
    ...overrides.extra,
  }
  razorpay.createOrder = gateway.createOrder
  razorpay.fetchPayment = gateway.fetchPayment
  razorpay.refundPayment = gateway.refundPayment
}

const store = require('../src/services/payment/paymentStore')
const ctrl = require('../src/controllers/paymentController')
const crypto = require('crypto')

/** Mimic express req/res so controller handlers can be called directly. */
function call(handler, { body = {}, params = {}, query = {} } = {}) {
  const res = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this },
    json(payload) { this.payload = payload; return this },
  }
  return handler({ body, params, query }, res).then(() => res)
}

const sign = (orderId, paymentId) =>
  crypto.createHmac('sha256', SECRET).update(`${orderId}|${paymentId}`).digest('hex')

let passed = 0
const results = []

async function test(name, fn) {
  store.reset()
  seq = 0
  stubGateway()
  try {
    await fn()
    passed += 1
    results.push(['ok  ', name])
  } catch (err) {
    results.push(['FAIL', `${name}\n       ${err.message}`])
    process.exitCode = 1
  }
}

async function expectHttpError(fn, code) {
  try {
    await fn()
  } catch (err) {
    assert.strictEqual(err.code, code, `expected ${code}, got ${err.code}: ${err.message}`)
    return err
  }
  throw new Error(`expected the call to fail with ${code}`)
}

/* ------------------------------------------------------------------ cases */

async function run() {
  console.log('\nTeam 5 — payment integration\n')

  // 1. SUCCESS -------------------------------------------------------------
  await test('success — valid signature captures the payment', async () => {
    stubGateway()
    const created = await call(ctrl.createOrder, { body: { bookingRef: BOOKING } })
    assert.strictEqual(created.statusCode, 201)

    const orderId = created.payload.orderId
    gateway.createdFor = orderId
    const paymentId = 'pay_stub_0001'

    const verified = await call(ctrl.verifyPayment, {
      body: { orderId, razorpayPaymentId: paymentId, razorpayOrderId: orderId, razorpaySignature: sign(orderId, paymentId) },
    })

    assert.strictEqual(verified.payload.status, 'captured')
    assert.strictEqual(verified.payload.paymentId, paymentId)
    assert.strictEqual(store.findByOrderId(orderId).status, 'captured')
  })

  // 2. FAILURE -------------------------------------------------------------
  await test('failure — a bad signature is rejected and never captured', async () => {
    stubGateway()
    const created = await call(ctrl.createOrder, { body: { bookingRef: BOOKING } })
    const orderId = created.payload.orderId

    await expectHttpError(
      () => call(ctrl.verifyPayment, {
        body: { orderId, razorpayPaymentId: 'pay_x', razorpayOrderId: orderId, razorpaySignature: 'deadbeef' },
      }),
      'SIGNATURE_MISMATCH',
    )

    const record = store.findByOrderId(orderId)
    assert.strictEqual(record.status, 'failed')
    assert.strictEqual(record.failureCode, 'SIGNATURE_MISMATCH')
    assert.notStrictEqual(record.status, 'captured')
  })

  // 3. DUPLICATE VERIFICATION ---------------------------------------------
  await test('duplicate verification — replay is idempotent', async () => {
    stubGateway()
    const created = await call(ctrl.createOrder, { body: { bookingRef: BOOKING } })
    const orderId = created.payload.orderId
    gateway.createdFor = orderId

    const paymentId = 'pay_stub_dup'
    const body = { orderId, razorpayPaymentId: paymentId, razorpayOrderId: orderId, razorpaySignature: sign(orderId, paymentId) }

    const first = await call(ctrl.verifyPayment, { body })
    assert.strictEqual(first.payload.status, 'captured')
    const firstUpdatedAt = store.findByOrderId(orderId).updatedAt

    // Duplicate callback arrives.
    const second = await call(ctrl.verifyPayment, { body })
    assert.strictEqual(second.payload.status, 'captured')
    assert.strictEqual(second.payload.duplicate, true)

    const record = store.findByOrderId(orderId)
    assert.strictEqual(record.updatedAt, firstUpdatedAt, 'duplicate must not rewrite the record')
    assert.strictEqual(record.attempts, 1, 'duplicate must not inflate attempts')
  })

  // 4. TAMPERED AMOUNT -----------------------------------------------------
  await test('tampered amount — client-supplied price is refused', async () => {
    stubGateway()

    // Explicit amount in the body is a hard error, not silently ignored.
    await expectHttpError(
      () => call(ctrl.createOrder, { body: { bookingRef: BOOKING, amount: 100 } }),
      'BAD_REQUEST',
    )

    // And with no amount supplied, the server figure is used regardless.
    const created = await call(ctrl.createOrder, { body: { bookingRef: BOOKING } })
    const { fare, amount } = created.payload
    assert.strictEqual(amount, fare.amount)
    // 54000 base + 4860 taxes + 3000 fee for 3A
    assert.strictEqual(amount, 61860)
    assert.notStrictEqual(amount, 100)
  })

  // 5. EXPIRED ORDER -------------------------------------------------------
  await test('expired order — past the TTL it cannot be verified', async () => {
    stubGateway()
    const created = await call(ctrl.createOrder, { body: { bookingRef: BOOKING } })
    const orderId = created.payload.orderId

    // Age the record past the TTL. create() stamps createdAt itself, so the
    // existing record is patched rather than recreated.
    store.update(orderId, { createdAt: new Date(Date.now() - 60 * 60_000).toISOString() }, { silent: true })
    assert.strictEqual(store.isExpired(store.findByOrderId(orderId)), true, 'record should read as expired')

    const err = await expectHttpError(
      () => call(ctrl.verifyPayment, {
        body: { orderId, razorpayPaymentId: 'pay_x', razorpayOrderId: orderId, razorpaySignature: sign(orderId, 'pay_x') },
      }),
      'ORDER_EXPIRED',
    )
    assert.match(err.message, /expired/i)
    assert.strictEqual(store.findByOrderId(orderId).status, 'failed')
  })

  // 6. RETRY ---------------------------------------------------------------
  await test('retry — a new order is minted and the cap is enforced', async () => {
    stubGateway()

    const first = await call(ctrl.createOrder, { body: { bookingRef: BOOKING } })
    assert.strictEqual(first.payload.attempts, 1)
    assert.strictEqual(first.payload.reused, undefined)

    // A live order is reused rather than duplicated.
    const reuse = await call(ctrl.createOrder, { body: { bookingRef: BOOKING } })
    assert.strictEqual(reuse.payload.reused, true)
    assert.strictEqual(reuse.payload.orderId, first.payload.orderId)

    // Mark it failed so the next attempt mints a fresh order id.
    store.update(first.payload.orderId, { status: 'failed' })

    const second = await call(ctrl.createOrder, { body: { bookingRef: BOOKING } })
    assert.notStrictEqual(second.payload.orderId, first.payload.orderId, 'retry needs a new order id')
    assert.strictEqual(second.payload.attempts, 2)

    // Cap.
    store.update(second.payload.orderId, { status: 'failed' })
    const third = await call(ctrl.createOrder, { body: { bookingRef: BOOKING } })
    assert.strictEqual(third.payload.attempts, 3)
    store.update(third.payload.orderId, { status: 'failed' })
    const fourth = await call(ctrl.createOrder, { body: { bookingRef: BOOKING } })
    assert.strictEqual(fourth.payload.attempts, 4)

    store.update(fourth.payload.orderId, { status: 'failed' })
    await expectHttpError(() => call(ctrl.createOrder, { body: { bookingRef: BOOKING } }), 'MAX_ATTEMPTS')
  })

  // 7. REFUND --------------------------------------------------------------
  await test('refund — captured payments refund once and are then terminal', async () => {
    stubGateway()
    const created = await call(ctrl.createOrder, { body: { bookingRef: BOOKING } })
    const orderId = created.payload.orderId
    gateway.createdFor = orderId

    // Cannot refund something not captured.
    await expectHttpError(() => call(ctrl.refundPayment, { body: { orderId } }), 'NOT_CAPTURED')

    const paymentId = 'pay_stub_refund'
    await call(ctrl.verifyPayment, {
      body: { orderId, razorpayPaymentId: paymentId, razorpayOrderId: orderId, razorpaySignature: sign(orderId, paymentId) },
    })

    const refunded = await call(ctrl.refundPayment, { body: { orderId } })
    assert.strictEqual(refunded.payload.status, 'refunded')
    assert.strictEqual(refunded.payload.refundedAmount, 61860)
    assert.ok(refunded.payload.refundId)

    // Second refund is refused.
    await expectHttpError(() => call(ctrl.refundPayment, { body: { orderId } }), 'ALREADY_REFUNDED')

    // Verifying a refunded payment is refused too.
    await expectHttpError(
      () => call(ctrl.verifyPayment, {
        body: { orderId, razorpayPaymentId: paymentId, razorpayOrderId: orderId, razorpaySignature: sign(orderId, paymentId) },
      }),
      'REFUNDED',
    )
  })

  // extras ------------------------------------------------------------------
  await test('history — reflects the flow and filters by status', async () => {
    stubGateway()
    const created = await call(ctrl.createOrder, { body: { bookingRef: BOOKING } })
    const orderId = created.payload.orderId
    gateway.createdFor = orderId
    const paymentId = 'pay_stub_hist'
    await call(ctrl.verifyPayment, {
      body: { orderId, razorpayPaymentId: paymentId, razorpayOrderId: orderId, razorpaySignature: sign(orderId, paymentId) },
    })

    const all = await call(ctrl.getHistory, { query: {} })
    assert.strictEqual(all.payload.total, 1)

    const captured = await call(ctrl.getHistory, { query: { status: 'captured' } })
    assert.strictEqual(captured.payload.total, 1)

    const failed = await call(ctrl.getHistory, { query: { status: 'failed' } })
    assert.strictEqual(failed.payload.total, 0)
  })

  await test('unknown booking reference is refused', async () => {
    await expectHttpError(() => call(ctrl.createOrder, { body: { bookingRef: 'NOPE' } }), 'NOT_FOUND')
  })

  await test('coupon is applied server-side and a bad one is refused', async () => {
    stubGateway()
    const withCoupon = await call(ctrl.createOrder, { body: { bookingRef: BOOKING, extras: { coupon: 'YATRIO10' } } })
    // 10% off the 54000 base = 5400
    assert.strictEqual(withCoupon.payload.amount, 61860 - 5400)

    store.reset()
    await expectHttpError(
      () => call(ctrl.createOrder, { body: { bookingRef: BOOKING, extras: { coupon: 'NOTREAL' } } }),
      'BAD_REQUEST',
    )
  })

  /* --------------------------------------------------------------- output */
  for (const [status, name] of results) console.log(`  ${status} ${name}`)
  console.log(`\n  ${passed}/${results.length} passed${process.exitCode ? ' — with failures' : ''}\n`)
}

run().catch((err) => {
  console.error('\nharness error:', err)
  process.exit(1)
})