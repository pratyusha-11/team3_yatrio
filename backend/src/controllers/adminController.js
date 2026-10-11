const pool = require('../config/db');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');
const { getSafeSortBy, getSafeSortOrder } = require('../utils/validation');
const { redis } = require('../config/redis');

// A. DASHBOARD API
const getDashboard = async (req, res, next) => {
    try {
        // We will call the 4 stored procedures from Phase 2
        // Check cache first
        const cacheKey = 'admin:dashboard:stats';
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }

        // 1. Core KPIs
        const [kpiRows] = await pool.query('CALL get_dashboard_statistics();');
        const kpis = kpiRows[0][0] || {};

        // 2. Daily Revenue (Fallback)
        const [revenueRows] = await pool.query('CALL get_daily_revenue(?, ?);', [null, null]);
        
        // 3. Popular Routes
        const [routesRows] = await pool.query('CALL get_popular_routes(5);');
        
        // 4. Train Occupancy
        const [occupancyRows] = await pool.query('CALL get_train_occupancy(5);');

        const responseData = {
            data: {
                kpis: {
                    totalUsers: kpis.total_users || 0,
                    activeUsers: kpis.active_users || 0,
                    totalTrains: kpis.total_trains || 0,
                    totalBookedSeats: kpis.total_booked_seats || 0,
                    estimatedRevenue: kpis.total_revenue || 0, // Not actual payment revenue
                },
                revenue: revenueRows[0] || [], // Estimated/demo reporting
                popularRoutes: routesRows[0] || [],
                trainOccupancy: occupancyRows[0] || [],
                systemHealth: {
                    status: 'OK', // Basic placeholder, monitoring endpoint provides detail
                    timestamp: new Date()
                }
            }
        };

        // Cache the dashboard data for 1 minute
        await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 60);

        res.status(200).json(responseData);
    } catch (err) {
        next(err);
    }
};

// B. USERS API
const getUsers = async (req, res, next) => {
    try {
        const { page, pageSize, search, role, status, sortBy, sortOrder } = req.query;
        const { limit, offset, page: p, pageSize: s } = getPagination(page, pageSize);
        const safeSortBy = getSafeSortBy(sortBy, ['id', 'full_name', 'email', 'created_at', 'role', 'status'], 'created_at');
        const safeSortOrder = getSafeSortOrder(sortOrder, 'DESC');

        let query = 'SELECT id, full_name, email, phone, role, status, created_at, updated_at FROM users WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) AS subquery`;
        const [countRows] = await pool.query(countQuery, params);
        const total = countRows[0].total;

        // Get paginated data
        query += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);

        res.status(200).json(formatPaginatedResponse(rows, total, p, s));
    } catch (err) {
        next(err);
    }
};

// C. TRAINS API
const getTrains = async (req, res, next) => {
    try {
        const { page, pageSize, search, status, sortBy, sortOrder } = req.query;
        const { limit, offset, page: p, pageSize: s } = getPagination(page, pageSize);
        const safeSortBy = getSafeSortBy(sortBy, ['id', 'train_number', 'train_name', 'status', 'created_at'], 'train_number');
        const safeSortOrder = getSafeSortOrder(sortOrder, 'ASC');

        let query = 'SELECT id, train_number, train_name, train_type, status, pantry_available, created_at FROM trains WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (train_number LIKE ? OR train_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) AS subquery`;
        const [countRows] = await pool.query(countQuery, params);
        const total = countRows[0].total;

        query += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);

        res.status(200).json(formatPaginatedResponse(rows, total, p, s));
    } catch (err) {
        next(err);
    }
};

// D. BOOKINGS API
const getBookings = async (req, res, next) => {
    // Current Phase 2 architecture does NOT contain a real bookings table.
    // Returning an honest empty state as documented.
    res.status(200).json({
        message: 'Bookings data not yet available. Team 4 schemas are pending merge.',
        data: [],
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0
    });
};

// E. PAYMENTS API
const getPayments = async (req, res, next) => {
    // Current Phase 2 architecture does NOT contain a real payments table.
    // Returning an honest empty state as documented.
    res.status(200).json({
        message: 'Payment data unavailable. Team 5 schemas are pending merge.',
        data: [],
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0
    });
};

// F. CANCELLATIONS API
const getCancellations = async (req, res, next) => {
    // Current Phase 2 architecture does NOT contain a real cancellations table.
    res.status(200).json({
        message: 'Cancellation data unavailable. Team 4 schemas are pending merge.',
        data: [],
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0
    });
};

// G. AUDIT LOGS API
const getAuditLogs = async (req, res, next) => {
    try {
        const { page, pageSize, actor, action, entity, sortBy, sortOrder } = req.query;
        const { limit, offset, page: p, pageSize: s } = getPagination(page, pageSize);
        const safeSortBy = getSafeSortBy(sortBy, ['id', 'timestamp', 'action', 'entity'], 'timestamp');
        const safeSortOrder = getSafeSortOrder(sortOrder, 'DESC');

        let query = 'SELECT id, actor_id, action, entity, entity_id, details, timestamp FROM audit_logs WHERE 1=1';
        const params = [];

        if (actor) {
            query += ' AND actor_id = ?';
            params.push(actor);
        }
        if (action) {
            query += ' AND action = ?';
            params.push(action);
        }
        if (entity) {
            query += ' AND entity = ?';
            params.push(entity);
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) AS subquery`;
        const [countRows] = await pool.query(countQuery, params);
        const total = countRows[0].total;

        query += ` ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);

        res.status(200).json(formatPaginatedResponse(rows, total, p, s));
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getDashboard,
    getUsers,
    getTrains,
    getBookings,
    getPayments,
    getCancellations,
    getAuditLogs
};
