const db = require('../config/db');

// All trainers
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

// Single trainer + teaching schedule
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

// ✅ NEW: bookings of this trainer (used in trainer-dashboard.js)
exports.getTrainerBookings = (req, res) => {
    const sql = `
        SELECT b.BookingID, b.BookingDate, b.StartTime, b.EndTime,
               m.Name AS MemberName, r.RoomName, st.SportName,
               p.PaymentStatus,
               CASE WHEN p.PaymentStatus = 'PAID' THEN 'Confirmed' ELSE 'Pending' END AS Status
        FROM BOOKING_TRAINER bt
        JOIN BOOKING b ON bt.BookingID = b.BookingID
        JOIN MEMBER m ON b.MemberID = m.MemberID
        JOIN ROOM r ON b.RoomID = r.RoomID
        LEFT JOIN SPORT_TYPE st ON r.SportTypeID = st.SportTypeID
        LEFT JOIN PAYMENT p ON p.BookingID = b.BookingID
        WHERE bt.TrainerID = ?
        ORDER BY b.BookingDate DESC, b.StartTime DESC
    `;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// Available trainers on specified date and time
exports.getAvailableTrainers = (req, res) => {
    const { date, startTime, endTime } = req.query;
    if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: 'Please specify date, startTime, endTime' });
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