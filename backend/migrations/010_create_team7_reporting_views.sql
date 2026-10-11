-- 010_create_team7_reporting_views.sql
-- Team 7: Reporting views based on existing tables
-- These views abstract complex grouping and calculations for the dashboard.

-- View: vw_user_activity
-- Purpose: Aggregate user statuses and roles.
CREATE OR REPLACE VIEW vw_user_activity AS
SELECT 
    role,
    status,
    COUNT(id) AS user_count,
    MAX(updated_at) AS last_activity
FROM users
GROUP BY role, status;

-- View: vw_train_occupancy
-- Purpose: Display train occupancy by capacity vs available seats.
CREATE OR REPLACE VIEW vw_train_occupancy AS
SELECT 
    t.id AS train_id,
    t.train_number,
    t.train_name,
    t.train_type,
    tc.class_code,
    tc.total_seats AS capacity,
    (tc.total_seats - tc.available_seats) AS booked_count,
    ROUND(((tc.total_seats - tc.available_seats) / tc.total_seats) * 100, 2) AS occupancy_percentage
FROM trains t
JOIN train_classes tc ON t.id = tc.train_id
WHERE tc.total_seats > 0;

-- View: vw_booking_summary
-- Purpose: Since T4 bookings table is not yet merged, we proxy booking counts via occupied seats.
CREATE OR REPLACE VIEW vw_booking_summary AS
SELECT 
    t.id AS train_id,
    t.train_number,
    t.train_name,
    SUM(tc.total_seats - tc.available_seats) AS total_booked_seats
FROM trains t
JOIN train_classes tc ON t.id = tc.train_id
GROUP BY t.id, t.train_number, t.train_name;

-- View: vw_revenue_summary
-- Purpose: Proxy for revenue, estimating potential revenue of currently occupied seats.
CREATE OR REPLACE VIEW vw_revenue_summary AS
SELECT 
    t.id AS train_id,
    t.train_number,
    t.train_name,
    SUM((tc.total_seats - tc.available_seats) * tc.base_fare) AS estimated_revenue
FROM trains t
JOIN train_classes tc ON t.id = tc.train_id
GROUP BY t.id, t.train_number, t.train_name;
