USE shesparks;

-- ==========================================
-- Report 1: Availability Reports
-- ==========================================

-- 1.1 Available Rooms 
SELECT r.RoomID, r.RoomName, r.Capacity, s.Name AS StudioName
FROM ROOM r
JOIN STUDIO s ON r.StudioCode = s.StudioCode
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
SELECT e.EquipmentID, e.Name, e.ConditionStatus, st.SportName
FROM EQUIPMENT e
LEFT JOIN SPORT_TYPE st ON e.SportTypeID = st.SportTypeID
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
SELECT t.TrainerID, t.Name, st.SportName
FROM TRAINER t
JOIN SPORT_TYPE st ON t.SportTypeID = st.SportTypeID
JOIN TRAINER_SCHEDULE ts ON t.TrainerID = ts.TrainerID
WHERE t.IsActive = TRUE
  AND ts.WorkDate = '2026-10-20'
  AND ts.ScheduleStatus = 'AVAILABLE'
  AND ts.StartTime <= '09:30:00' 
  AND ts.EndTime >= '10:30:00'   
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
-- Report 2: Loyalty & Member Points
-- ==========================================

-- Member points 
SELECT m.MemberID, m.Name, m.MemberLevel,
       IFNULL(SUM(CASE WHEN pt.PointsChange > 0 THEN pt.PointsChange ELSE 0 END), 0) AS Earned,
       IFNULL(SUM(CASE WHEN pt.PointsChange < 0 THEN ABS(pt.PointsChange) ELSE 0 END), 0) AS Redeemed,
       IFNULL(SUM(pt.PointsChange), 0) AS AvailableBalance
FROM MEMBER m
LEFT JOIN POINT_TRANSACTION pt ON m.MemberID = pt.MemberID
WHERE m.IsActive = TRUE
GROUP BY m.MemberID, m.Name, m.MemberLevel
ORDER BY AvailableBalance DESC;

-- ==========================================
-- Report 3: Courses & Revenue
-- ==========================================

-- 3.1 Popular courses 
SELECT c.CourseID, c.Title, c.Level,
       COUNT(e.MemberID) AS Enrollments,
       SUM(CASE WHEN e.PaymentStatus = 'PAID' THEN c.StandardFee ELSE 0 END) AS Revenue
FROM COURSE c
LEFT JOIN ENROLLMENT e ON c.CourseID = e.CourseID
GROUP BY c.CourseID, c.Title, c.Level
ORDER BY Enrollments DESC, Revenue DESC;

-- 3.2 Monthly course revenue
SELECT DATE_FORMAT(e.EnrollmentDate, '%Y-%m') AS Month,
       SUM(CASE WHEN e.PaymentStatus = 'PAID' THEN c.StandardFee ELSE 0 END) AS Revenue
FROM ENROLLMENT e
JOIN COURSE c ON e.CourseID = c.CourseID
GROUP BY DATE_FORMAT(e.EnrollmentDate, '%Y-%m')
ORDER BY Month;

-- ==========================================
-- Dashboard Metrics
-- ==========================================

-- Dashboard: total active members
SELECT COUNT(*) AS TotalMembers
FROM MEMBER
WHERE IsActive = TRUE;

-- Dashboard: total valid bookings 
SELECT COUNT(*) AS TotalBookings
FROM BOOKING
WHERE Status != 'CANCELLED';

-- Dashboard: total revenue 
SELECT SUM(Amount) AS TotalRevenue
FROM PAYMENT
WHERE PaymentStatus = 'PAID';

-- Dashboard: new members by month
SELECT DATE_FORMAT(CreatedAt, '%Y-%m') AS Month,
       COUNT(*) AS NewMembers
FROM MEMBER
GROUP BY DATE_FORMAT(CreatedAt, '%Y-%m')
ORDER BY Month;

-- Dashboard: booking revenue by month
SELECT DATE_FORMAT(PaymentDate, '%Y-%m') AS Month,
       SUM(Amount) AS Revenue
FROM PAYMENT
WHERE PaymentStatus = 'PAID'
GROUP BY DATE_FORMAT(PaymentDate, '%Y-%m')
ORDER BY Month;