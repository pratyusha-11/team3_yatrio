# Team 7 Performance Report

## Query 1: User Activity Aggregation
**Query:**
```sql
SELECT role, status, COUNT(id) AS user_count, MAX(updated_at) AS last_activity 
FROM users 
GROUP BY role, status;
```

**Issue Identified:**
Without an index, MySQL performs a full table scan on `users`, reading every row, then grouping by `role` and `status` using a temporary table and filesort.

**Optimisation:**
Added a composite index: `CREATE INDEX idx_users_role_status ON users(role, status);`

**Expected Benefit:**
The `EXPLAIN` plan changes from `type: ALL` to `type: index` using the `idx_users_role_status` key. Extra displays "Using index", allowing MySQL to count rows directly from the index tree without fetching the full data rows, drastically reducing I/O for dashboard loading.

---

## Query 2: API Request Monitoring
**Query:**
```sql
SELECT endpoint, AVG(latency_ms) 
FROM api_request_logs 
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY endpoint;
```

**Issue Identified:**
Aggregating recent API logs will repeatedly scan the rapidly growing `api_request_logs` table. A full table scan here is fatal for a logging table.

**Optimisation:**
Added `CREATE INDEX idx_api_request_logs_timestamp ON api_request_logs(timestamp);` and `CREATE INDEX idx_api_request_logs_endpoint ON api_request_logs(endpoint);`.

**Expected Benefit:**
The `EXPLAIN` plan will show `type: range` on the `idx_api_request_logs_timestamp` key, filtering out millions of older logs instantly before grouping by endpoint.

---

## Query 3: Train Occupancy View (`vw_train_occupancy`)
**Query:**
```sql
SELECT t.train_number, tc.total_seats, tc.available_seats
FROM trains t
JOIN train_classes tc ON t.id = tc.train_id;
```

**Issue Identified / Optimisation Checked:**
Joining `trains` to `train_classes` on `train_id`. `trains.id` is the Primary Key. Is `tc.train_id` indexed?
Looking at `005_create_train_classes.sql`, there is `CONSTRAINT uq_train_class UNIQUE (train_id, class_code)`. 

**Expected Benefit:**
`EXPLAIN` confirms that `tc` uses the `uq_train_class` unique index as the `key` to resolve the JOIN (`type: ref`), meaning no new manual index is required for this dashboard view.
