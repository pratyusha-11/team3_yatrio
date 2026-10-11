# Team 7 Admin API Documentation

All Team 7 Admin APIs require authentication and authorization.
- **Authentication**: Bearer Token (JWT)
- **Authorization**: Role must be `ADMIN`.
- **Base Path**: `/admin`

## 1. Dashboard API
**Endpoint:** `GET /admin/dashboard`
**Description:** Retrieves top-level KPI metrics, active users, popular routes, and estimated revenue snapshots.

**Success Response (200 OK):**
```json
{
  "data": {
    "kpis": {
      "totalUsers": 150,
      "activeUsers": 120,
      "totalTrains": 45,
      "totalBookedSeats": 2300,
      "estimatedRevenue": 145000.50
    },
    "revenue": [...],
    "popularRoutes": [...],
    "trainOccupancy": [...],
    "systemHealth": {
      "status": "OK",
      "timestamp": "2026-10-07T12:00:00.000Z"
    }
  }
}
```

## 2. Users API
**Endpoint:** `GET /admin/users`
**Description:** Retrieves a paginated list of users with search and filtering.
**Query Parameters:**
- `page` (number)
- `pageSize` (number)
- `search` (string)
- `role` ('admin', 'passenger')
- `status` ('active', 'inactive')
- `sortBy` ('id', 'full_name', 'email', 'created_at', 'role', 'status')
- `sortOrder` ('ASC', 'DESC')

## 3. Trains API
**Endpoint:** `GET /admin/trains`
**Description:** Read-only access to train master data with pagination.

## 4. Bookings, Payments, Cancellations
**Endpoints:** 
- `GET /admin/bookings`
- `GET /admin/payments`
- `GET /admin/cancellations`
**Description:** Currently returns a documented empty/unavailable state as Team 4 and Team 5 schemas are pending merge. Once merged, these endpoints will be updated to consume the live tables.

## 5. Audit Logs API
**Endpoint:** `GET /admin/audit-logs`
**Description:** Retrieves application-level audit logs tracking administrative and business events.
**Query Parameters:**
- `page`, `pageSize`, `actor`, `action`, `entity`, `sortBy`, `sortOrder`

## 6. Reports API
**Endpoint:** `GET /admin/reports`
**Description:** Returns dynamic reporting datasets based on the report type.
**Query Parameters:**
- `type` (Required: 'booking-summary', 'revenue', 'train-occupancy', 'user-activity')

## 7. Analytics API
**Endpoint:** `GET /admin/analytics`
**Description:** Provides analytical trend data for dashboard charting.

## 8. System Monitoring API
**Endpoint:** `GET /admin/monitoring`
**Description:** Checks the health of MySQL, Redis, and the API itself.

**Success Response (200 OK):**
```json
{
  "status": "OK",
  "services": {
    "database": { "status": "OK" },
    "redis": { "status": "OK" },
    "api": { "status": "OK" }
  }
}
```

## 9. API Request Log Monitoring
**Endpoint:** `GET /admin/monitoring/api`
**Description:** Paginated access to `api_request_logs` containing latency and status codes.

## 10. PNR Monitoring
**Endpoint:** `GET /admin/monitoring/pnr`
**Description:** Returns availability status of Team 6 PNR services (currently pending schema integration).

## Error Handling
Consistent error format across all endpoints:
```json
{
  "error": {
    "code": "ADMIN_FORBIDDEN",
    "message": "Administrator access is required."
  }
}
```
