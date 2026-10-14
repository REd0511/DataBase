USE shesparks;

-- ============================
-- 1. Studio (จาก data.js)
-- ============================
INSERT INTO STUDIO (StudioCode, Name, Location, Capacity, NumberOfRooms, ImageURL) VALUES
('ST001', 'SheSparks Nimman', 'Nimman, Chiang Mai', 50, 3, 'https://sponsoredworkpermit.com/wp-content/uploads/2025/09/6385c11e3fff88628f36e7eb_SWP-blog-image.jpg'),
('ST002', 'SheSparks Old City', 'Old City, Chiang Mai', 40, 2, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYOL7TtMv4uEkirUH0yoSsp8uVU5FuQzNl8uFymQh7KxgAk6r68PPwMgo&s=10'),
('ST003', 'SheSparks Riverside', 'Riverside, Chiang Mai', 60, 3, 'https://thechiangmai.com/riverside/wp-content/uploads/2023/10/Live-the-Suite-Life.jpg');

-- ============================
-- 2. Sport Type
-- ============================
INSERT INTO SPORT_TYPE (SportTypeID, SportName, IntensityLevel, ImageURL) VALUES
(1, 'Yoga', 'Low', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
(2, 'Pilates', 'Medium', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400'),
(3, 'Boxing', 'High', 'https://www.lecercle-boxing.com/wp-content/uploads/2024/10/allonge-boxe-cover.jpg'),
(4, 'Badminton', 'Medium', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400');

-- ============================
-- 3. Studio Sport Type
-- ============================
INSERT INTO STUDIO_SPORT_TYPE (StudioCode, SportTypeID) VALUES
('ST001', 1), ('ST001', 2),
('ST002', 3), ('ST002', 4),
('ST003', 1), ('ST003', 3), ('ST003', 2);

-- ============================
-- 4. Member (Demo)
-- ============================
INSERT INTO MEMBER (MemberID, Name, Phone, DOB, MemberLevel, Email, Role, StudioCode, CreatedAt) VALUES
(1, 'Member Demo', '081-234-5678', '1995-05-15', 'Silver', 'member@shesparks.com', 'member', 'ST001', '2026-09-01 09:00:00'),
(2, 'Admin Demo', '081-234-5679', '1990-01-01', 'Platinum', 'admin@shesparks.com', 'admin', 'ST001', '2026-09-01 09:00:00');

-- ============================
-- 5. Reward Item (จาก data.js)
-- ============================
INSERT INTO REWARD_ITEM (RewardID, Name, PointCost, Value, Category, ImageURL) VALUES
(1, 'Spa Voucher 500 THB', 500, 500, 'Beauty', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400'),
(2, 'Hair Treatment', 300, 300, 'Beauty', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'),
(3, 'Yoga Mat', 800, 800, 'Sports', 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400'),
(4, '10% Discount for SheSparks Thai massage', 100, 100, 'Discount', 'https://images.gowabi.com/pictures/images/000/194/101/big_slider_pic/58.png?1752746788');

-- ============================
-- 6. Room (จาก data.js)
-- ============================
INSERT INTO ROOM (RoomID, RoomName, StudioCode, SportTypeID, Capacity, ImageURL) VALUES
(1, 'Yoga Room A', 'ST001', 1, 20, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/f3/71/95/yoga-studio-on-6th-floor.jpg?w=1200&h=1200&s=1'),
(2, 'Pilates Room B', 'ST001', 2, 15, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcFdpjDVDQMtEqvSlfb8WhliMusPHTfxLqybpgnLrfroHdDglf0TzB6of5&s=10'),
(3, 'Boxing Ring C', 'ST002', 3, 10, 'https://www.protecboxing.com/wp-content/uploads/2023/10/IMG_8300-scaled.webp'),
(4, 'Badminton Court D', 'ST002', 4, 4, 'https://cdn.sportsforlife.in/shared/blog-images/13-01-26/77bd4b83-5bab-4704-85a1-9036bbb49afc_What_Are_the_13_Basic_Rules_of_Badminton___1768295243637.png'),
(5, 'Yoga Room E', 'ST003', 1, 25, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/f3/71/95/yoga-studio-on-6th-floor.jpg?w=1200&h=1200&s=1'),
(6, 'Boxing Room F', 'ST003', 3, 12, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6kDBsDu_xoAFt6o2lPvpHwPQJheFzwGr0NDOQ7wHZh4NiUdAVqlCFxGYV&s=10'),
(7, 'Pilates Room G', 'ST003', 2, 18, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcFdpjDVDQMtEqvSlfb8WhliMusPHTfxLqybpgnLrfroHdDglf0TzB6of5&s=10');

-- ============================
-- 7. Equipment (จาก data.js)
-- ============================
INSERT INTO EQUIPMENT (EquipmentID, Name, SportTypeID, StudioCode, `Condition`, LateFee, ImageURL) VALUES
(1, 'Yoga Mat Pro', 1, 'ST001', 'Good', 50, 'https://mandukathailand.com/cdn/shop/files/111011Z30-Mats-PRO71-VERVE-02_c20a6342-8663-4436-8441-093cfd3d0f5d_1080x.jpg?v=1738237472'),
(2, 'Yoga Block', 1, 'ST001', 'Good', 30, 'https://cdn.shopify.com/s/files/1/0700/8141/3360/files/yoga-brick-lifestyle-1.webp?v=1772885511&width=1000'),
(3, 'Pilates Ball', 2, 'ST001', 'Good', 80, 'https://contents.mediadecathlon.com/p3067465/k$ebc9793bcd6ee90c724d45b7bb344dc4/900-g-weighted-pilates-ball-brown-domyos-8975529.jpg?f=1920x0&format=auto'),
(4, 'Pilates Ring', 2, 'ST001', 'Good', 100, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRIdM_7eNVmuMrCfQtUrS_5658U_O3ii07Umpn4eesQ5bFk1QL5mABWCro&s=10'),
(5, 'Boxing Gloves', 3, 'ST002', 'Good', 120, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKjp1FY6k2x0eKZfeIA_dhWtubgZJhq3u4mSyENJVa4W0tMiARcsNY-Vk&s=10'),
(6, 'Boxing Wraps', 3, 'ST002', 'Good', 60, 'https://www.ringside.com/media/catalog/product/cache/0ee050c3ffc3555709b9bb6062f4d7e9/m/h/mhw_v5.webp'),
(7, 'Badminton Racket', 4, 'ST002', 'Good', 90, 'https://cdn11.bigcommerce.com/s-nehqfptb/images/stencil/1280x1280/products/42216/82626/Raven-DONE__98056.1732044847.jpg?c=2'),
(8, 'Shuttlecock', 4, 'ST002', 'Good', 20, 'https://us.yonex.com/cdn/shop/collections/LG7_N_A_0933.jpg?v=1740017753');

-- ============================
-- 8. Trainer (จาก data.js)
-- ============================
INSERT INTO TRAINER (TrainerID, Name, Phone, SportTypeID, StudioCode, Qualification, ImageURL, HireDate, Position, Salary, Age) VALUES
(1, 'Coach Mali', '081-111-1111', 1, 'ST001', 'Certified Yoga Instructor', 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400', '2024-01-15', 'Senior Trainer', 45000, 31),
(2, 'Coach Ploy', '082-222-2222', 2, 'ST001', 'Pilates Master Trainer', 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400', '2024-03-15', 'Trainer', 38000, 28),
(3, 'Coach Fah', '083-333-3333', 3, 'ST002', 'Professional Boxing Coach', 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400', '2023-08-01', 'Senior Trainer', 48000, 34),
(4, 'Coach Nam', '084-444-4444', 4, 'ST002', 'Badminton National Coach', 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400', '2025-01-20', 'Trainer', 35000, 27);

-- ============================
-- 9. Course (จาก data.js)
-- ============================
INSERT INTO COURSE (CourseID, Title, Level, DurationHours, StandardFee, SportTypeID, StudioCode, RoomID, TrainerID, PrerequisiteCourseID, ImageURL) VALUES
(1, 'Basic Yoga', 'Beginner', 10, 1500, 1, 'ST001', 1, 1, NULL, 'https://yogadesignlab.com/cdn/shop/articles/yoga_design_lab_small_group_easy_seat_pose_5c878a0d-fff0-41dd-8e77-a6e5e0000567.webp?v=1790467490&width=1400'),
(2, 'Advanced Yoga', 'Advanced', 15, 2500, 1, 'ST001', 1, 1, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYEA1aWsFKwzUUa-BXmztEbD7CFSUCsk_d7a-UR2avsydNTFluTib4ZJE&s=10'),
(3, 'Pilates Intro', 'Beginner', 8, 1200, 2, 'ST001', 2, 2, NULL, 'https://www.theglobeandmail.com/resizer/v2/OPSNENUCHJCBNA42EFNMQG5GOI.jpg?auth=2f0966c784232bb248a759ddd9d65361523b7e03e2f962be477ce97e6b4f41a5&width=600&height=400&quality=80&smart=true'),
(4, 'Women Boxing', 'Intermediate', 12, 2000, 3, 'ST002', 3, 3, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSztNMgR2wBQ9w6VeE95xAAXqy-CWHqJif9Tfnl8hAbNwov72SrcLLBio6d&s=10');

-- ============================
-- 10. Course Prerequisite
-- ============================
INSERT INTO COURSE_PREREQUISITE (CourseID, PrerequisiteCourseID) VALUES
(2, 1);

-- ============================
-- 11. Trainer Course
-- ============================
INSERT INTO TRAINER_COURSE (TrainerID, CourseID, AssignedDate, TeachingRole) VALUES
(1, 1, '2026-01-05', 'Main Trainer'),
(1, 2, '2026-01-05', 'Main Trainer'),
(2, 3, '2026-01-05', 'Main Trainer'),
(3, 4, '2026-01-05', 'Main Trainer');

-- ============================
-- 12. SITE_SETTING
-- ============================
INSERT INTO SITE_SETTING (SettingKey, SettingValue) VALUES
('points_per_hour', '30'),
('points_per_trainer', '50'),
('points_per_equipment', '20'),
('points_per_capacity', '2');