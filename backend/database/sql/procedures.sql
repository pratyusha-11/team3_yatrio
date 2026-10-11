-- ---------------------------------------------------------------------------
-- Yatrio . Team 5 . Payment procedures
--
-- The three routines the team assignment names: create_payment_record(),
-- confirm_payment() and process_refund(). They exist so the payment state
-- machine lives in one place, is atomic, and refuses the illegal moves rather
-- than leaving them to a caller to remember.
--
-- Amounts are paise throughout (PAYMENTS.md section 4).
--
-- Applied by database/migrations/*-create-payment-procedures.js and reversed by
-- the matching drop migration.
-- ---------------------------------------------------------------------------

DROP PROCEDURE IF EXISTS `create_payment_record`;
DROP PROCEDURE IF EXISTS `confirm_payment`;
DROP PROCEDURE IF EXISTS `process_refund`;

-- ---------------------------------------------------------------------------
-- create_payment_record -- record a freshly minted gateway order.
--
-- A retry of the same booking mints a NEW order (Razorpay orders are
-- single-use), so this runs once per attempt and p_attempt counts up. Writes
-- the payment and its first transaction row atomically: if either fails,
-- neither is left behind.
--
-- Returns the new payment_id.
-- ---------------------------------------------------------------------------
CREATE PROCEDURE `create_payment_record`(
    IN  p_booking_ref           VARCHAR(32),
    IN  p_gateway_order_id      VARCHAR(64),
    IN  p_amount                BIGINT UNSIGNED,
    IN  p_currency              CHAR(3),
    IN  p_attempt               SMALLINT UNSIGNED,
    IN  p_expires_at            DATETIME(3),
    IN  p_ttl_minutes           SMALLINT UNSIGNED,
    IN  p_booking_id            BIGINT UNSIGNED,
    IN  p_train_no              VARCHAR(16),
    IN  p_train_name            VARCHAR(96),
    IN  p_from_station          VARCHAR(8),
    IN  p_to_station            VARCHAR(8),
    IN  p_passenger_name        VARCHAR(96),
    IN  p_passenger_email       VARCHAR(160),
    IN  p_passenger_contact     VARCHAR(32),
    OUT o_payment_id            BIGINT UNSIGNED
)
    MODIFIES SQL DATA
BEGIN
    DECLARE v_expires_at DATETIME(3)    DEFAULT NULL;
    DECLARE v_ttl        SMALLINT UNSIGNED DEFAULT 30;
    DECLARE v_attempt    SMALLINT UNSIGNED DEFAULT 1;

    -- Last-resort guard against two concurrent calls for the same order. The
    -- explicit checks below name the constraint that was actually violated;
    -- this one only fires if both slip through at once.
    DECLARE EXIT HANDLER FOR 1062
    BEGIN
        RESIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DUPLICATE_PAYMENT_KEY';
    END;

    IF p_booking_ref IS NULL OR p_booking_ref = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'BOOKING_REF_REQUIRED';
    END IF;

    IF p_gateway_order_id IS NULL OR p_gateway_order_id = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'GATEWAY_ORDER_ID_REQUIRED';
    END IF;

    -- The amount is whatever the server computed from the booking. Nothing the
    -- browser sent can reach this line.
    IF p_amount IS NULL OR p_amount = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'AMOUNT_MUST_BE_POSITIVE';
    END IF;

    SET v_attempt = COALESCE(p_attempt, 1);
    SET v_ttl     = COALESCE(p_ttl_minutes, 30);

    -- Named rather than left to the driver's 1062, so the caller can tell a
    -- replayed order apart from a replayed attempt.
    IF EXISTS (
        SELECT 1 FROM `payments` WHERE `gateway_order_id` = p_gateway_order_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DUPLICATE_GATEWAY_ORDER_ID';
    END IF;

    IF EXISTS (
        SELECT 1 FROM `payments`
         WHERE `booking_ref` = p_booking_ref AND `attempt_number` = v_attempt
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DUPLICATE_BOOKING_ATTEMPT';
    END IF;

    -- Yatrio's order lifetime is our rule, not a gateway limit: an order older
    -- than ORDER_TTL_MINUTES is stale for us however long Razorpay would hold it.
    SET v_expires_at = COALESCE(p_expires_at, DATE_ADD(NOW(3), INTERVAL v_ttl MINUTE));

    START TRANSACTION;

        INSERT INTO `payments` (
            `booking_ref`, `booking_id`, `gateway`, `gateway_order_id`,
            `amount`, `currency`, `status`, `attempt_number`, `expires_at`,
            `train_no`, `train_name`, `from_station`, `to_station`,
            `passenger_name`, `passenger_email`, `passenger_contact`,
            `created_at`, `updated_at`
        )
        VALUES (
            p_booking_ref, p_booking_id, 'razorpay', p_gateway_order_id,
            p_amount, COALESCE(p_currency, 'INR'), 'created', v_attempt, v_expires_at,
            p_train_no, p_train_name, p_from_station, p_to_station,
            p_passenger_name, p_passenger_email, p_passenger_contact,
            NOW(3), NOW(3)
        );

        SET o_payment_id = LAST_INSERT_ID();

        -- One transaction row per attempt, carrying the order's gateway id.
        INSERT INTO `payment_transactions` (
            `payment_id`, `attempt_number`, `event`, `status`,
            `gateway_order_id`, `amount`, `currency`, `created_at`, `updated_at`
        )
        VALUES (
            o_payment_id, v_attempt, 'ORDER_CREATED', 'created',
            p_gateway_order_id, p_amount, COALESCE(p_currency, 'INR'), NOW(3), NOW(3)
        );

    COMMIT;
END;

-- ---------------------------------------------------------------------------
-- confirm_payment -- apply a gateway verification result to a payment.
--
-- Idempotent: replaying it with the same payment id rewrites the same rows and
-- returns the same result, which is what makes a repeated callback harmless
-- (`duplicate: true` in PAYMENTS.md section 4).
--
-- Refuses, loudly:
--   - capturing on a signature that did not verify -> recorded as
--     SIGNATURE_MISMATCH and the payment is failed, never captured
--   - a payment id already bound to a different order -> ORDER_MISMATCH
--   - capturing a payment that already failed
--   - anything at all on a refunded payment
--
-- Returns the payment_id.
-- ---------------------------------------------------------------------------
CREATE PROCEDURE `confirm_payment`(
    IN  p_gateway_order_id          VARCHAR(64),
    IN  p_gateway_payment_id        VARCHAR(64),
    IN  p_status                    VARCHAR(32),
    IN  p_method_code               VARCHAR(32),
    IN  p_signature_valid           TINYINT,
    IN  p_signature_fingerprint     CHAR(64),
    IN  p_failure_code              VARCHAR(64),
    IN  p_failure_reason            VARCHAR(255),
    IN  p_gateway_response          JSON
)
    MODIFIES SQL DATA
BEGIN
    DECLARE v_payment_id     BIGINT UNSIGNED DEFAULT NULL;
    DECLARE v_current_status VARCHAR(32)    DEFAULT NULL;
    DECLARE v_owner          BIGINT UNSIGNED DEFAULT NULL;
    DECLARE v_status          VARCHAR(32)    DEFAULT NULL;
    DECLARE v_captured_at     DATETIME(3)    DEFAULT NULL;
    DECLARE v_failed_at       DATETIME(3)    DEFAULT NULL;

    DECLARE EXIT HANDLER FOR 1062
    BEGIN
        RESIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DUPLICATE_GATEWAY_PAYMENT_ID';
    END;

    SELECT `payment_id`, `status`
      INTO v_payment_id, v_current_status
      FROM `payments`
     WHERE `gateway_order_id` = p_gateway_order_id
       FOR UPDATE;

    IF v_payment_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ORDER_NOT_FOUND';
    END IF;

    -- A gateway payment id belongs to exactly one order.
    IF p_gateway_payment_id IS NOT NULL THEN
        SELECT `payment_id` INTO v_owner
          FROM `payments`
         WHERE `gateway_payment_id` = p_gateway_payment_id
         LIMIT 1;

        IF v_owner IS NOT NULL AND v_owner <> v_payment_id THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ORDER_MISMATCH';
        END IF;
    END IF;

    IF v_current_status = 'refunded' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ALREADY_REFUNDED';
    END IF;

    -- A failed payment stays failed: the traveller retries with a new order.
    IF v_current_status = 'failed' AND p_status = 'captured' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'FAILED_PAYMENT_NOT_CAPTURABLE';
    END IF;

    IF p_signature_valid IS FALSE
       OR (p_status = 'captured' AND p_signature_valid IS NOT TRUE) THEN
        -- An unverified signature never captures, whatever the gateway claims.
        SET v_status           = 'failed';
        SET p_failure_code     = COALESCE(p_failure_code, 'SIGNATURE_MISMATCH');
        SET p_failure_reason   = COALESCE(p_failure_reason, 'razorpay_signature_invalid');
    ELSE
        SET v_status = COALESCE(p_status, 'attempted');

        IF v_status NOT IN ('attempted', 'authorized', 'captured', 'failed') THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'INVALID_STATUS';
        END IF;
    END IF;

    IF v_status = 'captured' AND v_current_status <> 'captured' THEN
        SET v_captured_at = NOW(3);
    END IF;

    IF v_status = 'failed' AND v_current_status <> 'failed' THEN
        SET v_failed_at = NOW(3);
    END IF;

    START TRANSACTION;

        UPDATE `payments`
           SET `status`                = v_status,
               `gateway_payment_id`    = COALESCE(p_gateway_payment_id, `gateway_payment_id`),
               `method_code`           = COALESCE(p_method_code, `method_code`),
               `failure_code`          = p_failure_code,
               `failure_reason`        = p_failure_reason,
               `signature_fingerprint` = p_signature_fingerprint,
               `captured_at`           = COALESCE(v_captured_at, `captured_at`),
               `failed_at`             = COALESCE(v_failed_at, `failed_at`),
               `updated_at`            = NOW(3)
         WHERE `payment_id` = v_payment_id;

        -- Rewrites the attempt's row rather than adding one, so the log stays
        -- one row per attempt however many times the traveller retries.
        UPDATE `payment_transactions`
           SET `event`                = CASE
                   WHEN v_status = 'captured' THEN 'PAYMENT_VERIFIED'
                   WHEN v_status = 'failed'   THEN 'PAYMENT_FAILED'
                   ELSE `event`
               END,
               `status`                = v_status,
               `gateway_payment_id`    = COALESCE(p_gateway_payment_id, `gateway_payment_id`),
               `method_code`           = p_method_code,
               `signature_valid`       = p_signature_valid,
               `signature_fingerprint` = p_signature_fingerprint,
               `failure_code`          = p_failure_code,
               `failure_reason`        = p_failure_reason,
               `verified_at`           = NOW(3),
               `gateway_response`      = p_gateway_response,
               `updated_at`            = NOW(3)
         WHERE `payment_id` = v_payment_id;

    COMMIT;
END;

-- ---------------------------------------------------------------------------
-- process_refund -- reverse a captured payment. Terminal.
--
-- Refuses a payment that is not captured, a second refund, and an amount above
-- what is left of the capture. Returns the new refund_id.
-- ---------------------------------------------------------------------------
CREATE PROCEDURE `process_refund`(
    IN  p_payment_id        BIGINT UNSIGNED,
    IN  p_gateway_refund_id VARCHAR(64),
    IN  p_amount            BIGINT UNSIGNED,
    IN  p_reason            VARCHAR(255),
    IN  p_initiated_by      VARCHAR(64),
    IN  p_gateway_response  JSON,
    OUT o_refund_id         BIGINT UNSIGNED
)
    MODIFIES SQL DATA
BEGIN
    DECLARE v_status   VARCHAR(32)     DEFAULT NULL;
    DECLARE v_amount   BIGINT UNSIGNED DEFAULT NULL;
    DECLARE v_refunded BIGINT UNSIGNED DEFAULT NULL;

    DECLARE EXIT HANDLER FOR 1062
    BEGIN
        RESIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'DUPLICATE_GATEWAY_REFUND_ID';
    END;

    SELECT `status`, `amount`, `refunded_amount`
      INTO v_status, v_amount, v_refunded
      FROM `payments`
     WHERE `payment_id` = p_payment_id
       FOR UPDATE;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PAYMENT_NOT_FOUND';
    END IF;

    IF v_status = 'refunded' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ALREADY_REFUNDED';
    END IF;

    IF v_status <> 'captured' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'NOT_CAPTURED';
    END IF;

    IF p_amount IS NULL OR p_amount = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'AMOUNT_MUST_BE_POSITIVE';
    END IF;

    IF p_amount > (v_amount - v_refunded) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'REFUND_EXCEEDS_CAPTURE';
    END IF;

    START TRANSACTION;

        INSERT INTO `refunds` (
            `payment_id`, `gateway_refund_id`, `amount`, `currency`,
            `status`, `reason`, `initiated_by`, `gateway_response`,
            `processed_at`, `created_at`, `updated_at`
        )
        VALUES (
            p_payment_id, p_gateway_refund_id, p_amount, 'INR',
            'processed', p_reason, p_initiated_by, p_gateway_response,
            NOW(3), NOW(3), NOW(3)
        );

        SET o_refund_id = LAST_INSERT_ID();

        UPDATE `payments`
           SET `refunded_amount` = `refunded_amount` + p_amount,
               `status`          = 'refunded',
               `refunded_at`     = NOW(3),
               `updated_at`      = NOW(3)
         WHERE `payment_id` = p_payment_id;

        -- Link the reversal onto the attempt it reverses, so the refund's
        -- gateway id is guarded by UNIQUE (gateway_refund_id) here too.
        UPDATE `payment_transactions`
           SET `gateway_refund_id` = p_gateway_refund_id,
               `event`             = 'PAYMENT_REFUNDED',
               `status`            = 'refunded',
               `updated_at`        = NOW(3)
         WHERE `payment_id` = p_payment_id;

    COMMIT;
END;