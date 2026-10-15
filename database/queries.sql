USE shesparks;

-- ==========================================
-- Report 1: Availability Reports
-- ==========================================

-- 1.1 Available Rooms (with rate info)
SELECT 
    r.RoomID, r.RoomName, r.Capacity, 
    r.HourlyRate, r.TrainerRate,
    s.Name AS StudioName,
    st.SportName
FROM ROOM r
JOIN STUDIO s ON r.StudioCode = s.StudioCode
LEFT JOIN SPORT_TYPE st ON st.SportTypeID = r.SportTypeID
WHERE r.IsActive = TRUE
  AND NOT EXISTS (
      SELECT 1
      FROM BOOKING b
      WHERE b.RoomID = r.RoomID
        AND b.BookingDate = '2026-10-20'
        AND b.Status IN ('PENDING', 'CONFIRMED')
        AND b.StartTime < '10:30:00' 
        AND b.EndTime > '09:30:00'
  );

-- 1.2 Available Equipment 
SELECT 
    e.EquipmentID, 
    e.Name, 
    e.ConditionStatus, 
    e.LateFee,
    st.SportName,
    s.Name AS StudioName
FROM EQUIPMENT e
LEFT JOIN SPORT_TYPE st ON e.SportTypeID = st.SportTypeID
LEFT JOIN STUDIO s ON e.StudioCode = s.StudioCode
WHERE e.ConditionStatus = 'GOOD'
  AND e.IsAvailable = TRUE
  AND NOT EXISTS (
      SELECT 1
      FROM BOOKING_EQUIPMENT be
      JOIN BOOKING b ON be.BookingID = b.BookingID
      WHERE be.EquipmentID = e.EquipmentID
        AND b.BookingDate = '2026-10-20'
        AND b.Status IN ('PENDING', 'CONFIRMED')
        AND b.StartTime < '10:30:00'
        AND b.EndTime > '09:30:00'
  );

-- 1.3 Available Trainers 
SELECT 
    t.TrainerID, 
    t.Name, 
    t.Phone,
    st.SportName,
    s.Name AS StudioName
FROM TRAINER t
JOIN SPORT_TYPE st ON t.SportTypeID = st.SportTypeID
LEFT JOIN STUDIO s ON t.StudioCode = s.StudioCode
WHERE t.IsActive = TRUE
  AND NOT EXISTS (
      SELECT 1
      FROM BOOKING_TRAINER bt
      JOIN BOOKING b ON bt.BookingID = b.BookingID
      WHERE bt.TrainerID = t.TrainerID
        AND b.BookingDate = '2026-10-20'
        AND b.Status IN ('PENDING', 'CONFIRMED')
        AND b.StartTime < '10:30:00'
        AND b.EndTime > '09:30:00'
  );

-- ==========================================
-- Report 2: Booking Report
-- ==========================================

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
ORDER BY b.BookingDate DESC, b.StartTime DESC;

-- ==========================================
-- Report 3: Revenue Report (แยกตาม Source)
-- ==========================================

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
ORDER BY Month DESC;

-- ==========================================
-- Report 4: Popular Courses
-- ==========================================

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
ORDER BY TotalEnrollments DESC, Revenue DESC;

-- ==========================================
-- Report 5: Monthly Course Revenue
-- ==========================================

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
ORDER BY Month DESC, TotalRevenue DESC;

-- ==========================================
-- Report 6: Loyalty Points Summary
-- ==========================================

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
ORDER BY Balance DESC;

-- ==========================================
-- Report 7: Popular Time Slots
-- ==========================================

SELECT 
    HOUR(b.StartTime) AS HourSlot,
    COUNT(*) AS TotalBookings,
    COUNT(DISTINCT b.RoomID) AS UniqueRooms,
    COUNT(DISTINCT b.MemberID) AS UniqueMembers
FROM BOOKING b
WHERE b.Status IN ('PENDING', 'CONFIRMED', 'COMPLETED')
GROUP BY HOUR(b.StartTime)
ORDER BY TotalBookings DESC;

-- ==========================================
-- Report 8: Top Members (สูงสุด 10 คน)
-- ==========================================

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
LIMIT 10;

-- ==========================================
-- SECTION 2: DASHBOARD METRICS
-- ==========================================

-- Dashboard: total active members
SELECT COUNT(*) AS TotalMembers
FROM MEMBER
WHERE IsActive = TRUE;

-- Dashboard: total valid bookings 
SELECT COUNT(*) AS TotalBookings
FROM BOOKING
WHERE Status != 'CANCELLED';

-- Dashboard: total revenue (exclude Redemption payments Amount=0)
SELECT 
    SUM(Amount) AS TotalRevenue,
    SUM(CASE WHEN BookingID IS NOT NULL THEN Amount ELSE 0 END) AS BookingRevenue,
    SUM(CASE WHEN EnrollmentID IS NOT NULL THEN Amount ELSE 0 END) AS CourseRevenue
FROM PAYMENT
WHERE PaymentStatus = 'PAID'
  AND Amount > 0;

-- Dashboard: new members by month
SELECT 
    DATE_FORMAT(CreatedAt, '%Y-%m') AS Month,
    COUNT(*) AS NewMembers
FROM MEMBER
GROUP BY DATE_FORMAT(CreatedAt, '%Y-%m')
ORDER BY Month;

-- Dashboard: points earned vs redeemed by month
SELECT 
    DATE_FORMAT(TransactionDate, '%Y-%m') AS Month,
    SUM(CASE WHEN PointsChange > 0 THEN PointsChange ELSE 0 END) AS PointsEarned,
    SUM(CASE WHEN PointsChange < 0 THEN ABS(PointsChange) ELSE 0 END) AS PointsRedeemed,
    SUM(PointsChange) AS NetChange
FROM POINT_TRANSACTION
GROUP BY DATE_FORMAT(TransactionDate, '%Y-%m')
ORDER BY Month DESC;

-- ==========================================
-- SECTION 3: DATA VALIDATION QUERIES
-- ==========================================

SELECT 
    'Orphan PointTransaction' AS Issue,
    COUNT(*) AS Count
FROM POINT_TRANSACTION
WHERE PaymentID IS NULL
UNION ALL

SELECT 
    'Payment with no entity' AS Issue,
    COUNT(*) AS Count
FROM PAYMENT
WHERE BookingID IS NULL 
  AND RedemptionID IS NULL 
  AND EnrollmentID IS NULL;

SELECT 
    m.MemberID,
    m.Name,
    COALESCE(SUM(pt.PointsChange), 0) AS Balance,
    CASE WHEN COALESCE(SUM(pt.PointsChange), 0) < 0 THEN '⚠️ Negative!' ELSE 'OK' END AS Status
FROM MEMBER m
LEFT JOIN POINT_TRANSACTION pt ON pt.MemberID = m.MemberID
GROUP BY m.MemberID, m.Name
HAVING Balance < 0;

SELECT 
    p.PaymentID,
    p.Amount,
    p.PaymentMethod,
    p.BookingID,
    p.RedemptionID,
    p.EnrollmentID,
    CASE 
        WHEN p.Amount = 0 AND p.RedemptionID IS NULL THEN '⚠️ Zero amount without Redemption'
        ELSE 'OK'
    END AS Status
FROM PAYMENT p
WHERE p.Amount = 0;

-- ==========================================
-- SECTION 4: DEMO QUERIES
-- ==========================================

-- Demo 1: Total revenue by month 
SELECT 
    DATE_FORMAT(PaymentDate, '%Y-%m') AS Month,
    SUM(Amount) AS TotalRevenue,
    COUNT(*) AS Transactions
FROM PAYMENT
WHERE PaymentStatus = 'PAID'
  AND Amount > 0
GROUP BY DATE_FORMAT(PaymentDate, '%Y-%m')
ORDER BY Month DESC;

-- Demo 2: Top 5 Members 
SELECT 
    m.Name,
    m.MemberLevel,
    SUM(p.Amount) AS TotalSpending
FROM MEMBER m
JOIN BOOKING b ON b.MemberID = m.MemberID
JOIN PAYMENT p ON p.BookingID = b.BookingID
WHERE p.PaymentStatus = 'PAID'
GROUP BY m.MemberID, m.Name, m.MemberLevel
ORDER BY TotalSpending DESC
LIMIT 5;

-- Demo 3: Loyalty Points Summary (Earned vs Redeemed)
SELECT 
    m.Name,
    SUM(CASE WHEN pt.PointsChange > 0 THEN pt.PointsChange ELSE 0 END) AS Earned,
    SUM(CASE WHEN pt.PointsChange < 0 THEN ABS(pt.PointsChange) ELSE 0 END) AS Redeemed,
    SUM(pt.PointsChange) AS Balance
FROM MEMBER m
JOIN POINT_TRANSACTION pt ON pt.MemberID = m.MemberID
GROUP BY m.MemberID, m.Name
ORDER BY Balance DESC;