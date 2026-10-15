const db = require('../config/db');

// สตูดิโอทั้งหมด
exports.getAllStudios = (req, res) => {
    db.query('SELECT * FROM STUDIO', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ห้องทั้งหมด
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

// ประเภทกีฬาทั้งหมด
exports.getAllSportTypes = (req, res) => {
    db.query('SELECT * FROM SPORT_TYPE', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ห้องว่างในวันที่และเวลาที่กำหนด
exports.getAvailableRooms = (req, res) => {
    const { date, startTime, endTime } = req.query;
    if (!date || !startTime || !endTime) {
        return res.status(400).json({ message: 'กรุณาระบุ date, startTime, endTime' });
    }

    const sql = `
        SELECT r.*, s.Location AS StudioLocation
        FROM ROOM r
        JOIN STUDIO s ON r.StudioCode = s.StudioCode
        WHERE r.RoomID NOT IN (
            SELECT RoomID FROM BOOKING
            WHERE BookingDate = ?
              AND (StartTime < ? AND EndTime > ?)
        )
    `;
    db.query(sql, [date, endTime, startTime], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};