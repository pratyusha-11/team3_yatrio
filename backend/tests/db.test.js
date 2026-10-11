'use strict'

/**
 * Team 5 database tests — the Database column of the task sheet.
 *
 * Unlike tests/payment.test.js these need a real MySQL. They exercise the
 * constraints rather than the plumbing: that a gateway id can be recorded once,
 * that a bad signature never captures, that a refund happens once, and that a
 * settled payment cannot be walked backwards.
 *
 *   npm run migrate && npm run seed && node tests/db.test.js
 *
 * Every case runs against its own booking reference and the whole set is
 * deleted in a finally block, so the suite leaves the database as it found it.
 * A transaction is not an option here: create_payment_record(),
 * confirm_payment() and process_refund() each COMMIT internally, which would
 * silently end an outer ROLLBACK.
 */

const assert = require('assert')

const { sequelize, connection } = require('../src/config/database')

const BOOKING = 'YTR-TEST-DB0001'
const ORDER = 'order_dbtest0001'
const PAYMENT = 'pay_dbtest0001'
const REFUND = 'rfnd_dbtest0001'

const results = []
let passed = 0

async function test(name, fn) {
  try {
    await fn()
    passed += 1
    results.push(['ok  ', name])
  } catch (err) {
    results.push(['FAIL', `${name}\n       ${err.message}`])
    process.exitCode = 1
  }
}

/** Assert a call fails, and that MySQL raised it with `reason`. */
async function expectRefusal(fn, reason) {
  try {
    await fn()
  } catch (err) {
    const message = err.original?.sqlMessage ?? err.parent?.sqlMessage ?? err.message
    assert.ok(
      message.includes(reason),
      `expected MySQL to refuse with "${reason}", got "${message}"`,
    )
    return message
  }
  throw new Error(`expected the call to be refused with "${reason}", but it succeeded`)
}

/** Every value is escaped by Sequelize's replacement binding. */
const rows = async (sql, ...params) => {
  const [result] = await sequelize.query(sql, { replacements: params })
  return result
}

const one = async (sql, ...params) => (await rows(sql, ...params))[0]

/** Remove anything this suite created, refunds first (FK). */
async function cleanup() {
  await sequelize.query('DELETE FROM refunds WHERE gateway_refund_id LIKE ?', {
    replacements: ['rfnd_dbtest%'],
  })
  await sequelize.query('DELETE FROM payments WHERE booking_ref = ?', { replacements: [BOOKING] })
  await sequelize.query('DELETE FROM payments WHERE booking_ref = ?', {
    replacements: ['YTR-TEST-DB0002'],
  })
}

/* ------------------------------------------------------------------ cases */

async function run() {
  console.log('\nTeam 5 — database\n')

  /* -- schema ------------------------------------------------------------- */

  await test('schema: the four Team 5 tables exist', async () => {
    const found = await rows(
      `SELECT TABLE_NAME AS name FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('payments','payment_transactions','refunds','payment_methods')`,
    )
    assert.deepStrictEqual(
      found.map((r) => r.name).sort(),
      ['payment_methods', 'payment_transactions', 'payments', 'refunds'],
    )
  })

  await test('schema: procedures, triggers and the history view exist', async () => {
    const routines = await rows(
      `SELECT ROUTINE_NAME AS name FROM information_schema.ROUTINES
        WHERE ROUTINE_SCHEMA = DATABASE()`,
    )
    const names = routines.map((r) => r.name)
    for (const expected of ['create_payment_record', 'confirm_payment', 'process_refund']) {
      assert.ok(names.includes(expected), `missing procedure ${expected}`)
    }

    // The database is shared by all seven teams, so assert that Team 5's
    // triggers are present — not that these are the only ones in the schema.
    // Teams 1, 2 and 7 have audit triggers of their own.
    const triggers = await rows(
      `SELECT TRIGGER_NAME AS name FROM information_schema.TRIGGERS
        WHERE TRIGGER_SCHEMA = DATABASE()`,
    )
    const triggerNames = triggers.map((t) => t.name)
    for (const expected of ['trg_payments_status_guard', 'trg_refunds_payment_guard']) {
      assert.ok(triggerNames.includes(expected), `missing trigger ${expected}`)
    }

    const views = await rows(
      `SELECT TABLE_NAME AS name FROM information_schema.VIEWS WHERE TABLE_SCHEMA = DATABASE()`,
    )
    assert.ok(views.some((v) => v.name === 'v_payment_history'))
  })

  await test('schema: the unique indexes that stop duplicate transaction ids', async () => {
    const indexes = await rows(
      `SELECT INDEX_NAME AS name, NON_UNIQUE AS non_unique, TABLE_NAME AS tbl
         FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND NON_UNIQUE = 0
        GROUP BY INDEX_NAME, NON_UNIQUE, TABLE_NAME`,
    )
    const unique = indexes.map((i) => `${i.tbl}.${i.name}`)

    for (const expected of [
      'payments.uq_payments_gateway_order_id',
      'payments.uq_payments_gateway_payment_id',
      'payments.uq_payments_booking_attempt',
      'payment_transactions.uq_ptx_gateway_order_id',
      'payment_transactions.uq_ptx_gateway_payment_id',
      'payment_transactions.uq_ptx_gateway_refund_id',
      'refunds.uq_refunds_gateway_refund_id',
      'payment_methods.uq_payment_methods_code',
    ]) {
      assert.ok(unique.includes(expected), `missing unique index ${expected}`)
    }
  })

  /* -- create_payment_record ---------------------------------------------- */

  await test('create_payment_record writes the payment and its first transaction', async () => {
    await cleanup()

    await sequelize.query(
      `CALL create_payment_record(
         ?, ?, ?, 'INR', 1, NULL, 30, NULL,
         '12951', 'Rajdhani', 'NDLS', 'MTJ',
         'Test Traveller', 'test@example.com', '+919000000000', @payment_id
       )`,
      { replacements: [BOOKING, ORDER, 12345] },
    )

    const payment = await one('SELECT * FROM payments WHERE gateway_order_id = ?', ORDER)
    assert.strictEqual(payment.booking_ref, BOOKING)
    assert.strictEqual(payment.status, 'created')
    assert.strictEqual(Number(payment.amount), 12345)
    assert.strictEqual(payment.currency, 'INR')
    assert.strictEqual(Number(payment.attempt_number), 1)
    // ORDER_TTL_MINUTES applied server-side.
    assert.ok(payment.expires_at, 'expires_at should be set from the TTL')

    const transaction = await one(
      'SELECT * FROM payment_transactions WHERE gateway_order_id = ?',
      ORDER,
    )
    assert.strictEqual(transaction.event, 'ORDER_CREATED')
    assert.strictEqual(Number(transaction.payment_id), Number(payment.payment_id))
  })

  await test('a duplicate gateway order id is refused', async () => {
    await expectRefusal(
      () =>
        sequelize.query(
          `CALL create_payment_record(
             ?, ?, ?, 'INR', 2, NULL, 30, NULL,
             '12951', 'Rajdhani', 'NDLS', 'MTJ',
             'Test Traveller', 'test@example.com', '+919000000000', @payment_id
           )`,
          { replacements: [BOOKING, ORDER, 12345] },
        ),
      'DUPLICATE_GATEWAY_ORDER_ID',
    )
  })

  await test('a booking cannot hold two attempts with the same number', async () => {
    // A different gateway order, same booking and attempt number: this is a
    // retry loop, and uq_payments_booking_attempt is what stops it.
    await expectRefusal(
      () =>
        sequelize.query(
          `CALL create_payment_record(
             ?, 'order_dbtest0002', 12345, 'INR', 1, NULL, 30, NULL,
             '12951', 'Rajdhani', 'NDLS', 'MTJ',
             'Test Traveller', 'test@example.com', '+919000000000', @payment_id
           )`,
          { replacements: [BOOKING] },
        ),
      'DUPLICATE_BOOKING_ATTEMPT',
    )
  })

  await test('a zero amount is refused before anything is written', async () => {
    await expectRefusal(
      () =>
        sequelize.query(
          `CALL create_payment_record(
             ?, 'order_dbtest0003', 0, 'INR', 1, NULL, 30, NULL,
             '12951', 'Rajdhani', 'NDLS', 'MTJ',
             'Test Traveller', 'test@example.com', '+919000000000', @payment_id
           )`,
          { replacements: [BOOKING] },
        ),
      'AMOUNT_MUST_BE_POSITIVE',
    )
  })

  /* -- confirm_payment ---------------------------------------------------- */

  await test('confirm_payment captures a verified payment', async () => {
    await sequelize.query(
      `CALL confirm_payment(?, ?, 'captured', 'upi', 1, 'abc123', NULL, NULL, ?)`,
      { replacements: [ORDER, PAYMENT, JSON.stringify({ status: 'captured' })] },
    )

    const payment = await one('SELECT * FROM payments WHERE gateway_order_id = ?', ORDER)
    assert.strictEqual(payment.status, 'captured')
    assert.strictEqual(payment.gateway_payment_id, PAYMENT)
    assert.strictEqual(payment.method_code, 'upi')
    assert.ok(payment.captured_at, 'captured_at should be stamped')

    const transaction = await one(
      'SELECT * FROM payment_transactions WHERE gateway_order_id = ?',
      ORDER,
    )
    assert.strictEqual(transaction.event, 'PAYMENT_VERIFIED')
    assert.strictEqual(Number(transaction.signature_valid), 1)
    assert.ok(transaction.verified_at, 'verified_at should be stamped')
  })

  await test('replaying the same confirmation changes nothing', async () => {
    const before = await one('SELECT * FROM payment_transactions WHERE gateway_order_id = ?', ORDER)
    const capturedAt = (await one('SELECT captured_at FROM payments WHERE gateway_order_id = ?', ORDER)).captured_at

    await sequelize.query(
      `CALL confirm_payment(?, ?, 'captured', 'upi', 1, 'abc123', NULL, NULL, ?)`,
      { replacements: [ORDER, PAYMENT, JSON.stringify({ status: 'captured' })] },
    )

    const after = await one('SELECT * FROM payment_transactions WHERE gateway_order_id = ?', ORDER)
    const payments = await one('SELECT * FROM payments WHERE gateway_order_id = ?', ORDER)

    assert.strictEqual(after.transaction_id, before.transaction_id, 'a replay must not add a row')
    assert.strictEqual(payments.status, 'captured')
    assert.strictEqual(String(payments.captured_at), String(capturedAt), 'captured_at must not move')

    const [{ n }] = await rows(
      'SELECT COUNT(*) AS n FROM payment_transactions WHERE gateway_order_id = ?',
      ORDER,
    )
    assert.strictEqual(Number(n), 1, 'exactly one transaction row per attempt')
  })

  await test('a failed signature never captures', async () => {
    await cleanup()

    await sequelize.query(
      `CALL create_payment_record(
         ?, ?, ?, 'INR', 1, NULL, 30, NULL,
         '12951', 'Rajdhani', 'NDLS', 'MTJ',
         'Test Traveller', 'test@example.com', '+919000000000', @payment_id
       )`,
      { replacements: [BOOKING, ORDER, 12345] },
    )

    // The gateway claims captured; the HMAC did not verify. Signature wins.
    await sequelize.query(
      `CALL confirm_payment(?, 'pay_dbtest0009', 'captured', 'upi', 0, NULL, NULL, NULL, NULL)`,
      { replacements: [ORDER] },
    )

    const payment = await one('SELECT * FROM payments WHERE gateway_order_id = ?', ORDER)
    assert.strictEqual(payment.status, 'failed')
    assert.strictEqual(payment.failure_code, 'SIGNATURE_MISMATCH')
    assert.ok(!payment.captured_at, 'a rejected payment must not be stamped captured')
  })

  await test('a payment id belonging to another order is refused', async () => {
    await cleanup()

    await sequelize.query(
      `CALL create_payment_record(
         ?, ?, ?, 'INR', 1, NULL, 30, NULL,
         '12951', 'Rajdhani', 'NDLS', 'MTJ',
         'Test Traveller', 'test@example.com', '+919000000000', @payment_id
       )`,
      { replacements: [BOOKING, ORDER, 12345] },
    )
    await sequelize.query(
      `CALL create_payment_record(
         ?, ?, ?, 'INR', 1, NULL, 30, NULL,
         '12951', 'Rajdhani', 'NDLS', 'MTJ',
         'Test Traveller', 'test@example.com', '+919000000000', @payment_id
       )`,
      { replacements: ['YTR-TEST-DB0002', 'order_dbtest0005', 999] },
    )
    // Bind the payment id to the *other* order...
    await sequelize.query(
      `CALL confirm_payment('order_dbtest0005', 'pay_dbtest0005', 'captured', 'upi', 1, 'fp', NULL, NULL, NULL)`,
    )

    // ...then present it against this one.
    await expectRefusal(
      () =>
        sequelize.query(
          `CALL confirm_payment(?, 'pay_dbtest0005', 'captured', 'upi', 1, 'fp', NULL, NULL, NULL)`,
          { replacements: [ORDER] },
        ),
      'ORDER_MISMATCH',
    )
  })

  await test('a failed payment cannot be captured afterwards', async () => {
    // ORDER's payment was left 'created' above; fail it, then try to capture.
    await sequelize.query(
      `CALL confirm_payment(?, 'pay_dbtest0007', 'failed', 'upi', 1, 'fp', 'BAD_REQUEST_ERROR', 'declined', NULL)`,
      { replacements: [ORDER] },
    )

    const payment = await one('SELECT status FROM payments WHERE gateway_order_id = ?', ORDER)
    assert.strictEqual(payment.status, 'failed')

    await expectRefusal(
      () =>
        sequelize.query(
          `CALL confirm_payment(?, 'pay_dbtest0008', 'captured', 'upi', 1, 'fp', NULL, NULL, NULL)`,
          { replacements: [ORDER] },
        ),
      'FAILED_PAYMENT_NOT_CAPTURABLE',
    )
  })

  /* -- process_refund ----------------------------------------------------- */

  await test('process_refund reverses a captured payment and links the attempt', async () => {
    await cleanup()

    await sequelize.query(
      `CALL create_payment_record(
         ?, ?, ?, 'INR', 1, NULL, 30, NULL,
         '12951', 'Rajdhani', 'NDLS', 'MTJ',
         'Test Traveller', 'test@example.com', '+919000000000', @payment_id
       )`,
      { replacements: [BOOKING, ORDER, 20000] },
    )
    await sequelize.query(
      `CALL confirm_payment(?, ?, 'captured', 'card', 1, 'fp', NULL, NULL, NULL)`,
      { replacements: [ORDER, PAYMENT] },
    )
    await sequelize.query(
      `CALL process_refund(
         (SELECT payment_id FROM payments WHERE gateway_order_id = ?),
         ?, ?, 'Cancelled by traveller', 'system', NULL, @refund_id
       )`,
      { replacements: [ORDER, REFUND, 20000] },
    )

    const payment = await one('SELECT * FROM payments WHERE gateway_order_id = ?', ORDER)
    assert.strictEqual(payment.status, 'refunded')
    assert.strictEqual(Number(payment.refunded_amount), 20000)
    assert.ok(payment.refunded_at, 'refunded_at should be stamped')

    const refund = await one('SELECT * FROM refunds WHERE gateway_refund_id = ?', REFUND)
    assert.strictEqual(refund.status, 'processed')
    assert.strictEqual(refund.reason, 'Cancelled by traveller')

    const transaction = await one(
      'SELECT * FROM payment_transactions WHERE gateway_order_id = ?',
      ORDER,
    )
    assert.strictEqual(transaction.gateway_refund_id, REFUND)
    assert.strictEqual(transaction.event, 'PAYMENT_REFUNDED')
  })

  await test('a second refund of the same payment is refused', async () => {
    await expectRefusal(
      () =>
        sequelize.query(
          `CALL process_refund(
             (SELECT payment_id FROM payments WHERE gateway_order_id = ?),
             'rfnd_dbtest0002', 100, NULL, 'system', NULL, @refund_id
           )`,
          { replacements: [ORDER] },
        ),
      'ALREADY_REFUNDED',
    )
  })

  await test('the trigger refuses a refund inserted behind the procedure', async () => {
    // The guard must hold for any writer, not only the ones that use the API.
    await expectRefusal(
      () =>
        sequelize.query(
          `INSERT INTO refunds (payment_id, gateway_refund_id, amount, currency, status)
           SELECT payment_id, 'rfnd_dbtest0003', 100, 'INR', 'processed'
             FROM payments WHERE gateway_order_id = ?`,
          { replacements: [ORDER] },
        ),
      'NOT_CAPTURED',
    )
  })

  await test('a refund larger than the capture is refused', async () => {
    await cleanup()

    await sequelize.query(
      `CALL create_payment_record(
         ?, ?, ?, 'INR', 1, NULL, 30, NULL,
         '12951', 'Rajdhani', 'NDLS', 'MTJ',
         'Test Traveller', 'test@example.com', '+919000000000', @payment_id
       )`,
      { replacements: [BOOKING, ORDER, 5000] },
    )
    await sequelize.query(
      `CALL confirm_payment(?, ?, 'captured', 'upi', 1, 'fp', NULL, NULL, NULL)`,
      { replacements: [ORDER, PAYMENT] },
    )

    await expectRefusal(
      () =>
        sequelize.query(
          `CALL process_refund(
             (SELECT payment_id FROM payments WHERE gateway_order_id = ?),
             'rfnd_dbtest0004', 5001, NULL, 'system', NULL, @refund_id
           )`,
          { replacements: [ORDER] },
        ),
      'REFUND_EXCEEDS_CAPTURE',
    )
  })

  /* -- guards ------------------------------------------------------------- */

  await test('a captured payment cannot be walked back to failed', async () => {
    await expectRefusal(
      () =>
        sequelize.query('UPDATE payments SET status = ? WHERE gateway_order_id = ?', {
          replacements: ['failed', ORDER],
        }),
      'CAPTURED_PAYMENT_ONLY_REFUNDS',
    )
  })

  await test('a refunded payment is final', async () => {
    await cleanup()

    await sequelize.query(
      `CALL create_payment_record(
         ?, ?, ?, 'INR', 1, NULL, 30, NULL,
         '12951', 'Rajdhani', 'NDLS', 'MTJ',
         'Test Traveller', 'test@example.com', '+919000000000', @payment_id
       )`,
      { replacements: [BOOKING, ORDER, 3000] },
    )
    await sequelize.query(
      `CALL confirm_payment(?, ?, 'captured', 'upi', 1, 'fp', NULL, NULL, NULL)`,
      { replacements: [ORDER, PAYMENT] },
    )
    await sequelize.query(
      `CALL process_refund(
         (SELECT payment_id FROM payments WHERE gateway_order_id = ?),
         ?, 3000, NULL, 'system', NULL, @refund_id
       )`,
      { replacements: [ORDER, REFUND] },
    )

    await expectRefusal(
      () =>
        sequelize.query('UPDATE payments SET status = ? WHERE gateway_order_id = ?', {
          replacements: ['created', ORDER],
        }),
      'TERMINAL_STATUS_IS_FINAL',
    )
  })

  await test('confirming an unknown order is refused', async () => {
    await expectRefusal(
      () =>
        sequelize.query(
          `CALL confirm_payment('order_does_not_exist', 'pay_x', 'captured', 'upi', 1, 'fp', NULL, NULL, NULL)`,
        ),
      'ORDER_NOT_FOUND',
    )
  })

  /* -- reads -------------------------------------------------------------- */

  await test('v_payment_history returns the seeded demo payments', async () => {
    const history = await rows(
      `SELECT booking_ref, status, amount, method_display_name, last_event, settled_amount
         FROM v_payment_history
        WHERE booking_ref IN ('YTR-12951-7QX2','YTR-12951-7QX3')`,
    )
    assert.ok(history.length >= 4, `expected the seeded rows, found ${history.length}`)

    const statuses = history.map((r) => r.status).sort()
    assert.deepStrictEqual(statuses, ['authorized', 'captured', 'failed', 'refunded'])

    const settled = history.find((r) => r.status === 'captured')
    assert.strictEqual(Number(settled.settled_amount), 61860)
    assert.strictEqual(settled.method_display_name, 'UPI')
  })

  await test('the models read the seeded rows back through Sequelize', async () => {
    const { Payment, PaymentTransaction, Refund, PaymentMethod } = require('../src/models')

    const methods = await PaymentMethod.findAll({ order: [['sortOrder', 'ASC']] })
    assert.strictEqual(methods.length, 4)
    assert.strictEqual(methods[0].code, 'upi', 'UPI is requested first (PAYMENTS.md 3)')
    assert.strictEqual(methods[0].displayName, 'UPI')

    const payment = await Payment.findOne({
      where: { gatewayOrderId: 'order_T5demo0002QX2a2' },
      include: [
        { model: PaymentTransaction, as: 'transactions' },
        { model: Refund, as: 'refunds' },
        { model: PaymentMethod, as: 'method' },
      ],
    })

    assert.strictEqual(payment.bookingRef, 'YTR-12951-7QX2')
    assert.strictEqual(payment.status, 'captured')
    assert.strictEqual(Number(payment.amount), 61860, 'amount comes back in paise')
    assert.strictEqual(payment.method.displayName, 'UPI')
    assert.strictEqual(payment.transactions.length, 1)
    assert.strictEqual(payment.refunds.length, 0)

    // The IST round trip: 14:30:12 IST is 09:00:12 UTC.
    assert.strictEqual(payment.createdAt.toISOString(), '2026-10-03T09:00:12.000Z')
  })

  /* --------------------------------------------------------------- output */
  for (const [status, name] of results) console.log(`  ${status} ${name}`)
  console.log(`\n  ${passed}/${results.length} passed${process.exitCode ? ' — with failures' : ''}\n`)
}

run()
  .catch((err) => {
    console.error('\nharness error:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await cleanup()
    await sequelize.close()
  })