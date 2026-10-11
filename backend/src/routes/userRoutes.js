const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../config/db");

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user && req.user.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid user session."
            });
        }

        const [rows] = await pool.query(
            `SELECT id, full_name, email, phone, role, status, created_at, updated_at
             FROM users
             WHERE id = ?
             LIMIT 1`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const dbUser = rows[0];

        return res.status(200).json({
            success: true,
            message: "User profile retrieved successfully.",
            user: {
                id: String(dbUser.id),
                name: dbUser.full_name,
                full_name: dbUser.full_name,
                email: dbUser.email,
                phone: dbUser.phone,
                role: dbUser.role,
                status: dbUser.status,
                createdAt: dbUser.created_at,
                created_at: dbUser.created_at
            }
        });
    } catch (error) {
        console.error("Error retrieving user profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user profile."
        });
    }
});

module.exports = router;