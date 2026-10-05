// ==========================================
// SheSparks Wellness - Backend API
// ==========================================
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// เชื่อมต่อ MySQL (ใช้ค่าจาก .env หรือค่าเริ่มต้น)
// ==========================================
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_NAME || 'shesparks'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to MySQL:', err);
        return;
    }
    console.log('✅ Connected to MySQL database!');
});

// ==========================================
// Helper: คำนวณแต้มสะสมของสมาชิก
// ==========================================
function getMemberPoints(memberId, callback) {
    const sql = `
        SELECT 
            COALESCE(SUM(pt.PointsEarned), 0) - COALESCE(SUM(pt.PointsRedeemed), 0) AS TotalPoints
        FROM POINT_TRANSACTION pt
        JOIN PAYMENT p ON pt.PaymentID = p.PaymentID
        JOIN BOOKING b ON p.BookingID = b.BookingID
        WHERE b.MemberID = ?
    `;
    db.query(sql, [memberId], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0].TotalPoints);
    });
}

// ==========================================
// 1. หน้าแรก
// ==========================================
app.get('/', (req, res) => {
    res.send(`
        <h1>SheSparks Wellness API is running! 🎉</h1>
        <p>ลองเข้าไปที่ <a href="/api/members">/api/members</a> เพื่อดูข้อมูล</p>
    `);
});

// ==========================================
// 2. GET APIs (ดึงข้อมูล)
// ==========================================

// 2.1 ดึงข้อมูลสมาชิกทั้งหมด
app.get('/api/members', (req, res) => {
    db.query('SELECT * FROM MEMBER', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2.2 ดึงข้อมูลสตูดิโอ
app.get('/api/studios', (req, res) => {
    db.query('SELECT * FROM STUDIO', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2.3 ดึงข้อมูลห้อง
app.get('/api/rooms', (req, res) => {
    db.query('SELECT * FROM ROOM', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2.4 ดึงข้อมูลเทรนเนอร์
app.get('/api/trainers', (req, res) => {
    db.query('SELECT * FROM TRAINER', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2.5 ดึงข้อมูลคอร์ส
app.get('/api/courses', (req, res) => {
    db.query('SELECT * FROM COURSE', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2.6 ดึงข้อมูลอุปกรณ์
app.get('/api/equipments', (req, res) => {
    db.query('SELECT * FROM EQUIPMENT', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2.7 ดึงข้อมูลรางวัล (Reward Items)
app.get('/api/rewards', (req, res) => {
    db.query('SELECT * FROM REWARD_ITEM', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2.8 ดึงแต้มสะสมของสมาชิกตาม ID
app.get('/api/members/:id/points', (req, res) => {
    const memberId = req.params.id;
    getMemberPoints(memberId, (err, points) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ MemberID: memberId, TotalPoints: points });
    });
});

// ==========================================
// 3. POST APIs (สร้างข้อมูล)
// ==========================================

// 3.1 สร้างการจอง (Booking) - พร้อมตรวจสอบห้องว่างและห้ามจองย้อนหลัง
app.post('/api/bookings', (req, res) => {
    const { BookingDate, StartTime, EndTime, MemberID, RoomID } = req.body;

    // ตรวจสอบข้อมูลครบถ้วน
    if (!BookingDate || !StartTime || !EndTime || !MemberID || !RoomID) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // ตรวจสอบห้ามจองย้อนหลัง
    const today = new Date().toISOString().split('T')[0];
    if (BookingDate < today) {
        return res.status(400).json({ message: 'ไม่สามารถจองย้อนหลังได้' });
    }

    // ตรวจสอบว่าห้องว่างหรือไม่ (ห้ามจองซ้อน)
    const checkSql = `
        SELECT * FROM BOOKING 
        WHERE RoomID = ? 
          AND BookingDate = ? 
          AND (StartTime < ? AND EndTime > ?)
    `;
    db.query(checkSql, [RoomID, BookingDate, EndTime, StartTime], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            return res.status(400).json({ message: 'ห้องนี้ถูกจองไปแล้วในช่วงเวลาดังกล่าว' });
        }

        // ถ้าห้องว่าง ให้ทำการจอง
        const insertSql = `
            INSERT INTO BOOKING (BookingDate, StartTime, EndTime, MemberID, RoomID) 
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(insertSql, [BookingDate, StartTime, EndTime, MemberID, RoomID], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                message: 'จองห้องสำเร็จ! 🎉',
                BookingID: result.insertId
            });
        });
    });
});

// 3.2 ชำระเงิน (Payment) - พร้อมคำนวณแต้มสะสม (1 บาท = 1 แต้ม)
app.post('/api/payments', (req, res) => {
    const { Amount, PaymentDate, PaymentMethod, BookingID } = req.body;

    if (!Amount || !PaymentDate || !PaymentMethod || !BookingID) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // 1. บันทึกการชำระเงิน
    const insertPaymentSql = `
        INSERT INTO PAYMENT (Amount, PaymentDate, PaymentMethod, BookingID) 
        VALUES (?, ?, ?, ?)
    `;
    db.query(insertPaymentSql, [Amount, PaymentDate, PaymentMethod, BookingID], (err, paymentResult) => {
        if (err) return res.status(500).json({ error: err.message });

        const paymentId = paymentResult.insertId;
        const pointsEarned = Math.floor(Amount); // 1 บาท = 1 แต้ม (ปัดเศษลง)

        // 2. บันทึกแต้มที่ได้ลง POINT_TRANSACTION
        const insertPointsSql = `
            INSERT INTO POINT_TRANSACTION (PointsEarned, PointsRedeemed, Date, PaymentID) 
            VALUES (?, 0, ?, ?)
        `;
        db.query(insertPointsSql, [pointsEarned, PaymentDate, paymentId], (err, pointsResult) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                message: 'ชำระเงินสำเร็จ! 🎉',
                PaymentID: paymentId,
                PointsEarned: pointsEarned
            });
        });
    });
});

// 3.3 ลงทะเบียนเรียนคอร์ส (Enrollment)
app.post('/api/enrollments', (req, res) => {
    const { MemberID, CourseID, EnrollmentDate, PaymentStatus } = req.body;

    if (!MemberID || !CourseID || !EnrollmentDate) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const sql = `
        INSERT INTO ENROLLMENT (MemberID, CourseID, EnrollmentDate, PaymentStatus) 
        VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [MemberID, CourseID, EnrollmentDate, PaymentStatus || 'Pending'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'สมาชิกคนนี้ลงทะเบียนคอร์สนี้แล้ว' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'ลงทะเบียนสำเร็จ! 🎉' });
    });
});

// 3.4 แลกรางวัล (Redemption) - ตรวจสอบแต้มก่อนแลก
app.post('/api/redemptions', (req, res) => {
    const { MemberID, RewardID, RedemptionDate, PointsUsed } = req.body;

    if (!MemberID || !RewardID || !RedemptionDate || !PointsUsed) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // ตรวจสอบแต้มสะสมก่อน
    getMemberPoints(MemberID, (err, currentPoints) => {
        if (err) return res.status(500).json({ error: err.message });

        if (currentPoints < PointsUsed) {
            return res.status(400).json({ 
                message: `แต้มไม่เพียงพอ (มี ${currentPoints} แต้ม, ต้องใช้ ${PointsUsed} แต้ม)` 
            });
        }

        // บันทึกการแลกรางวัล
        const insertRedemptionSql = `
            INSERT INTO REDEMPTION (MemberID, RewardID, RedemptionDate, PointsUsed) 
            VALUES (?, ?, ?, ?)
        `;
        db.query(insertRedemptionSql, [MemberID, RewardID, RedemptionDate, PointsUsed], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // บันทึกการหักแต้ม (PointsRedeemed) ใน POINT_TRANSACTION
            // ต้องมี PaymentID อ้างอิง - เราจะใช้ PaymentID ที่มีอยู่แล้วของสมาชิกคนนี้
            // (หรืออาจจะสร้าง Payment ใหม่ แต่ในที่นี้เพื่อความง่ายจะใช้ PaymentID แรกที่เจอ)
            // ในระบบจริงควรมี logic ที่ซับซ้อนกว่านี้ แต่เพื่อการศึกษาเราจะทำให้ง่ายก่อน
            const findPaymentSql = `
                SELECT p.PaymentID 
                FROM PAYMENT p
                JOIN BOOKING b ON p.BookingID = b.BookingID
                WHERE b.MemberID = ?
                LIMIT 1
            `;
            db.query(findPaymentSql, [MemberID], (err, payments) => {
                if (err) return res.status(500).json({ error: err.message });
                if (payments.length === 0) {
                    return res.status(400).json({ message: 'ไม่พบประวัติการชำระเงินสำหรับสมาชิกคนนี้' });
                }

                const paymentId = payments[0].PaymentID;
                const insertPointsSql = `
                    INSERT INTO POINT_TRANSACTION (PointsEarned, PointsRedeemed, Date, PaymentID) 
                    VALUES (0, ?, ?, ?)
                `;
                db.query(insertPointsSql, [PointsUsed, RedemptionDate, paymentId], (err, pointsResult) => {
                    if (err) return res.status(500).json({ error: err.message });

                    res.status(201).json({
                        message: 'แลกรางวัลสำเร็จ! 🎉',
                        RedemptionID: result.insertId,
                        PointsUsed: PointsUsed
                    });
                });
            });
        });
    });
});

// ==========================================
// 4. Start Server (ต้องอยู่บรรทัดสุดท้ายเสมอ)
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});