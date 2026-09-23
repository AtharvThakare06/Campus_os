// backend/database.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error("Database Connection Error:", err.message);
    } else {
        console.log("Connected to the SQLite database successfully.");
        
        // 1. Create Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT UNIQUE,
            password TEXT,
            role TEXT,
            name TEXT
        )`);

        // 2. Create Notices Table (New Feature)
        db.run(`CREATE TABLE IF NOT EXISTS notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            date TEXT
        )`);
        
        // Add a dummy student if not exists
        const insertQuery = `INSERT OR IGNORE INTO users (userId, password, role, name) VALUES ('student01', 'pass123', 'Student', 'Atharv Thakare')`;
        db.run(insertQuery);
    }
});

module.exports = db;