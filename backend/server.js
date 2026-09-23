// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path'); // New: To find folder paths
const db = require('./database'); 

const app = express();
// Port dynamic kele ahe, karan live server swatahcha port ghato
const PORT = process.env.PORT || 3000; 

app.use(cors()); 
app.use(express.json());

// New: Server la frontend folder baddal mahiti dene
app.use(express.static(path.join(__dirname, '../frontend')));

// 1. Status API
app.get('/api/status', (req, res) => {
    res.json({ message: "Campus OS Backend is running perfectly!" });
});

// 2. Database Integrated Login API
app.post('/api/login', (req, res) => {
    const { userId, password, role } = req.body;

    console.log(`Login attempt: ${role} - ${userId}`);

    // SQL query to verify credentials from the database
    const sqlQuery = `SELECT * FROM users WHERE userId = ? AND password = ? AND role = ?`;
    
    db.get(sqlQuery, [userId, password, role], (err, row) => {
        if (err) {
            console.error("Database error:", err.message);
            res.json({ success: false, message: "Internal server error" });
        } else if (row) {
            // User exists and password matches
            res.json({ success: true, message: "Login Successful!", role: row.role, name: row.name });
        } else {
            // Invalid credentials
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
            // Check if User ID already exists in database
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
    
    // Get today's date automatically
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
    // ORDER BY id DESC means newest notices appear first
    const sqlQuery = `SELECT * FROM notices ORDER BY id DESC`; 
    
    db.all(sqlQuery, [], (err, rows) => {
        if (err) {
            res.json({ success: false, notices: [] });
        } else {
            res.json({ success: true, notices: rows });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// New: Default route to load index.html when someone visits the live link
// Fallback route to load index.html safely
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});