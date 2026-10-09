-- 011_create_team7_procedures.sql
-- Team 7: Administrative dashboard procedures

-- Procedure 1: get_dashboard_statistics
DROP PROCEDURE IF EXISTS get_dashboard_statistics;
DELIMITER $$
CREATE PROCEDURE get_dashboard_statistics()
BEGIN
    DECLARE v_total_users INT DEFAULT 0;
    DECLARE v_active_users INT DEFAULT 0;
    DECLARE v_total_trains INT DEFAULT 0;
    DECLARE v_total_booked_seats INT DEFAULT 0;
    DECLARE v_total_estimated_revenue DECIMAL(15,2) DEFAULT 0.00;

    SELECT COUNT(*), SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) 
    INTO v_total_users, v_active_users 
    FROM users;

    SELECT COUNT(*) INTO v_total_trains FROM trains WHERE status = 'active';

    SELECT 
        SUM(total_booked_seats) 
    INTO v_total_booked_seats 
    FROM vw_booking_summary;

    SELECT 
        SUM(estimated_revenue) 
    INTO v_total_estimated_revenue 
    FROM vw_revenue_summary;

    SELECT 
        v_total_users AS total_users,
        v_active_users AS active_users,
        v_total_trains AS total_trains,
        COALESCE(v_total_booked_seats, 0) AS total_booked_seats,
        COALESCE(v_total_estimated_revenue, 0) AS total_revenue;
END$$
DELIMITER ;

-- Procedure 2: get_daily_revenue
DROP PROCEDURE IF EXISTS get_daily_revenue;
DELIMITER $$
CREATE PROCEDURE get_daily_revenue(IN p_start_date DATE, IN p_end_date DATE)
BEGIN
    -- The current schema (T2/T3) does not yet contain payment (T5) or booking date (T4) tables.
    -- Therefore, daily aggregation is not fully supported by the schema yet.
    -- We return current estimated revenue from our views as a fallback snapshot for today.
    SELECT 
        CURRENT_DATE() AS revenue_date,
        SUM(estimated_revenue) AS total_revenue,
        SUM(total_booked_seats) AS total_booked
    FROM vw_revenue_summary vrs
    JOIN vw_booking_summary vbs ON vrs.train_id = vbs.train_id;
END$$
DELIMITER ;

-- Procedure 3: get_popular_routes
DROP PROCEDURE IF EXISTS get_popular_routes;
DELIMITER $$
CREATE PROCEDURE get_popular_routes(IN p_limit INT)
BEGIN
    DECLARE v_limit INT DEFAULT 10;
    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;

    -- Using train seat occupancy as a proxy for booking activity.
    SELECT 
        vbs.train_number,
        vbs.train_name,
        (SELECT s.station_name FROM train_routes tr JOIN stations s ON tr.station_id = s.id WHERE tr.train_id = vbs.train_id ORDER BY tr.stop_sequence ASC LIMIT 1) AS origin,
        (SELECT s.station_name FROM train_routes tr JOIN stations s ON tr.station_id = s.id WHERE tr.train_id = vbs.train_id ORDER BY tr.stop_sequence DESC LIMIT 1) AS destination,
        vbs.total_booked_seats AS booked_count
    FROM vw_booking_summary vbs
    WHERE vbs.total_booked_seats > 0
    ORDER BY vbs.total_booked_seats DESC
    LIMIT v_limit;
END$$
DELIMITER ;

-- Procedure 4: get_train_occupancy
DROP PROCEDURE IF EXISTS get_train_occupancy;
DELIMITER $$
CREATE PROCEDURE get_train_occupancy(IN p_limit INT)
BEGIN
    DECLARE v_limit INT DEFAULT 20;
    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;

    SELECT 
        train_number,
        train_name,
        class_code,
        capacity,
        booked_count,
        occupancy_percentage
    FROM vw_train_occupancy
    ORDER BY occupancy_percentage DESC
    LIMIT v_limit;
END$$
DELIMITER ;
