const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function seedAdmin() {
    console.log('==============================================');
    console.log('  Seeding Local Development Admin User        ');
    console.log('==============================================');

    let connection;
    try {
        const dbName = process.env.DB_NAME || 'yatrio_db';
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            database: dbName
        });

        const adminEmail = 'admin@yatrio.local';
        const adminPhone = '0000000000'; // Placeholder to satisfy UNIQUE constraint if needed
        const rawPassword = 'Admin@123';
        
        // Check if admin already exists
        const [existing] = await connection.query(
            'SELECT id, email FROM users WHERE email = ?',
            [adminEmail]
        );

        if (existing.length > 0) {
            console.log(`[INFO] Admin user ${adminEmail} already exists. Skipping seed.`);
            return;
        }

        // Hash the password using the existing bcryptjs implementation
        console.log(`[INFO] Hashing password...`);
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Insert the admin user
        console.log(`[INFO] Inserting admin into database...`);
        const [result] = await connection.query(
            `INSERT INTO users (full_name, email, phone, password, role, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                'System Administrator',
                adminEmail,
                adminPhone,
                hashedPassword,
                'admin', // Note: enum is 'passenger', 'admin' based on 000_create_users.sql
                'active'
            ]
        );

        console.log(`✅ Successfully created ADMIN user!`);
        console.log(`   Email:    ${adminEmail}`);
        console.log(`   Password: ${rawPassword}`);
        console.log(`   ID:       ${result.insertId}`);
        console.log('\nYou can now log in at /admin/login');

    } catch (error) {
        console.error('❌ Failed to seed admin user:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

if (require.main === module) {
    seedAdmin()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = seedAdmin;
