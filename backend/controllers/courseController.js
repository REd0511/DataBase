const db = require('../config/db');

// คอร์สทั้งหมด
exports.getAllCourses = (req, res) => {
    const sql = `
        SELECT c.*, s.SportName
        FROM COURSE c
        JOIN SPORT_TYPE s ON c.SportTypeID = s.SportTypeID
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ลงทะเบียนคอร์ส
exports.enrollCourse = (req, res) => {
    const { MemberID, CourseID, EnrollmentDate, PaymentStatus } = req.body;
    if (!MemberID || !CourseID || !EnrollmentDate) {
        return res.status(400).json({ message: 'กรอกข้อมูลให้ครบ' });
    }
    const sql = 'INSERT INTO ENROLLMENT (MemberID, CourseID, EnrollmentDate, PaymentStatus) VALUES (?, ?, ?, ?)';
    db.query(sql, [MemberID, CourseID, EnrollmentDate, PaymentStatus || 'Pending'], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'ลงทะเบียนคอร์สนี้แล้ว' });
            return res.status(500).json(err);
        }
        res.status(201).json({ message: 'ลงทะเบียนสำเร็จ' });
    });
};

// คอร์สที่สมาชิกลงทะเบียนไว้
exports.getMemberEnrollments = (req, res) => {
    const sql = `
        SELECT e.*, c.Title, c.Level, c.StandardFee
        FROM ENROLLMENT e
        JOIN COURSE c ON e.CourseID = c.CourseID
        WHERE e.MemberID = ?
    `;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};