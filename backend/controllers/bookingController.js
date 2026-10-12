const db = require('../config/db');

// สร้างการจอง (ตรวจสอบห้องว่าง + ห้ามจองย้อนหลัง)
exports.createBooking = (req, res) => {
    const { BookingDate, StartTime, EndTime, MemberID, RoomID, EquipmentIDs, TrainerIDs } = req.body;

    if (!BookingDate || !StartTime || !EndTime || !MemberID || !RoomID) {
        return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (BookingDate < today) {
        return res.status(400).json({ message: 'ไม่สามารถจองย้อนหลังได้' });
    }

    const checkSql = 'SELECT * FROM BOOKING WHERE RoomID = ? AND BookingDate = ? AND StartTime < ? AND EndTime > ?';
    db.query(checkSql, [RoomID, BookingDate, EndTime, StartTime], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length > 0) return res.status(400).json({ message: 'ห้องถูกจองแล้วในช่วงเวลานี้' });

        const insertSql = 'INSERT INTO BOOKING (BookingDate, StartTime, EndTime, MemberID, RoomID) VALUES (?, ?, ?, ?, ?)';
        db.query(insertSql, [BookingDate, StartTime, EndTime, MemberID, RoomID], (err, result) => {
            if (err) return res.status(500).json(err);
            const bookingId = result.insertId;

            // เพิ่มอุปกรณ์ (ถ้ามี)
            if (EquipmentIDs && EquipmentIDs.length > 0) {
                const equipValues = EquipmentIDs.map(eq => [bookingId, eq.EquipmentID || eq, eq.Quantity || 1, 'Not Returned']);
                db.query('INSERT INTO BOOKING_EQUIPMENT (BookingID, EquipmentID, Quantity, ReturnStatus) VALUES ?', [equipValues], (err) => {
                    if (err) console.error('Equipment insert error:', err);
                });
            }

            // เพิ่มเทรนเนอร์ (ถ้ามี)
            if (TrainerIDs && TrainerIDs.length > 0) {
                const trainerValues = TrainerIDs.map(t => [bookingId, t.TrainerID || t, t.TrainerRole || 'Main', t.HourlyRate || 500]);
                db.query('INSERT INTO BOOKING_TRAINER (BookingID, TrainerID, TrainerRole, HourlyRateAtBooking) VALUES ?', [trainerValues], (err) => {
                    if (err) console.error('Trainer insert error:', err);
                });
            }

            res.status(201).json({ message: 'จองสำเร็จ', BookingID: bookingId });
        });
    });
};

// ประวัติการจองของสมาชิก
exports.getMemberBookings = (req, res) => {
    const sql = `
        SELECT b.*, r.RoomName, s.Location,
               p.PaymentID, p.Amount, p.PaymentStatus
        FROM BOOKING b
        JOIN ROOM r ON b.RoomID = r.RoomID
        JOIN STUDIO s ON r.StudioCode = s.StudioCode
        LEFT JOIN PAYMENT p ON p.BookingID = b.BookingID
        WHERE b.MemberID = ?
        ORDER BY b.BookingDate DESC
    `;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// การจองทั้งหมด (สำหรับ Admin/Manager)
exports.getAllBookings = (req, res) => {
    const sql = `
        SELECT b.*, m.Name AS MemberName, r.RoomName, s.Location
        FROM BOOKING b
        JOIN MEMBER m ON b.MemberID = m.MemberID
        JOIN ROOM r ON b.RoomID = r.RoomID
        JOIN STUDIO s ON r.StudioCode = s.StudioCode
        ORDER BY b.BookingDate DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ยกเลิกการจอง
exports.cancelBooking = (req, res) => {
    const bookingId = req.params.id;
    db.query('DELETE FROM BOOKING WHERE BookingID = ?', [bookingId], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'ไม่พบการจอง' });
        res.json({ message: 'ยกเลิกการจองสำเร็จ' });
    });
};