// src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Konfigurasi untuk Railway MySQL menggunakan format Railway environment variables
// Railway menyediakan: MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
// Juga mendukung MYSQL_URL jika tersedia (connection string lengkap)

let dbConfig;

// Jika MYSQL_URL tersedia, gunakan connection string
if (process.env.MYSQL_URL) {
    // Parse connection string format: mysql://user:password@host:port/database
    try {
        // URL constructor memerlukan protocol yang valid, jadi kita parse manual
        const mysqlUrl = process.env.MYSQL_URL.replace(/^mysql:\/\//, 'http://');
        const url = new URL(mysqlUrl);
        dbConfig = {
            host: url.hostname,
            port: parseInt(url.port) || 3306,
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database: url.pathname.replace(/^\//, ''),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 10000,
            acquireTimeout: 10000,
            timeout: 10000
        };
    } catch (error) {
        console.error('Error parsing MYSQL_URL, falling back to individual variables:', error);
        // Fallback ke individual variables jika parsing gagal
        dbConfig = {
            host: process.env.MYSQLHOST || process.env.DB_HOST,
            port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
            user: process.env.MYSQLUSER || process.env.DB_USER,
            password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
            database: process.env.MYSQLDATABASE || process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 10000,
            acquireTimeout: 10000,
            timeout: 10000
        };
    }
} else {
    // Gunakan individual environment variables (format Railway)
    dbConfig = {
        host: process.env.MYSQLHOST || process.env.DB_HOST, // Fallback ke DB_HOST untuk kompatibilitas
        port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
        user: process.env.MYSQLUSER || process.env.DB_USER, // Fallback ke DB_USER untuk kompatibilitas
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD, // Fallback ke DB_PASSWORD untuk kompatibilitas
        database: process.env.MYSQLDATABASE || process.env.DB_NAME, // Fallback ke DB_NAME untuk kompatibilitas
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000, // 10 detik timeout untuk connection
        acquireTimeout: 10000, // 10 detik timeout untuk acquire connection
        timeout: 10000 // 10 detik query timeout
    };
}

// Tambahkan SSL jika menggunakan Railway (production)
// Railway menggunakan host dengan domain .rlwy.net atau .railway.app
const dbHost = dbConfig.host || '';
if (process.env.NODE_ENV === 'production' || 
    dbHost.includes('railway') || 
    dbHost.includes('rlwy.net') ||
    process.env.MYSQLHOST) { // Jika menggunakan MYSQLHOST, kemungkinan besar Railway
    dbConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = mysql.createPool(dbConfig);

module.exports = pool;