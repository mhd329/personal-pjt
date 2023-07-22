const env = require("dotenv");
env.config();

const mysql = require("mysql");
const pool = mysql.createPool({
    connectionLimit: 10,
    port: 3306,
    // host: mysql,
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "myapp"
});

exports.pool = pool;