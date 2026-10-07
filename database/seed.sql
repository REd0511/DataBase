USE shesparks;

-- ============================
-- 1. Studio
-- ============================
INSERT INTO STUDIO (StudioCode, Location, Capacity, NumberOfRooms) VALUES
(1, 'Silom, Bangkok', 45, 3),
(2, 'Phayathai, Bangkok', 35, 2),
(3, 'Ramkhamhaeng, Bangkok', 55, 3);

-- ============================
-- 2. Sport Type
-- ============================
INSERT INTO SPORT_TYPE (SportTypeID, SportName, IntensityLevel) VALUES
(1, 'Yoga', 'Low'),
(2, 'Pilates', 'Medium'),
(3, 'Boxing', 'High'),
(4, 'Badminton', 'Medium');

-- ============================
-- 3. Studio Sport Type
-- ============================
INSERT INTO STUDIO_SPORT_TYPE (StudioCode, SportTypeID) VALUES
(1,1), (1,2),
(2,3), (2,4),
(3,1), (3,2), (3,3), (3,4);

-- ============================
-- 4. Member
-- ============================
INSERT INTO MEMBER
(MemberID, Name, Phone, DOB, MemberLevel, StudioCode, CreatedAt) VALUES
(1, 'Aom', '0810000001', '1998-01-15', 'Gold', 1, '2026-09-01 09:00:00'),
(2, 'Bee', '0810000002', '1997-04-20', 'Silver', 1, '2026-09-05 10:00:00'),
(3, 'Chom', '0810000003', '1999-07-08', 'Platinum', 2, '2026-09-12 11:00:00'),
(4, 'Dao', '0810000004', '2000-02-02', 'Silver', 2, '2026-09-20 12:00:00'),
(5, 'Fah', '0810000005', '1996-11-11', 'Gold', 3, '2026-10-01 13:00:00'),
(6, 'Gam', '0810000006', '1998-06-30', 'Silver', 3, '2026-10-03 14:00:00'),
(7, 'Hana', '0810000007', '1997-09-18', 'Gold', 1, '2026-10-04 15:00:00'),
(8, 'Ice', '0810000008', '1999-12-22', 'Platinum', 2, '2026-10-05 16:00:00');

-- ============================
-- 5. Qualification
-- ============================
INSERT INTO QUALIFICATION (QualID, QualName, IssuedBy) VALUES
(1, 'Yoga Instructor Level 1', 'Yoga Alliance'),
(2, 'Pilates Instructor', 'Pilates Academy'),
(3, 'Boxing Coach', 'Thai Boxing Federation'),
(4, 'Badminton Coach', 'Thailand Badminton Association');

-- ============================
-- 6. Reward Item
-- ============================
INSERT INTO REWARD_ITEM
(RewardID, Name, PointCost, Value, Category) VALUES
(1, 'Spa Voucher 500 THB', 500, 500, 'Beauty'),
(2, 'Hair Treatment', 300, 300, 'Beauty'),
(3, 'Yoga Mat', 800, 800, 'Sports'),
(4, '10% Discount', 100, 10, 'Discount'),
(5, 'Sports Towel', 250, 250, 'Sports');

-- ============================
-- 7. Room
-- ============================
INSERT INTO ROOM (RoomID, RoomName, Capacity, StudioCode) VALUES
(1, 'Yoga Room A', 20, 1),
(2, 'Pilates Room A', 15, 1),
(3, 'Boxing Room A', 18, 2),
(4, 'Badminton Court A', 12, 2),
(5, 'Yoga Room B', 25, 3),
(6, 'Fitness Room A', 30, 3),
(7, 'Boxing Room B', 20, 3),
(8, 'Badminton Court B', 12, 3);

-- ============================
-- 8. Equipment
-- ============================
INSERT INTO EQUIPMENT
(EquipmentID, Name, `Condition`, LateFee, SportTypeID) VALUES
(1, 'Yoga Mat', 'Good', 20, 1),
(2, 'Pilates Ring', 'Good', 25, 2),
(3, 'Boxing Gloves', 'Good', 50, 3),
(4, 'Punching Bag', 'Good', 100, 3),
(5, 'Badminton Racket', 'Good', 40, 4),
(6, 'Resistance Band', 'Good', 20, 1),
(7, 'Pilates Ball', 'Good', 30, 2),
(8, 'Shuttlecock Set', 'Good', 25, 4);

-- ============================
-- 9. Trainer
-- ============================
INSERT INTO TRAINER
(TrainerID, Name, Phone, HireDate, Position, Salary, Age, StudioCode, SportTypeID) VALUES
(1, 'Mina', '0891000001', '2024-01-10', 'Senior Trainer', 45000, 31, 1, 1),
(2, 'Ploy', '0891000002', '2024-03-15', 'Trainer', 38000, 28, 1, 2),
(3, 'Nina', '0891000003', '2023-08-01', 'Senior Trainer', 48000, 34, 2, 3),
(4, 'May', '0891000004', '2025-01-20', 'Trainer', 35000, 27, 2, 4),
(5, 'Fah', '0891000005', '2023-06-10', 'Senior Trainer', 47000, 35, 3, 1),
(6, 'Grace', '0891000006', '2024-09-12', 'Trainer', 36000, 29, 3, 2),
(7, 'Jane', '0891000007', '2025-02-10', 'Trainer', 34000, 26, 3, 4);

-- ============================
-- 10. Course
-- ============================
INSERT INTO COURSE
(CourseID, Title, Level, DurationHours, StandardFee, SportTypeID) VALUES
(1, 'Yoga Beginner', 'Beginner', 2, 1500, 1),
(2, 'Pilates Basic', 'Beginner', 2, 1800, 2),
(3, 'Boxing Fundamentals', 'Intermediate', 3, 2200, 3),
(4, 'Badminton Basic', 'Beginner', 2, 1400, 4),
(5, 'Yoga Advanced', 'Advanced', 3, 2000, 1),
(6, 'Pilates Advanced', 'Advanced', 3, 2300, 2);

-- ============================
-- 11. Trainer Qualification
-- ============================
INSERT INTO TRAINER_QUALIFICATION
(TrainerID, QualID, DateObtained, ExpiryDate) VALUES
(1,1,'2024-02-01','2027-02-01'),
(2,2,'2024-04-01','2027-04-01'),
(3,3,'2023-09-01','2027-09-01'),
(4,4,'2025-02-01','2027-02-01'),
(5,1,'2023-07-01','2027-07-01'),
(6,2,'2024-10-01','2027-10-01'),
(7,4,'2025-03-01','2028-03-01');

-- ============================
-- 12. Trainer Course
-- ============================
INSERT INTO TRAINER_COURSE
(TrainerID, CourseID, AssignedDate, TeachingRole) VALUES
(1,1,'2026-01-05','Main Trainer'),
(1,5,'2026-01-05','Main Trainer'),
(2,2,'2026-01-05','Main Trainer'),
(2,6,'2026-01-05','Main Trainer'),
(3,3,'2026-01-05','Main Trainer'),
(4,4,'2026-01-05','Main Trainer'),
(5,1,'2026-02-01','Assistant Trainer'),
(5,5,'2026-02-01','Main Trainer'),
(6,2,'2026-02-01','Assistant Trainer'),
(6,6,'2026-02-01','Main Trainer'),
(7,4,'2026-02-01','Assistant Trainer');

-- ============================
-- 13. Course Prerequisite
-- ============================
INSERT INTO COURSE_PREREQUISITE (CourseID, PrerequisiteCourseID) VALUES
(5,1),
(6,2);

-- ============================
-- 14. Dependent
-- ============================
INSERT INTO DEPENDENT
(DependentID, Name, Age, Relationship, TrainerID) VALUES
(1,'Nina',8,'Daughter',1),
(2,'Nana',6,'Daughter',3),
(3,'Nong',10,'Son',5);

-- ============================
-- 15. Booking
-- ============================
INSERT INTO BOOKING
(BookingID, BookingDate, StartTime, EndTime, MemberID, RoomID) VALUES
(1,'2026-10-08','10:00:00','11:00:00',1,1),
(2,'2026-10-08','11:00:00','12:00:00',2,2),
(3,'2026-10-08','15:00:00','16:30:00',3,3),
(4,'2026-10-08','16:00:00','17:00:00',4,4),
(5,'2026-10-09','10:00:00','11:30:00',5,5),
(6,'2026-10-09','18:00:00','19:00:00',6,6),
(7,'2026-10-10','14:00:00','15:00:00',7,1),
(8,'2026-10-10','10:00:00','11:00:00',8,2),
(9,'2026-10-11','12:00:00','13:00:00',1,5),
(10,'2026-10-11','17:00:00','18:00:00',2,7),
(11,'2026-10-12','10:00:00','11:00:00',3,6),
(12,'2026-10-12','19:00:00','20:00:00',4,8);

-- ============================
-- 16. Booking Trainer
-- ============================
INSERT INTO BOOKING_TRAINER
(BookingID, TrainerID, TrainerRole, HourlyRateAtBooking) VALUES
(1,1,'Main Trainer',800),
(2,2,'Main Trainer',850),
(3,3,'Main Trainer',1000),
(4,4,'Main Trainer',750),
(5,5,'Main Trainer',800),
(6,6,'Main Trainer',850),
(7,1,'Main Trainer',800),
(8,2,'Main Trainer',850),
(9,5,'Main Trainer',800),
(10,3,'Main Trainer',1000),
(11,6,'Main Trainer',850),
(12,7,'Main Trainer',750);

-- ============================
-- 17. Booking Equipment
-- ============================
INSERT INTO BOOKING_EQUIPMENT
(BookingID, EquipmentID, Quantity, ReturnStatus) VALUES
(1,1,5,'Returned'),
(2,2,4,'Returned'),
(3,3,2,'Returned'),
(3,4,1,'Returned'),
(4,5,2,'Returned'),
(5,1,5,'Returned'),
(6,6,4,'Returned'),
(7,1,5,'Pending'),
(8,7,4,'Returned'),
(9,1,5,'Pending'),
(10,3,2,'Pending'),
(11,6,4,'Pending'),
(12,8,2,'Pending');

-- ============================
-- 18. Payment
-- ============================
INSERT INTO PAYMENT
(PaymentID, Amount, PaymentDate, PaymentMethod, BookingID) VALUES
(1,1500,'2026-10-08 10:05:00','Card',1),
(2,1800,'2026-10-08 11:40:00','PromptPay',2),
(3,2000,'2026-10-08 15:10:00','Card',3),
(4,1200,'2026-10-08 16:10:00','Cash',4),
(5,1600,'2026-10-09 10:40:00','Card',5),
(6,2200,'2026-10-09 18:40:00','PromptPay',6),
(7,1400,'2026-10-10 14:10:00','Card',7),
(8,1500,'2026-10-10 11:10:00','Card',8),
(9,1500,'2026-10-11 12:10:00','PromptPay',9),
(10,1800,'2026-10-11 17:10:00','Card',10),
(11,1200,'2026-10-12 10:40:00','Cash',11),
(12,2000,'2026-10-12 19:10:00','Card',12);

-- ============================
-- 19. Point Transactions
-- Earned points from payments.
-- Redemption points are also stored here.
-- ============================
INSERT INTO POINT_TRANSACTION
(TransactionID, PointsEarned, PointsRedeemed, `Date`, PaymentID) VALUES
(1,150,0,'2026-10-08 10:05:00',1),
(2,180,0,'2026-10-08 11:40:00',2),
(3,200,0,'2026-10-08 15:10:00',3),
(4,120,0,'2026-10-08 16:10:00',4),
(5,160,0,'2026-10-09 10:40:00',5),
(6,220,0,'2026-10-09 18:40:00',6),
(7,140,0,'2026-10-10 14:10:00',7),
(8,150,0,'2026-10-10 11:10:00',8),
(9,150,0,'2026-10-11 12:10:00',9),
(10,180,0,'2026-10-11 17:10:00',10),
(11,120,0,'2026-10-12 10:40:00',11),
(12,200,0,'2026-10-12 19:10:00',12),
(13,0,500,'2026-10-09 12:00:00',1),
(14,0,300,'2026-10-10 12:00:00',2),
(15,0,800,'2026-10-10 13:00:00',3),
(16,0,100,'2026-10-11 13:00:00',4);

-- ============================
-- 20. Enrollment
-- ============================
INSERT INTO ENROLLMENT
(MemberID, CourseID, EnrollmentDate, PaymentStatus) VALUES
(1,1,'2026-09-03','Paid'),
(1,2,'2026-09-10','Paid'),
(2,1,'2026-09-04','Paid'),
(2,3,'2026-09-15','Paid'),
(3,4,'2026-09-05','Paid'),
(3,2,'2026-09-20','Paid'),
(4,1,'2026-10-01','Paid'),
(5,4,'2026-10-02','Paid'),
(6,3,'2026-10-03','Pending'),
(7,1,'2026-10-04','Paid'),
(8,2,'2026-10-05','Paid'),
(5,5,'2026-10-06','Paid');

-- ============================
-- 21. Redemption
-- ============================
INSERT INTO REDEMPTION
(MemberID, RewardID, RedemptionDate, PointsUsed) VALUES
(1,1,'2026-10-09',500),
(2,2,'2026-10-10',300),
(3,3,'2026-10-10',800),
(4,4,'2026-10-11',100);

-- ============================
-- Check data
-- ============================
SELECT * FROM STUDIO;
SELECT * FROM MEMBER;
SELECT * FROM ROOM;
SELECT * FROM TRAINER;
SELECT * FROM COURSE;
SELECT * FROM BOOKING;
SELECT * FROM PAYMENT;
SELECT * FROM POINT_TRANSACTION;
SELECT * FROM ENROLLMENT;
SELECT * FROM REDEMPTION;
