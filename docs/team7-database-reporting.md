# Team 7 Database Reporting & Audit Strategy

## 1. Audit Strategy
The repository originally contained `railway_audit_logs`, created by Team 2 triggers. These act as low-level data change logs (INSERT/UPDATE/DELETE on stations/trains).
Since the Team 7 requirement asks for application-level monitoring with `actor`, `action`, `entity`, and `timestamp`, a new `audit_logs` table has been created.
*   **`audit_logs`**: Tracks high-level business logic events triggered by authenticated users (Admin logins, manual overrides, etc.). It links to `users.id` via `actor_id` to prevent duplicating the low-level database triggers, acting alongside `railway_audit_logs`.
*   **`api_request_logs`**: Tracks endpoint latency and status codes for API monitoring.

## 2. Reporting Views
Since Team 4 (Bookings) and Team 5 (Payments) have not yet merged their tables into the migration sequence, Team 7 must estimate these metrics using the existing Availability/Capacity schema (`train_classes`).

*   `vw_user_activity`: Aggregates user counts by `role` and `status`, determining active administrators vs passengers.
*   `vw_train_occupancy`: Calculates capacity, booked count, and percentage by joining `trains` and `train_classes`.
*   `vw_booking_summary`: Proxies the missing booking records by computing the difference between `total_seats` and `available_seats`.
*   `vw_revenue_summary`: Estimates potential revenue by multiplying occupied seats by `base_fare`.

## 3. Stored Procedures

### `get_dashboard_statistics()`
*   **Parameters**: None
*   **Returned Fields**: `total_users`, `active_users`, `total_trains`, `total_booked_seats`, `total_revenue`.
*   **Example Call**: `CALL get_dashboard_statistics();`

### `get_daily_revenue(p_start_date DATE, p_end_date DATE)`
*   **Parameters**: `p_start_date`, `p_end_date` (Currently unused due to missing payment date columns in schema).
*   **Returned Fields**: `revenue_date`, `total_revenue`, `total_booked`.
*   **Example Call**: `CALL get_daily_revenue('2026-10-01', '2026-10-31');`

### `get_popular_routes(p_limit INT)`
*   **Parameters**: `p_limit` (INT, defaults to 10).
*   **Returned Fields**: `train_number`, `train_name`, `origin`, `destination`, `booked_count`.
*   **Example Call**: `CALL get_popular_routes(5);`

### `get_train_occupancy(p_limit INT)`
*   **Parameters**: `p_limit` (INT, defaults to 20).
*   **Returned Fields**: `train_number`, `train_name`, `class_code`, `capacity`, `booked_count`, `occupancy_percentage`.
*   **Example Call**: `CALL get_train_occupancy(10);`

## 4. Indexing Considerations
We added `idx_users_role_status` because grouping active users by role/status is the core of `vw_user_activity`. 
We added timestamps/endpoint indexes to `api_request_logs` since date-range latency graphs will query it heavily.
No extra index was added on `train_classes.train_id` because the existing `UNIQUE(train_id, class_code)` handles the JOIN optimization.
