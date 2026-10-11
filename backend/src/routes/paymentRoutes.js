'use strict'

const express = require('express')
const ctrl = require('../controllers/paymentController')
const { asyncHandler } = require('../utils/errors')

const router = express.Router()

/**
 * Team 5 — Payment & Transactions contract.
 *
 *   POST /create-order      mint a Razorpay order from a booking reference
 *   POST /verify            server-side HMAC verification, then gateway confirm
 *   POST /refund            refund a captured payment (terminal)
 *   GET  /history           transaction history, filterable and paginated
 *   GET  /status/:orderId   poll order status
 *
 * Mounted at /payments.
 */

router.post('/create-order', asyncHandler(ctrl.createOrder))
router.post('/verify', asyncHandler(ctrl.verifyPayment))
router.post('/refund', asyncHandler(ctrl.refundPayment))
router.get('/history', asyncHandler(ctrl.getHistory))
router.get('/status/:orderId', asyncHandler(ctrl.getStatus))

module.exports = router