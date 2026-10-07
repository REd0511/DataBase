USE shesparks;

-- Report 1: Available rooms
SELECT r.RoomID, r.RoomName, r.Capacity, s.Location
FROM ROOM r
JOIN STUDIO s ON r.StudioCode = s.StudioCode
WHERE NOT EXISTS (
    SELECT 1
    FROM BOOKING b
    WHERE b.RoomID = r.RoomID
      AND b.BookingDate = '2026-10-08'
      AND b.StartTime < '10:30:00'
      AND b.EndTime > '09:30:00'
);

-- Report 1: Available equipment
SELECT e.EquipmentID, e.Name, e.`Condition`, st.SportName
FROM EQUIPMENT e
LEFT JOIN SPORT_TYPE st ON e.SportTypeID = st.SportTypeID
WHERE e.`Condition` <> 'Damaged'
AND e.`Condition` <> 'Maintenance'
AND NOT EXISTS (
    SELECT 1
    FROM BOOKING_EQUIPMENT be
    JOIN BOOKING b ON be.BookingID = b.BookingID
    WHERE be.EquipmentID = e.EquipmentID
      AND b.BookingDate = '2026-10-08'
      AND b.StartTime < '10:30:00'
      AND b.EndTime > '09:30:00'
);

-- Report 1: Available trainers
SELECT t.TrainerID, t.Name, st.SportName, s.Location
FROM TRAINER t
JOIN SPORT_TYPE st ON t.SportTypeID = st.SportTypeID
JOIN STUDIO s ON t.StudioCode = s.StudioCode
WHERE NOT EXISTS (
    SELECT 1
    FROM BOOKING_TRAINER bt
    JOIN BOOKING b ON bt.BookingID = b.BookingID
    WHERE bt.TrainerID = t.TrainerID
      AND b.BookingDate = '2026-10-08'
      AND b.StartTime < '10:30:00'
      AND b.EndTime > '09:30:00'
);

-- Report 2: Member points
SELECT m.MemberID, m.Name, m.MemberLevel,
       SUM(pt.PointsEarned) AS Earned,
       SUM(pt.PointsRedeemed) AS Redeemed,
       SUM(pt.PointsEarned - pt.PointsRedeemed) AS Balance
FROM MEMBER m
LEFT JOIN BOOKING b ON m.MemberID = b.MemberID
LEFT JOIN PAYMENT p ON b.BookingID = p.BookingID
LEFT JOIN POINT_TRANSACTION pt ON p.PaymentID = pt.PaymentID
GROUP BY m.MemberID, m.Name, m.MemberLevel
ORDER BY Balance DESC;

-- Report 3: Popular courses
SELECT c.CourseID, c.Title, c.Level,
       COUNT(e.MemberID) AS Enrollments,
       SUM(CASE WHEN e.PaymentStatus = 'Paid'
                THEN c.StandardFee ELSE 0 END) AS Revenue
FROM COURSE c
LEFT JOIN ENROLLMENT e ON c.CourseID = e.CourseID
GROUP BY c.CourseID, c.Title, c.Level
ORDER BY Enrollments DESC, Revenue DESC;

-- Report 3: Monthly course revenue
SELECT DATE_FORMAT(e.EnrollmentDate, '%Y-%m') AS Month,
       SUM(CASE WHEN e.PaymentStatus = 'Paid'
                THEN c.StandardFee ELSE 0 END) AS Revenue
FROM ENROLLMENT e
JOIN COURSE c ON e.CourseID = c.CourseID
GROUP BY DATE_FORMAT(e.EnrollmentDate, '%Y-%m')
ORDER BY Month;

-- Dashboard: total members
SELECT COUNT(*) AS TotalMembers
FROM MEMBER;

-- Dashboard: total bookings
SELECT COUNT(*) AS TotalBookings
FROM BOOKING;

-- Dashboard: total revenue
SELECT SUM(Amount) AS TotalRevenue
FROM PAYMENT;

-- Dashboard: new members by month
SELECT DATE_FORMAT(CreatedAt, '%Y-%m') AS Month,
       COUNT(*) AS NewMembers
FROM MEMBER
GROUP BY DATE_FORMAT(CreatedAt, '%Y-%m')
ORDER BY Month;

-- Dashboard: revenue by month
SELECT DATE_FORMAT(PaymentDate, '%Y-%m') AS Month,
       SUM(Amount) AS Revenue
FROM PAYMENT
GROUP BY DATE_FORMAT(PaymentDate, '%Y-%m')
ORDER BY Month;
