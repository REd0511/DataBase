const db = require('../config/db');

// ============================================
// Report 1: Booking Report (รายละเอียดการจอง)
// ============================================
exports.getBookingReport = (req, res) => {
    const sql = `
        SELECT 
            b.BookingID, 
            b.BookingDate, 
            b.StartTime, 
            b.EndTime,
            b.Status AS BookingStatus,
            m.Name AS MemberName, 
            m.MemberLevel,
            r.RoomName, 
            r.HourlyRate,
            s.Location,
            s.Name AS StudioName,
            st.SportName,
            COALESCE(p.Amount, 0) AS Amount,
            p.PaymentStatus,
            (SELECT SUM(pt.PointsChange) 
             FROM POINT_TRANSACTION pt 
             WHERE pt.PaymentID = p.PaymentID AND pt.PointsChange > 0) AS PointsEarned
        FROM BOOKING b
        JOIN MEMBER m ON b.MemberID = m.MemberID
        JOIN ROOM r ON b.RoomID = r.RoomID
        JOIN STUDIO s ON r.StudioCode = s.StudioCode
        LEFT JOIN SPORT_TYPE st ON st.SportTypeID = r.SportTypeID
        LEFT JOIN PAYMENT p ON p.BookingID = b.BookingID
        ORDER BY b.BookingDate DESC, b.StartTime DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ============================================
// Report 2: Revenue Report (รายได้รายเดือน — แยกตาม Source)
// ============================================
exports.getRevenueReport = (req, res) => {
    const sql = `
        SELECT 
            DATE_FORMAT(p.PaymentDate, '%Y-%m') AS Month,
            COUNT(p.PaymentID) AS TotalTransactions,
            SUM(p.Amount) AS TotalRevenue,
            SUM(CASE WHEN p.BookingID IS NOT NULL THEN p.Amount ELSE 0 END) AS BookingRevenue,
            SUM(CASE WHEN p.EnrollmentID IS NOT NULL THEN p.Amount ELSE 0 END) AS CourseRevenue,
            SUM(CASE WHEN p.RedemptionID IS NOT NULL THEN p.Amount ELSE 0 END) AS RedemptionAmount,
            COALESCE(SUM(CASE WHEN pt.PointsChange > 0 THEN pt.PointsChange ELSE 0 END), 0) AS TotalPointsEarned,
            COALESCE(SUM(CASE WHEN pt.PointsChange < 0 THEN ABS(pt.PointsChange) ELSE 0 END), 0) AS TotalPointsRedeemed
        FROM PAYMENT p
        LEFT JOIN POINT_TRANSACTION pt ON pt.PaymentID = p.PaymentID
        WHERE p.PaymentStatus = 'PAID'
        GROUP BY DATE_FORMAT(p.PaymentDate, '%Y-%m')
        ORDER BY Month DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ============================================
// Report 3: Course Report (คอร์สยอดนิยม + รายได้)
// ============================================
exports.getCourseReport = (req, res) => {
    const sql = `
        SELECT 
            c.CourseID, 
            c.Title, 
            c.Level, 
            c.StandardFee,
            s.SportName,
            COUNT(e.MemberID) AS TotalEnrollments,
            COALESCE(SUM(CASE WHEN e.PaymentStatus = 'PAID' THEN c.StandardFee ELSE 0 END), 0) AS Revenue
        FROM COURSE c
        JOIN SPORT_TYPE s ON c.SportTypeID = s.SportTypeID
        LEFT JOIN ENROLLMENT e ON e.CourseID = c.CourseID
        GROUP BY c.CourseID, c.Title, c.Level, c.StandardFee, s.SportName
        ORDER BY TotalEnrollments DESC, Revenue DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ============================================
// Report 4: Member Level Report (สมาชิกแยกตามระดับ)
// ============================================
exports.getMemberLevelReport = (req, res) => {
    const sql = `
        SELECT 
            m.MemberLevel, 
            COUNT(*) AS TotalMembers,
            COALESCE(SUM(CASE WHEN pt.PointsChange > 0 THEN pt.PointsChange ELSE 0 END), 0) AS TotalPointsEarned,
            COALESCE(SUM(CASE WHEN pt.PointsChange < 0 THEN ABS(pt.PointsChange) ELSE 0 END), 0) AS TotalPointsRedeemed
        FROM MEMBER m
        LEFT JOIN POINT_TRANSACTION pt ON pt.MemberID = m.MemberID
        WHERE m.IsActive = TRUE
        GROUP BY m.MemberLevel
        ORDER BY FIELD(m.MemberLevel, 'Platinum', 'Gold', 'Silver')
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ============================================
// Report 5: Monthly Course Revenue
// ============================================
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
        WHERE e.PaymentStatus = 'PAID'
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

// ============================================
// Report 6: Loyalty Points Summary (ทุก Member)
// ============================================
exports.getLoyaltySummaryReport = (req, res) => {
    const sql = `
        SELECT 
            m.MemberID,
            m.Name,
            m.MemberLevel,
            COUNT(DISTINCT b.BookingID) AS TotalBookings,
            COALESCE(SUM(CASE WHEN pt.PointsChange > 0 THEN pt.PointsChange ELSE 0 END), 0) AS TotalEarned,
            COALESCE(SUM(CASE WHEN pt.PointsChange < 0 THEN ABS(pt.PointsChange) ELSE 0 END), 0) AS TotalRedeemed,
            COALESCE(SUM(pt.PointsChange), 0) AS Balance
        FROM MEMBER m
        LEFT JOIN BOOKING b ON b.MemberID = m.MemberID
        LEFT JOIN POINT_TRANSACTION pt ON pt.MemberID = m.MemberID
        WHERE m.IsActive = TRUE
        GROUP BY m.MemberID, m.Name, m.MemberLevel
        ORDER BY Balance DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ============================================
// Report 7: Popular Time Slots (ช่วงเวลายอดนิยม)
// ============================================
exports.getPopularTimeSlots = (req, res) => {
    const sql = `
        SELECT 
            HOUR(b.StartTime) AS HourSlot,
            COUNT(*) AS TotalBookings,
            COUNT(DISTINCT b.RoomID) AS UniqueRooms,
            COUNT(DISTINCT b.MemberID) AS UniqueMembers
        FROM BOOKING b
        WHERE b.Status IN ('PENDING', 'CONFIRMED', 'COMPLETED')
        GROUP BY HOUR(b.StartTime)
        ORDER BY TotalBookings DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// ============================================
// Report 8: Top Members (สมาชิกที่ใช้จ่ายสูงสุด)
// ============================================
exports.getTopMembers = (req, res) => {
    const sql = `
        SELECT 
            m.MemberID,
            m.Name,
            m.MemberLevel,
            m.Email,
            COUNT(DISTINCT p.PaymentID) AS TotalTransactions,
            COALESCE(SUM(p.Amount), 0) AS TotalSpending,
            COALESCE(SUM(CASE WHEN pt.PointsChange > 0 THEN pt.PointsChange ELSE 0 END), 0) AS TotalPointsEarned,
            COALESCE(SUM(pt.PointsChange), 0) AS Balance
        FROM MEMBER m
        LEFT JOIN PAYMENT p ON p.BookingID IN (
            SELECT BookingID FROM BOOKING WHERE MemberID = m.MemberID
        ) OR p.EnrollmentID IN (
            SELECT EnrollmentID FROM ENROLLMENT WHERE MemberID = m.MemberID
        )
        LEFT JOIN POINT_TRANSACTION pt ON pt.MemberID = m.MemberID
        WHERE m.IsActive = TRUE
        GROUP BY m.MemberID, m.Name, m.MemberLevel, m.Email
        ORDER BY TotalSpending DESC
        LIMIT 10
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};