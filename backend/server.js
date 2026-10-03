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

// ==========================================
// สร้าง API ทั้งหมด (ต้องอยู่ก่อน app.listen)
// ==========================================

// 1. หน้าแรก
app.get('/', (req, res) => {
    res.send('<h1>SheSparks Wellness API is running! 🎉</h1><p>ลองเข้าไปที่ <a href="/api/members">/api/members</a> เพื่อดูข้อมูล</p>');
});

// 2. ดึงข้อมูลสมาชิก
app.get('/api/members', (req, res) => {
    db.query('SELECT * FROM MEMBER', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 3. ดึงข้อมูลสตูดิโอ
app.get('/api/studios', (req, res) => {
    db.query('SELECT * FROM STUDIO', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 4. ดึงข้อมูลห้อง
app.get('/api/rooms', (req, res) => {
    db.query('SELECT * FROM ROOM', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 5. ดึงข้อมูลเทรนเนอร์ (ตัวที่ขาดไป)
app.get('/api/trainers', (req, res) => {
    db.query('SELECT * FROM TRAINER', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ==========================================
// Start Server (ต้องอยู่บรรทัดสุดท้ายเสมอ)
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});