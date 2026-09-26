const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database'); 

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors()); 
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// =========================================
// AUTO-GENERATE TEST ACCOUNTS & TABLES
// =========================================
db.serialize(() => {
    // 1. Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT UNIQUE,
        password TEXT,
        role TEXT,
        name TEXT
    )`);

    // 2. Create Notices Table
    db.run(`CREATE TABLE IF NOT EXISTS notices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        date TEXT
    )`);

    // 3. Create Labs Table
    db.run(`CREATE TABLE IF NOT EXISTS labs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        status TEXT,
        subject TEXT,
        time TEXT
    )`);

    // 4. Create Materials Table
    db.run(`CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        subject TEXT,
        link TEXT,
        date TEXT
    )`);

    // 5. Insert Default Users safely (No db.prepare)
    const insertUser = `INSERT OR IGNORE INTO users (userId, password, role, name) VALUES (?, ?, ?, ?)`;
    db.run(insertUser, ["STU01", "password123", "Student", "Atharv Thakare"]);
    db.run(insertUser, ["FAC01", "faculty123", "Faculty", "Test Faculty"]);
    db.run(insertUser, ["PRIN01", "admin123", "Principal", "Principal Sir"]);

    // 6. Insert Default Labs safely (No db.prepare)
    db.get("SELECT COUNT(*) AS count FROM labs", (err, row) => {
        if (row && row.count === 0) {
            const insertLab = `INSERT INTO labs (name, status, subject, time) VALUES (?, ?, ?, ?)`;
            db.run(insertLab, ["Lab 1 (Programming)", "Available", "-", "Free all day"]);
            db.run(insertLab, ["Lab 2 (Networking)", "Available", "-", "Free all day"]);
            db.run(insertLab, ["Lab 3 (AI & Data Science)", "Available", "-", "Free all day"]);
            db.run(insertLab, ["Lab 4 (Hardware)", "Available", "-", "Free all day"]);
        }
    });
});

// 1. Status API
app.get('/api/status', (req, res) => {
    res.json({ message: "Campus OS Backend is running perfectly!" });
});

// 2. Database Integrated Login API
app.post('/api/login', (req, res) => {
    const { userId, password, role } = req.body;

    console.log(`Login attempt: ${role} - ${userId}`);

    const sqlQuery = `SELECT * FROM users WHERE userId = ? AND password = ? AND role = ?`;
    
    db.get(sqlQuery, [userId, password, role], (err, row) => {
        if (err) {
            console.error("Database error:", err.message);
            res.json({ success: false, message: "Internal server error" });
        } else if (row) {
            res.json({ success: true, message: "Login Successful!", role: row.role, name: row.name });
        } else {
            res.json({ success: false, message: "Invalid ID, Password, or Role" });
        }
    });
});

// 3. API to Add New User (Admin Panel use only)
app.post('/api/adduser', (req, res) => {
    const { userId, password, role, name } = req.body;
    const sqlQuery = `INSERT INTO users (userId, password, role, name) VALUES (?, ?, ?, ?)`;
    
    db.run(sqlQuery, [userId, password, role, name], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.json({ success: false, message: "User ID already exists!" });
            } else {
                res.json({ success: false, message: "Database Error!" });
            }
        } else {
            res.json({ success: true, message: `${role} added successfully!` });
        }
    });
});

// 4. API to Add Notice (For Admin Panel)
app.post('/api/addnotice', (req, res) => {
    const { title, content } = req.body;
    const date = new Date().toLocaleDateString('en-GB'); 
    const sqlQuery = `INSERT INTO notices (title, content, date) VALUES (?, ?, ?)`;
    
    db.run(sqlQuery, [title, content, date], function(err) {
        if (err) {
            console.error("Error adding notice:", err.message);
            res.json({ success: false, message: "Database Error!" });
        } else {
            res.json({ success: true, message: "Notice published successfully!" });
        }
    });
});

// 5. API to Fetch All Notices (For Student Dashboard)
app.get('/api/notices', (req, res) => {
    const sqlQuery = `SELECT * FROM notices ORDER BY id DESC`; 
    db.all(sqlQuery, [], (err, rows) => {
        if (err) {
            res.json({ success: false, notices: [] });
        } else {
            res.json({ success: true, notices: rows });
        }
    });
});

// API to Upload Study Material (For Faculty Panel)
app.post('/api/addmaterial', (req, res) => {
    const { title, subject, link } = req.body;
    const date = new Date().toLocaleDateString('en-GB'); 

    const sqlQuery = `INSERT INTO materials (title, subject, link, date) VALUES (?, ?, ?, ?)`;
    
    db.run(sqlQuery, [title, subject, link, date], function(err) {
        if (err) {
            console.error("Error adding material:", err.message);
            res.json({ success: false, message: "Database Error!" });
        } else {
            res.json({ success: true, message: "Material uploaded successfully!" });
        }
    });
});

// API to Fetch All Study Materials (For Student Dashboard)
app.get('/api/materials', (req, res) => {
    const sqlQuery = `SELECT * FROM materials ORDER BY id DESC`; 
    
    db.all(sqlQuery, [], (err, rows) => {
        if (err) {
            console.error("Database error:", err.message);
            res.json({ success: false, materials: [] });
        } else {
            res.json({ success: true, materials: rows });
        }
    });
});

// API to Delete Study Material (For Faculty Panel)
app.delete('/api/deletematerial/:id', (req, res) => {
    const materialId = req.params.id;
    const sqlQuery = `DELETE FROM materials WHERE id = ?`;

    db.run(sqlQuery, [materialId], function(err) {
        if (err) {
            console.error("Delete error:", err.message);
            res.json({ success: false, message: "Failed to delete material." });
        } else {
            res.json({ success: true, message: "Material deleted successfully!" });
        }
    });
});

// API to Register New Users (Admin Only)
app.post('/api/register', (req, res) => {
    const { role, userId, password } = req.body;

    // First check if the User ID already exists
    const checkQuery = `SELECT * FROM users WHERE userId = ?`;
    
    db.get(checkQuery, [userId], (err, row) => {
        if (err) {
            console.error("Database error:", err.message);
            res.json({ success: false, message: "Database Error!" });
        } else if (row) {
            // User already exists
            res.json({ success: false, message: "User ID already exists! Try a different one." });
        } else {
            // Insert the new user into the database
            const insertQuery = `INSERT INTO users (userId, password, role) VALUES (?, ?, ?)`;
            
            db.run(insertQuery, [userId, password, role], function(err) {
                if (err) {
                    console.error("Insert error:", err.message);
                    res.json({ success: false, message: "Failed to register user." });
                } else {
                    res.json({ success: true, message: `${role} registered successfully!` });
                }
            });
        }
    });
});

// API to Fetch Live Lab Status
app.get('/api/labs', (req, res) => {
    const sqlQuery = `SELECT * FROM labs`;
    db.all(sqlQuery, [], (err, rows) => {
        if (err) {
            console.error("Database error:", err.message);
            res.json({ success: false, labs: [] });
        } else {
            res.json({ success: true, labs: rows });
        }
    });
});

// API to Update Lab Status (For Admin Panel)
app.post('/api/updatelab', (req, res) => {
    const { id, status, subject, time } = req.body;
    
    const sqlQuery = `UPDATE labs SET status = ?, subject = ?, time = ? WHERE id = ?`;
    
    db.run(sqlQuery, [status, subject, time, id], function(err) {
        if (err) {
            console.error("Update error:", err.message);
            res.json({ success: false, message: "Failed to update lab status." });
        } else {
            res.json({ success: true, message: "Lab status updated successfully!" });
        }
    });
});

// Fallback route to load index.html safely
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});