const pool = require('../config/db');

const getReports = async (req, res, next) => {
    try {
        const { type } = req.query;

        // Allowlist for report types
        const allowedReports = [
            'booking-summary',
            'revenue',
            'train-occupancy',
            'user-activity'
        ];

        if (!type || !allowedReports.includes(type)) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_REPORT_TYPE',
                    message: 'Please provide a valid report type parameter.'
                }
            });
        }

        let query = '';
        switch (type) {
            case 'booking-summary':
                query = 'SELECT * FROM vw_booking_summary';
                break;
            case 'revenue':
                query = 'SELECT * FROM vw_revenue_summary';
                break;
            case 'train-occupancy':
                query = 'SELECT * FROM vw_train_occupancy ORDER BY occupancy_percentage DESC';
                break;
            case 'user-activity':
                query = 'SELECT * FROM vw_user_activity';
                break;
        }

        const [rows] = await pool.query(query);

        res.status(200).json({
            reportType: type,
            data: rows
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getReports
};
