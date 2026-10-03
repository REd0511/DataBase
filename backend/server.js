const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// เชื่อมต่อ MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'shesparks' 
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database!');
});

// API ทดสอบ
app.get('/api/members', (req, res) => {
    db.query('SELECT * FROM MEMBER', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// GET all studios
app.get('/api/studios', (req, res) => {
    db.query('SELECT * FROM STUDIO', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// GET all rooms
app.get('/api/rooms', (req, res) => {
    db.query('SELECT * FROM ROOM', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});