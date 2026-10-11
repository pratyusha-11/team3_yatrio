const pool = require('../config/db');

const getAnalytics = async (req, res, next) => {
    try {
        // Return analytical trends for frontend graphs
        // Currently limited to Team 7 Phase 2 views
        const [occupancyRows] = await pool.query('SELECT * FROM vw_train_occupancy ORDER BY occupancy_percentage DESC LIMIT 10');
        const [activityRows] = await pool.query('SELECT * FROM vw_user_activity');
        const [revenueRows] = await pool.query('SELECT * FROM vw_revenue_summary ORDER BY estimated_revenue DESC LIMIT 10');

        res.status(200).json({
            data: {
                trainOccupancy: occupancyRows,
                userActivity: activityRows,
                revenueTrends: revenueRows,
                notes: 'Booking, payment, and cancellation trends are unavailable until T4 and T5 schema integrations are complete.'
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAnalytics
};
