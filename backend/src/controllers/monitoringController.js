const pool = require('../config/db');
const { checkRedisHealth } = require('../config/redis');
const { getPagination, formatPaginatedResponse } = require('../utils/pagination');

const getSystemMonitoring = async (req, res, next) => {
    try {
        // 1. Check Database Health
        let dbHealth = { status: 'OK' };
        try {
            await pool.query('SELECT 1');
        } catch (dbErr) {
            dbHealth = { status: 'DOWN', error: dbErr.message };
        }

        // 2. Check Redis Health
        const redisStatus = await checkRedisHealth();
        const redisHealth = { status: redisStatus ? 'OK' : 'DOWN' };

        // Overall status
        const overallStatus = (dbHealth.status === 'OK' && redisHealth.status === 'OK') ? 'OK' : 'DEGRADED';

        res.status(200).json({
            status: overallStatus,
            services: {
                database: dbHealth,
                redis: redisHealth,
                api: { status: 'OK' } // If we reached here, API is up
            }
        });
    } catch (err) {
        next(err);
    }
};

const getApiMonitoring = async (req, res, next) => {
    try {
        // Query the api_request_logs table
        const { page, pageSize } = req.query;
        const { limit, offset, page: p, pageSize: s } = getPagination(page, pageSize);

        const countQuery = `SELECT COUNT(*) as total FROM api_request_logs`;
        const [countRows] = await pool.query(countQuery);
        const total = countRows[0].total;

        const dataQuery = `SELECT * FROM api_request_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        const [rows] = await pool.query(dataQuery, [limit, offset]);

        res.status(200).json(formatPaginatedResponse(rows, total, p, s));
    } catch (err) {
        next(err);
    }
};

const getPnrMonitoring = async (req, res, next) => {
    try {
        // Team 6 PNR tables do not exist yet.
        res.status(200).json({
            status: 'UNAVAILABLE',
            message: 'PNR Live Tracking service (Team 6) data is pending schema integration.'
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getSystemMonitoring,
    getApiMonitoring,
    getPnrMonitoring
};
