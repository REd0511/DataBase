const db = require('../config/db');

// ดึงสมาชิกทั้งหมด
exports.getAllMembers = (req, res) => {
    db.query('SELECT * FROM MEMBER', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ดึงสมาชิกคนเดียว
exports.getMemberById = (req, res) => {
    db.query('SELECT * FROM MEMBER WHERE MemberID = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'ไม่พบสมาชิก' });
        res.json(results[0]);
    });
};

// สมัครสมาชิกใหม่
exports.createMember = (req, res) => {
    const { Name, Phone, DOB, MemberLevel } = req.body;
    if (!Name || !Phone) return res.status(400).json({ message: 'กรอกชื่อและเบอร์โทร' });

    const sql = 'INSERT INTO MEMBER (Name, Phone, DOB, MemberLevel) VALUES (?, ?, ?, ?)';
    db.query(sql, [Name, Phone, DOB, MemberLevel || 'Silver'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'เบอร์นี้ถูกใช้แล้ว' });
            return res.status(500).json(err);
        }
        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', MemberID: result.insertId });
    });
};

// ดูแต้มสะสมของสมาชิก
exports.getMemberPoints = (req, res) => {
    const memberId = req.params.id;
    const sql = `
        SELECT 
            COALESCE(SUM(CASE WHEN pt.PointsChange > 0 THEN pt.PointsChange ELSE 0 END), 0) AS TotalEarned,
            COALESCE(SUM(CASE WHEN pt.PointsChange < 0 THEN ABS(pt.PointsChange) ELSE 0 END), 0) AS TotalRedeemed,
            COALESCE(SUM(pt.PointsChange), 0) AS Balance
        FROM POINT_TRANSACTION pt
        WHERE pt.MemberID = ?
    `;
    db.query(sql, [memberId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ MemberID: memberId, ...results[0] });
    });
};

// ประวัติแต้ม
exports.getMemberTransactions = (req, res) => {
    const memberId = req.params.id;
    const sql = `
        SELECT pt.*, p.Amount, p.PaymentDate
        FROM POINT_TRANSACTION pt
        JOIN PAYMENT p ON pt.PaymentID = p.PaymentID
        JOIN BOOKING b ON p.BookingID = b.BookingID
        WHERE b.MemberID = ?
        ORDER BY pt.Date DESC
    `;
    db.query(sql, [memberId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};