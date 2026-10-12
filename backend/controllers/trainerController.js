const db = require('../config/db');

// เทรนเนอร์ทั้งหมด
exports.getAllTrainers = (req, res) => {
    const sql = `
        SELECT t.*, s.Location AS StudioLocation, st.SportName
        FROM TRAINER t
        LEFT JOIN STUDIO s ON t.StudioCode = s.StudioCode
        LEFT JOIN SPORT_TYPE st ON t.SportTypeID = st.SportTypeID
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// เทรนเนอร์คนเดียว + ตารางสอน
exports.getTrainerById = (req, res) => {
    const trainerId = req.params.id;
    const sql = `
        SELECT bt.BookingID, b.BookingDate, b.StartTime, b.EndTime, r.RoomName
        FROM BOOKING_TRAINER bt
        JOIN BOOKING b ON bt.BookingID = b.BookingID
        JOIN ROOM r ON b.RoomID = r.RoomID
        WHERE bt.TrainerID = ?
        ORDER BY b.BookingDate DESC
    `;
    db.query(sql, [trainerId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// เทรนเนอร์ว่างในวันและเวลา
exports.getAvailableTrainers = (req, res) => {
    const { date, startTime, endTime } = req.query;
    if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: 'กรุณาระบุ date, startTime, endTime' });
    }

    const sql = `
        SELECT t.*, st.SportName
        FROM TRAINER t
        LEFT JOIN SPORT_TYPE st ON t.SportTypeID = st.SportTypeID
        WHERE t.TrainerID NOT IN (
            SELECT bt.TrainerID FROM BOOKING_TRAINER bt
            JOIN BOOKING b ON bt.BookingID = b.BookingID
            WHERE b.BookingDate = ?
              AND (b.StartTime < ? AND b.EndTime > ?)
        )
    `;
    db.query(sql, [date, endTime, startTime], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};