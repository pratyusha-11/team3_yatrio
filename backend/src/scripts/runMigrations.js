const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runMigrations() {
  console.log('==============================================');
  console.log('  Running Team 2 Railway Database Migrations  ');
  console.log('==============================================');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  });

  const dbName = process.env.DB_NAME || 'yatrio_db';
  console.log(`Ensuring database "${dbName}" exists...`);
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await connection.query(`USE \`${dbName}\`;`);

  const migrationsDir = path.join(__dirname, '../../migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    console.log(`Executing migration: ${file}...`);
    const filePath = path.join(migrationsDir, file);
    let sql = fs.readFileSync(filePath, 'utf-8');

    // Handle DELIMITER syntax if present
    if (sql.includes('DELIMITER')) {
      // Clean DELIMITER statements for mysql2 multipleStatements
      sql = sql.replace(/DELIMITER\s+\$\$/gi, '');
      sql = sql.replace(/DELIMITER\s+;/gi, '');
      sql = sql.replace(/\$\$/g, ';');
    }

    try {
      await connection.query(sql);
      console.log(`  ✓ Successfully executed ${file}`);
    } catch (err) {
      // Check if error is innocuous (e.g. index already exists)
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log(`  ℹ Index already exists in ${file}, continuing...`);
      } else {
        console.error(`  ✗ Error in ${file}:`, err.message);
        throw err;
      }
    }
  }

  await connection.end();
  console.log('All migrations completed successfully!\n');
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = runMigrations;
