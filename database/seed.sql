USE shesparks;

-- ============================
-- 1. STUDIO
-- ============================
INSERT INTO STUDIO (StudioCode, Name, Location, Capacity, NumberOfRooms, ImageURL) VALUES
('ST001', 'SheSparks Nimman', 'Nimman, Chiang Mai', 50, 3, 'https://sponsoredworkpermit.com/wp-content/uploads/2025/09/6385c11e3fff88628f36e7eb_SWP-blog-image.jpg'),
('ST002', 'SheSparks Old City', 'Old City, Chiang Mai', 40, 2, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYOL7TtMv4uEkirUH0yoSsp8uVU5FuQzNl8uFymQh7KxgAk6r68PPwMgo&s=10'),
('ST003', 'SheSparks Riverside', 'Riverside, Chiang Mai', 60, 3, 'https://thechiangmai.com/riverside/wp-content/uploads/2023/10/Live-the-Suite-Life.jpg');

-- ============================
-- 2. SPORT_TYPE
-- ============================
INSERT INTO SPORT_TYPE (SportTypeID, SportName, IntensityLevel, ImageURL) VALUES
(1, 'Yoga', 'Low', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
(2, 'Pilates', 'Medium', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400'),
(3, 'Boxing', 'High', 'https://www.lecercle-boxing.com/wp-content/uploads/2024/10/allonge-boxe-cover.jpg'),
(4, 'Badminton', 'Medium', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400');

-- ============================
-- 3. STUDIO_SPORT_TYPE
-- ============================
INSERT INTO STUDIO_SPORT_TYPE (StudioCode, SportTypeID) VALUES
('ST001', 1), ('ST001', 2),
('ST002', 3), ('ST002', 4),
('ST003', 1), ('ST003', 3), ('ST003', 2);

-- ============================
-- 4. MEMBER 
-- ============================
INSERT INTO MEMBER (MemberID, Name, Phone, DOB, MemberLevel, Email, StudioCode, CreatedAt) VALUES
(1, 'Jane Doe', '081-234-5678', '1995-05-15', 'Silver', 'jane@shesparks.com', 'ST001', NOW()),
(2, 'Sarah Smith', '081-234-5679', '1990-01-01', 'Platinum', 'sarah@shesparks.com', 'ST001', NOW());

-- ============================
-- 5. TRAINER
-- ============================
INSERT INTO TRAINER (TrainerID, Name, Phone, HireDate, Position, StudioCode, SportTypeID, ImageURL) VALUES
(1, 'Coach Mali', '081-111-1111', '2024-01-15', 'Senior Trainer', 'ST001', 1, 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400'),
(2, 'Coach Ploy', '082-222-2222', '2024-03-15', 'Trainer', 'ST001', 2, 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400'),
(3, 'Coach Fah', '083-333-3333', '2023-08-01', 'Senior Trainer', 'ST002', 3, 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400');

-- ============================
-- 6. USER_ACCOUNT
-- ============================
INSERT INTO USER_ACCOUNT (Username, PasswordHash, Role, TrainerID) VALUES
('admin01', 'hashed_pwd_123', 'ADMIN', NULL),
('manager_nimman', 'hashed_pwd_123', 'STUDIO_MANAGER', NULL),
('trainer_mali', 'hashed_pwd_123', 'TRAINER', 1),
('member_jane', 'hashed_pwd_123', 'MEMBER', NULL);

-- ============================
-- 7. REWARD_ITEM
-- ============================
INSERT INTO REWARD_ITEM (RewardID, Name, PointCost, Value, Category, ImageURL) VALUES
(1, 'Spa Voucher 500 THB', 500, 500.00, 'Beauty', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400'),
(2, 'Yoga Mat', 800, 800.00, 'Sports', 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400'),
(3, '10% Massage Discount', 100, 100.00, 'Discount', 'https://images.gowabi.com/pictures/images/000/194/101/big_slider_pic/58.png?1752746788');

-- ============================
-- 8. ROOM 
-- ============================
INSERT INTO ROOM (RoomID, RoomName, Capacity, StudioCode, SportTypeID, HourlyRate, TrainerRate, ImageURL) VALUES
(1, 'Yoga Room A', 20, 'ST001', 1, 300.00, 500.00, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/f3/71/95/yoga-studio-on-6th-floor.jpg?w=1200&h=1200&s=1'),
(2, 'Pilates Room B', 15, 'ST001', 2, 350.00, 500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcFdpjDVDQMtEqvSlfb8WhliMusPHTfxLqybpgnLrfroHdDglf0TzB6of5&s=10'),
(3, 'Boxing Ring C', 10, 'ST002', 3, 400.00, 600.00, 'https://www.protecboxing.com/wp-content/uploads/2023/10/IMG_8300-scaled.webp');

-- ============================
-- 9. EQUIPMENT
-- ============================
INSERT INTO EQUIPMENT (EquipmentID, Name, ConditionStatus, LateFee, SportTypeID, StudioCode, ImageURL) VALUES
(1, 'Yoga Mat Pro', 'GOOD', 50.00, 1, 'ST001', 'https://mandukathailand.com/cdn/shop/files/111011Z30-Mats-PRO71-VERVE-02_c20a6342-8663-4436-8441-093cfd3d0f5d_1080x.jpg?v=1738237472'),
(2, 'Pilates Ball', 'GOOD', 80.00, 2, 'ST001', 'https://contents.mediadecathlon.com/p3067465/k$ebc9793bcd6ee90c724d45b7bb344dc4/900-g-weighted-pilates-ball-brown-domyos-8975529.jpg?f=1920x0&format=auto'),
(3, 'Boxing Gloves', 'MAINTENANCE', 120.00, 3, 'ST002', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKjp1FY6k2x0eKZfeIA_dhWtubgZJhq3u4mSyENJVa4W0tMiARcsNY-Vk&s=10');

-- ============================
-- 10. QUALIFICATION & TRAINER_QUALIFICATION
-- ============================
INSERT INTO QUALIFICATION (QualID, QualName, IssuedBy) VALUES
(1, 'Certified Yoga Instructor', 'Yoga Alliance'),
(2, 'Pilates Master Trainer', 'Pilates Method Alliance');

INSERT INTO TRAINER_QUALIFICATION (TrainerID, QualID, DateObtained, ExpiryDate) VALUES
(1, 1, '2020-05-10', '2027-05-10'),
(2, 2, '2021-08-15', '2028-08-15');

-- ============================
-- 11. COURSE & TRAINER_COURSE
-- ============================
INSERT INTO COURSE (CourseID, Title, Level, DurationHours, StandardFee, SportTypeID, StudioCode, RoomID, TrainerID) VALUES
(1, 'Basic Yoga', 'Beginner', 10.0, 1500.00, 1, 'ST001', 1, 1),
(2, 'Pilates Intro', 'Beginner', 8.0, 1200.00, 2, 'ST001', 2, 2),
(3, 'Advanced Yoga', 'Advanced', 15.0, 2500.00, 1, 'ST001', 1, 1),
(4, 'Women Boxing', 'Intermediate', 12.0, 2000.00, 3, 'ST002', 3, 3);

INSERT INTO TRAINER_COURSE (TrainerID, CourseID, AssignedDate, TeachingRole) VALUES
(1, 1, '2026-01-05', 'Lead Trainer'),
(2, 2, '2026-01-05', 'Lead Trainer'),
(1, 3, '2026-01-05', 'Lead Trainer'),
(3, 4, '2026-01-05', 'Lead Trainer');

-- ============================
-- 12. TRAINER_SCHEDULE 
-- ============================
INSERT INTO TRAINER_SCHEDULE (TrainerID, WorkDate, StartTime, EndTime, ScheduleStatus) VALUES
(1, CURDATE(), '09:00:00', '12:00:00', 'AVAILABLE'),
(2, CURDATE(), '13:00:00', '16:00:00', 'AVAILABLE');

-- ============================
-- 13. SITE_SETTING
-- ============================
INSERT INTO SITE_SETTING (SettingKey, SettingValue) VALUES
('points_per_baht', '1'),
('max_booking_days_advance', '30');

-- ============================
-- 14. COURSE_PREREQUISITE
-- ============================
INSERT INTO COURSE_PREREQUISITE (CourseID, PrerequisiteCourseID) VALUES
(3, 1),
(4, 3);
