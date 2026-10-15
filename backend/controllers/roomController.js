const db = require('../config/db');

// All studios
exports.getAllStudios = (req, res) => {
    db.query('SELECT * FROM STUDIO', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// All rooms
exports.getAllRooms = (req, res) => {
    const sql = `
        SELECT r.*, s.Location AS StudioLocation
        FROM ROOM r
        JOIN STUDIO s ON r.StudioCode = s.StudioCode
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// All sport types
exports.getAllSportTypes = (req, res) => {
    db.query('SELECT * FROM SPORT_TYPE', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// Available rooms on specified date and time
exports.getAvailableRooms = (req, res) => {
    const { date, startTime, endTime } = req.query;
    if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: 'Please specify date, startTime, endTime' });
    }

    const cleanDate = String(date).split('T')[0].split(' ')[0];

    const sql = `
        SELECT r.*, s.Location AS StudioLocation
        FROM ROOM r
        JOIN STUDIO s ON r.StudioCode = s.StudioCode
        WHERE r.RoomID NOT IN (
            SELECT RoomID FROM BOOKING
            WHERE DATE_FORMAT(BookingDate, '%Y-%m-%d') = ?
              AND (StartTime < ? AND EndTime > ?)
        )
    `;
    db.query(sql, [cleanDate, endTime, startTime], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};