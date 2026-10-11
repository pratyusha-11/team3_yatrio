-- ---------------------------------------------------------------------------
-- Yatrio . Team 5 . Payment triggers
--
-- Guards, not business logic. The procedures in procedures.sql decide what
-- happens; these stop the database itself from being walked into a state the
-- payment flow can never be in, whoever writes to it (Team 4's booking flow, a
-- future admin tool, a hand-run query in a console).
--
-- Applied by database/migrations/*-create-payment-triggers.js.
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS `trg_payments_status_guard`;
DROP TRIGGER IF EXISTS `trg_refunds_payment_guard`;

-- ---------------------------------------------------------------------------
-- trg_payments_status_guard -- a terminal payment stays terminal.
--
-- captured -> refunded is the one legal move out of a terminal state, because
-- that is the assignment's refund hand-off. failed and refunded are frozen, and
-- captured can never go back to created/attempted/authorized/failed.
-- ---------------------------------------------------------------------------
CREATE TRIGGER `trg_payments_status_guard`
    BEFORE UPDATE ON `payments`
    FOR EACH ROW
BEGIN
    IF OLD.`status` <> NEW.`status` THEN
        IF OLD.`status` = 'refunded' OR OLD.`status` = 'failed' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'TERMINAL_STATUS_IS_FINAL';
        END IF;

        IF OLD.`status` = 'captured' AND NEW.`status` <> 'refunded' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'CAPTURED_PAYMENT_ONLY_REFUNDS';
        END IF;
    END IF;
END;

-- ---------------------------------------------------------------------------
-- trg_refunds_payment_guard -- independent backstop on "refund once".
--
-- procedures.sql process_refund() already refuses a second refund. This is the
-- same rule enforced at the table, so a refund inserted by any other route
-- cannot double-reverse a capture either.
-- ---------------------------------------------------------------------------
CREATE TRIGGER `trg_refunds_payment_guard`
    BEFORE INSERT ON `refunds`
    FOR EACH ROW
BEGIN
    DECLARE v_status   VARCHAR(32)     DEFAULT NULL;
    DECLARE v_amount   BIGINT UNSIGNED DEFAULT NULL;
    DECLARE v_refunded BIGINT UNSIGNED DEFAULT NULL;

    -- Plain read, never a locking one: MySQL refuses a SELECT ... FOR UPDATE
    -- inside a trigger when the invoking statement already touches payments
    -- (an INSERT ... SELECT from payments is the common case here).
    SELECT `status`, `amount`, `refunded_amount`
      INTO v_status, v_amount, v_refunded
      FROM `payments`
     WHERE `payment_id` = NEW.`payment_id`;

    IF v_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PAYMENT_NOT_FOUND';
    END IF;

    IF NEW.`amount` IS NULL OR NEW.`amount` = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'AMOUNT_MUST_BE_POSITIVE';
    END IF;

    -- A refunded payment carries status 'refunded', so this one condition
    -- covers both NOT_CAPTURED and ALREADY_REFUNDED.
    IF v_status <> 'captured' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'NOT_CAPTURED';
    END IF;

    IF NEW.`amount` > (v_amount - v_refunded) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'REFUND_EXCEEDS_CAPTURE';
    END IF;
END;