const db = require('../config/db');

exports.getAllEquipment = (req, res) => {
    const sql = `
        SELECT e.*, s.SportName
        FROM EQUIPMENT e
        LEFT JOIN SPORT_TYPE s ON e.SportTypeID = s.SportTypeID
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

exports.getAvailableEquipment = (req, res) => {
    const { date, startTime, endTime } = req.query;
    const sql = `
        SELECT e.* FROM EQUIPMENT e
        WHERE e.EquipmentID NOT IN (
            SELECT be.EquipmentID FROM BOOKING_EQUIPMENT be
            JOIN BOOKING b ON be.BookingID = b.BookingID
            WHERE b.BookingDate = ?
              AND (b.StartTime < ? AND b.EndTime > ?)
              AND be.ReturnStatus != 'Returned'
        )
    `;
    db.query(sql, [date, endTime, startTime], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};