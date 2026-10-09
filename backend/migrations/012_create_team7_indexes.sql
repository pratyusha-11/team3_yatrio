-- 012_create_team7_indexes.sql
-- Team 7: Reporting and monitoring indexes

-- Index for vw_user_activity which groups by role and status
CREATE INDEX idx_users_role_status ON users(role, status);

-- Indexes for the newly created audit_logs
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Indexes for api_request_logs monitoring
CREATE INDEX idx_api_request_logs_timestamp ON api_request_logs(timestamp);
CREATE INDEX idx_api_request_logs_endpoint ON api_request_logs(endpoint);
CREATE INDEX idx_api_request_logs_status ON api_request_logs(status_code);

-- Note: train_classes already has UNIQUE(train_id, class_code) which serves as an index on train_id,
-- optimizing the JOINs in vw_train_occupancy, vw_booking_summary, and vw_revenue_summary.
