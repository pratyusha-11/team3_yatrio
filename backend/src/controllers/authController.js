
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // 1. Validate required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "Registration failed: All fields are required."
            });
        }

        // 2. Normalize input
        const fullName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPhone = phone.trim();

        // 3. Validate name
        if (fullName.length < 2) {
            return res.status(400).json({
                message: "Registration failed: Name must contain at least 2 characters."
            });
        }

        // 4. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Registration failed: Please enter a valid email address."
            });
        }

        // 5. Validate Indian mobile number
        if (!/^[0-9]{10}$/.test(normalizedPhone)) {
            return res.status(400).json({
                message: "Registration failed: Phone number must contain exactly 10 digits."
            });
        }

        // 6. Validate password length
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                message: "Registration failed: Password must contain at least 8 characters."
            });
        }

        // 7. Check whether email or phone already exists
        const [existingUsers] = await pool.query(
            `SELECT email, phone
             FROM users
             WHERE email = ? OR phone = ?
             LIMIT 1`,
            [normalizedEmail, normalizedPhone]
        );

        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];

            if (existingUser.email === normalizedEmail) {
                return res.status(409).json({
                    message: "Registration failed: This email address is already registered."
                });
            }

            if (existingUser.phone === normalizedPhone) {
                return res.status(409).json({
                    message: "Registration failed: This phone number is already registered."
                });
            }

            return res.status(409).json({
                message: "Registration failed: An account with these details already exists."
            });
        }

        // 8. Hash password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // 9. Insert user into database
        const [result] = await pool.query(
            `INSERT INTO users
                (full_name, email, phone, password)
             VALUES (?, ?, ?, ?)`,
            [
                fullName,
                normalizedEmail,
                normalizedPhone,
                hashedPassword
            ]
        );

        // 10. Return successful response
        return res.status(201).json({
            message: "Registration successful. You can now log in.",
            data: {
                id: result.insertId,
                name: fullName,
                email: normalizedEmail,
                phone: normalizedPhone
            }
        });

    } catch (error) {
        // Log the detailed error on the backend
        console.error("Registration error:", error);

        // Handle duplicate-entry errors, including concurrent requests
        if (error.code === "ER_DUP_ENTRY") {
            const duplicateInfo =
                `${error.sqlMessage || ""} ${error.message || ""}`
                    .toLowerCase();

            if (duplicateInfo.includes("email")) {
                return res.status(409).json({
                    message: "Registration failed: This email address is already registered."
                });
            }

            if (duplicateInfo.includes("phone")) {
                return res.status(409).json({
                    message: "Registration failed: This phone number is already registered."
                });
            }

            return res.status(409).json({
                message: "Registration failed: An account with these details already exists."
            });
        }

        // Database connection or configuration errors
        if (
            error.code === "ECONNREFUSED" ||
            error.code === "ETIMEDOUT"
        ) {
            return res.status(503).json({
                message: "Registration is temporarily unavailable because the database cannot be reached. Please try again later."
            });
        }

        if (error.code === "ER_ACCESS_DENIED_ERROR") {
            return res.status(500).json({
                message: "Registration failed because the server cannot access the database. Please contact the administrator."
            });
        }

        if (error.code === "ER_BAD_DB_ERROR") {
            return res.status(500).json({
                message: "Registration failed because the application database is not configured correctly."
            });
        }

        if (error.code === "ER_NO_SUCH_TABLE") {
            return res.status(500).json({
                message: "Registration failed because a required database table is missing."
            });
        }

        // Generic fallback for unexpected errors
        return res.status(500).json({
            message: "Registration failed because of an unexpected server error. Please try again later."
        });
    }
};


// LOGIN USER
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [users] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Ensure JWT secret is configured
        if (!process.env.JWT_SECRET) {
            console.error("Login error: JWT_SECRET is not configured.");

            return res.status(500).json({
                message: "Login is temporarily unavailable because of a server configuration error."
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful.",
            token,
            data: {
                id: user.id,
                name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed because of an unexpected server error. Please try again later."
        });
    }
};


module.exports = {
    registerUser,
    loginUser
};
