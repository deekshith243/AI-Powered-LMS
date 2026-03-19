const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lms_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Simple test to ensure connection works immediately
pool.getConnection()
  .then(conn => {
    console.log('✅ Successfully connected to MySQL database');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to MySQL datababse:', err.message);
  });

module.exports = pool;
