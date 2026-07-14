// Here's what I used as a template to set up this module:
// https://tecadmin.net/configuring-mysql-connection-pooling-in-node-js/

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    connectionLimit: process.env.DB_CONNECTION_LIMIT,    
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: process.env.DB_ALLOW_MULTIPLE_STATEMENTS === 'true' ? true : false,
    waitForConnections: process.env.DB_WAIT_FOR_CONNECTION === 'true' ? true : false,
    queueLimit: 0
});

module.exports = pool;