const db = require('../config/db');

// Report 1: การจองทั้งหมด + รายได้
exports.getBookingReport = (req, res) => {
    const sql = `
        SELECT 
            b.BookingID, b.BookingDate, b.StartTime, b.EndTime,
            m.Name AS MemberName, m.MemberLevel,
            r.RoomName, s.Location,
            COALESCE(p.Amount, 0) AS Amount
        FROM BOOKING b
        JOIN MEMBER m ON b.MemberID = m.MemberID
        JOIN ROOM r ON b.RoomID = r.RoomID
        JOIN STUDIO s ON r.StudioCode = s.StudioCode
        LEFT JOIN PAYMENT p ON p.BookingID = b.BookingID
        ORDER BY b.BookingDate DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// Report 2: รายได้รายเดือน + แต้มที่แจก
exports.getRevenueReport = (req, res) => {
    const sql = `
        SELECT 
            DATE_FORMAT(p.PaymentDate, '%Y-%m') AS Month,
            COUNT(p.PaymentID) AS TotalTransactions,
            SUM(p.Amount) AS TotalRevenue,
            COALESCE(SUM(CASE WHEN pt.PointsChange > 0 THEN pt.PointsChange ELSE 0 END), 0) AS TotalPointsEarned
        FROM PAYMENT p
        LEFT JOIN POINT_TRANSACTION pt ON pt.PaymentID = p.PaymentID
        GROUP BY Month
        ORDER BY Month DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// Report 3: คอร์สยอดนิยม + สมาชิกแยกตามระดับ
exports.getCourseReport = (req, res) => {
    const sql = `
        SELECT 
            c.CourseID, c.Title, c.Level, c.StandardFee,
            s.SportName,
            COUNT(e.MemberID) AS TotalEnrollments,
            COALESCE(SUM(CASE WHEN e.PaymentStatus = 'Paid' THEN c.StandardFee ELSE 0 END), 0) AS Revenue
        FROM COURSE c
        JOIN SPORT_TYPE s ON c.SportTypeID = s.SportTypeID
        LEFT JOIN ENROLLMENT e ON e.CourseID = c.CourseID
        GROUP BY c.CourseID
        ORDER BY TotalEnrollments DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// Report เพิ่ม: สมาชิกแยกตามระดับ
exports.getMemberLevelReport = (req, res) => {
    const sql = `
        SELECT MemberLevel, COUNT(*) AS TotalMembers
        FROM MEMBER
        GROUP BY MemberLevel
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};


// Report: Course revenue grouped by enrollment month
exports.getMonthlyCourseRevenueReport = (req, res) => {
    const sql = `
        SELECT
            DATE_FORMAT(e.EnrollmentDate, '%Y-%m') AS Month,
            c.CourseID,
            c.Title AS CourseName,
            COUNT(*) AS TotalEnrollments,
            COALESCE(SUM(c.StandardFee), 0) AS TotalRevenue
        FROM COURSE c
        JOIN ENROLLMENT e ON e.CourseID = c.CourseID
        WHERE e.PaymentStatus = 'Paid'
        GROUP BY
            DATE_FORMAT(e.EnrollmentDate, '%Y-%m'),
            c.CourseID,
            c.Title
        ORDER BY Month DESC, TotalRevenue DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Monthly course revenue report error:', err);
            return res.status(500).json({
                error: 'Failed to load monthly course revenue report'
            });
        }

        res.json(results);
    });
};
