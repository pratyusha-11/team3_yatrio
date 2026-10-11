-- ---------------------------------------------------------------------------
-- Yatrio . Team 5 . Payment views
--
-- v_payment_history is the shape GET /api/payment/history returns, flattened
-- into one row per payment so the transactions screen needs a single read.
-- Team 7's reporting can build revenue views on top of it without reaching
-- into Team 5's tables (integration contract: T7 reads through approved views).
--
-- Applied by database/migrations/*-create-payment-views.js.
-- ---------------------------------------------------------------------------

DROP VIEW IF EXISTS `v_payment_history`;

CREATE OR REPLACE VIEW `v_payment_history` AS
SELECT
    p.`payment_id`,
    p.`booking_ref`,
    p.`booking_id`,
    p.`gateway`,
    p.`gateway_order_id`,
    p.`gateway_payment_id`,
    p.`amount`,
    p.`refunded_amount`,
    p.`currency`,
    p.`status`,
    p.`attempt_number`,
    p.`method_code`,
    pm.`display_name`                                AS `method_display_name`,
    p.`failure_code`,
    p.`failure_reason`,
    p.`expires_at`,
    p.`train_no`,
    p.`train_name`,
    p.`from_station`,
    p.`to_station`,
    p.`passenger_name`,
    p.`passenger_email`,
    p.`passenger_contact`,
    p.`captured_at`,
    p.`failed_at`,
    p.`refunded_at`,
    p.`created_at`,
    p.`updated_at`,

    -- The attempt that produced this payment.
    t.`transaction_id`,
    t.`event`                                        AS `last_event`,
    t.`status`                                       AS `transaction_status`,
    t.`gateway_refund_id`,
    t.`signature_valid`,
    t.`signature_fingerprint`,
    t.`verified_at`,
    t.`latency_ms`,

    -- The reversal, when there is one.
    r.`refund_id`,
    r.`gateway_refund_id`                            AS `refund_gateway_id`,
    r.`status`                                       AS `refund_status`,
    r.`amount`                                       AS `refund_amount`,
    r.`reason`                                       AS `refund_reason`,
    r.`processed_at`                                 AS `refund_processed_at`,

    -- Settled and not yet given back, in paise. T7's daily revenue view.
    CASE WHEN p.`status` = 'captured' THEN p.`amount` ELSE 0 END AS `settled_amount`
FROM `payments` p
LEFT JOIN `payment_transactions` t
       ON t.`payment_id` = p.`payment_id`
LEFT JOIN `refunds` r
       ON r.`payment_id` = p.`payment_id`
LEFT JOIN `payment_methods` pm
       ON pm.`code` = p.`method_code`;