const db = require('../config/db');

exports.createPayment = (req, res) => {
    const { Amount, PaymentDate, PaymentMethod, BookingID, MemberID } = req.body;
    if (!Amount || !PaymentDate || !PaymentMethod || !BookingID) {
        return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const insertPaymentSql = 'INSERT INTO PAYMENT (Amount, PaymentDate, PaymentMethod, PaymentStatus, BookingID) VALUES (?, ?, ?, ?, ?)';
    db.query(insertPaymentSql, [Amount, PaymentDate, PaymentMethod, 'PAID', BookingID], (err, paymentResult) => {
        if (err) return res.status(500).json(err);

        const paymentId = paymentResult.insertId;
        const pointsEarned = Math.floor(Amount);

        // ✅ Fixed: use MemberID + PointsChange + TransactionDate
        if (MemberID) {
            const insertPointsSql = `
                INSERT INTO POINT_TRANSACTION (MemberID, PaymentID, PointsChange, Reason, TransactionDate) 
                VALUES (?, ?, ?, 'EARN_FROM_PAYMENT', ?)
            `;
            db.query(insertPointsSql, [MemberID, paymentId, pointsEarned, PaymentDate], (err2) => {
                if (err2) return res.status(500).json(err2);
                res.status(201).json({ message: 'Payment successful', PaymentID: paymentId, PointsEarned: pointsEarned });
            });
        } else {
            res.status(201).json({ message: 'Payment successful', PaymentID: paymentId, PointsEarned: pointsEarned });
        }
    });
};

exports.getMemberPayments = (req, res) => {
    const sql = `
        SELECT p.*, b.BookingDate, b.StartTime, b.EndTime, r.RoomName
        FROM PAYMENT p
        JOIN BOOKING b ON p.BookingID = b.BookingID
        JOIN ROOM r ON b.RoomID = r.RoomID
        WHERE b.MemberID = ?
        ORDER BY p.PaymentDate DESC
    `;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};