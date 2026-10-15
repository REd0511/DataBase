const db = require('../config/db');

// Get all members
exports.getAllMembers = (req, res) => {
    db.query('SELECT * FROM MEMBER', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// Get single member
exports.getMemberById = (req, res) => {
    db.query('SELECT * FROM MEMBER WHERE MemberID = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'Member not found' });
        res.json(results[0]);
    });
};

// Register new member
exports.createMember = (req, res) => {
    const { Name, Phone, DOB, MemberLevel, StudioCode } = req.body;
    if (!Name || !Phone) return res.status(400).json({ message: 'Please enter name and phone number' });

    const sql = 'INSERT INTO MEMBER (Name, Phone, DOB, MemberLevel, StudioCode) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [Name, Phone, DOB, MemberLevel || 'Silver', StudioCode || 'ST001'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'This phone number is already in use' });
            return res.status(500).json(err);
        }
        res.status(201).json({ message: 'Member registration successful', MemberID: result.insertId });
    });
};

// Get member points
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

exports.getMemberTransactions = (req, res) => {
    const memberId = req.params.id;
    const sql = `
        SELECT pt.TransactionID, pt.PointsChange, pt.TransactionDate AS Date,
               pt.Reason, pt.PaymentID, 
               p.Amount, p.PaymentDate, p.PaymentMethod,
               p.BookingID, p.RedemptionID
        FROM POINT_TRANSACTION pt
        LEFT JOIN PAYMENT p ON pt.PaymentID = p.PaymentID
        WHERE pt.MemberID = ?
        ORDER BY pt.TransactionDate DESC, pt.TransactionID DESC
    `;
    db.query(sql, [memberId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};