// src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Konfigurasi untuk Railway MySQL (memerlukan SSL)
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // Port public Railway (biasanya 31448 atau sesuai yang diberikan)
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Tambahkan SSL jika menggunakan Railway (production)
// Railway menggunakan host dengan domain .rlwy.net atau .railway.app
if (process.env.NODE_ENV === 'production' || 
    process.env.DB_HOST?.includes('railway') || 
    process.env.DB_HOST?.includes('rlwy.net')) {
    dbConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = mysql.createPool(dbConfig);

module.exports = pool;