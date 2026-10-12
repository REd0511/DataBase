const db = require('../config/db');

// ชำระเงิน + สะสมแต้ม (1 บาท = 1 แต้ม)
exports.createPayment = (req, res) => {
    const { Amount, PaymentDate, PaymentMethod, BookingID } = req.body;
    if (!Amount || !PaymentDate || !PaymentMethod || !BookingID) {
        return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });
    }

    const insertPaymentSql = 'INSERT INTO PAYMENT (Amount, PaymentDate, PaymentMethod, BookingID) VALUES (?, ?, ?, ?)';
    db.query(insertPaymentSql, [Amount, PaymentDate, PaymentMethod, BookingID], (err, paymentResult) => {
        if (err) return res.status(500).json(err);

        const paymentId = paymentResult.insertId;
        const pointsEarned = Math.floor(Amount);

        const insertPointsSql = 'INSERT INTO POINT_TRANSACTION (PointsEarned, PointsRedeemed, Date, PaymentID) VALUES (?, 0, ?, ?)';
        db.query(insertPointsSql, [pointsEarned, PaymentDate, paymentId], (err) => {
            if (err) return res.status(500).json(err);
            res.status(201).json({
                message: 'ชำระเงินสำเร็จ',
                PaymentID: paymentId,
                PointsEarned: pointsEarned
            });
        });
    });
};

// ประวัติการชำระเงินของสมาชิก
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