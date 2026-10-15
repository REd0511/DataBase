-- ============================================
-- Drop + Create Database
-- ============================================
DROP DATABASE IF EXISTS shesparks;
CREATE DATABASE shesparks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shesparks;

-- ============================================
-- Create Tables (Schema)
-- ============================================

CREATE TABLE STUDIO (
    StudioCode VARCHAR(10) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Location VARCHAR(200) NOT NULL,
    Capacity INT NOT NULL CHECK (Capacity > 0),
    NumberOfRooms INT DEFAULT 0,
    ImageURL VARCHAR(500)
);

CREATE TABLE SPORT_TYPE (
    SportTypeID INT PRIMARY KEY AUTO_INCREMENT,
    SportName VARCHAR(50) NOT NULL UNIQUE,
    IntensityLevel VARCHAR(20),
    ImageURL VARCHAR(500)
);

CREATE TABLE QUALIFICATION (
    QualID INT PRIMARY KEY AUTO_INCREMENT,
    QualName VARCHAR(100) NOT NULL,
    IssuedBy VARCHAR(100)
);

CREATE TABLE REWARD_ITEM (
    RewardID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    PointCost INT NOT NULL CHECK (PointCost > 0),
    Value DECIMAL(10,2) DEFAULT 0,
    Category ENUM('Beauty', 'Sports', 'Discount') NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    ImageURL VARCHAR(500)
);

CREATE TABLE SITE_SETTING (
    SettingID INT PRIMARY KEY AUTO_INCREMENT,
    SettingKey VARCHAR(50) UNIQUE,
    SettingValue VARCHAR(255),
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE MEMBER (
    MemberID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(20) UNIQUE NOT NULL,
    DOB DATE,
    MemberLevel ENUM('Silver', 'Gold', 'Platinum') DEFAULT 'Silver',
    Email VARCHAR(100),
    StudioCode VARCHAR(10) NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (StudioCode) REFERENCES STUDIO(StudioCode)
);

CREATE TABLE TRAINER (
    TrainerID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(20) UNIQUE,
    HireDate DATE,
    Position VARCHAR(60),
    StudioCode VARCHAR(10),
    SportTypeID INT,
    IsActive BOOLEAN DEFAULT TRUE,
    ImageURL VARCHAR(500),
    FOREIGN KEY (StudioCode) REFERENCES STUDIO(StudioCode),
    FOREIGN KEY (SportTypeID) REFERENCES SPORT_TYPE(SportTypeID)
);

CREATE TABLE USER_ACCOUNT (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('MEMBER', 'TRAINER', 'STUDIO_MANAGER', 'ADMIN') NOT NULL,
    TrainerID INT UNIQUE,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TrainerID) REFERENCES TRAINER(TrainerID) ON DELETE SET NULL
);

CREATE TABLE ROOM (
    RoomID INT PRIMARY KEY AUTO_INCREMENT,
    RoomName VARCHAR(100) NOT NULL,
    Capacity INT NOT NULL CHECK (Capacity > 0),
    StudioCode VARCHAR(10) NOT NULL,
    SportTypeID INT,
    HourlyRate DECIMAL(10,2) NOT NULL DEFAULT 200.00 CHECK (HourlyRate >= 0),
    TrainerRate DECIMAL(10,2) NOT NULL DEFAULT 500.00 CHECK (TrainerRate >= 0),
    IsActive BOOLEAN DEFAULT TRUE,
    ImageURL VARCHAR(500),
    FOREIGN KEY (StudioCode) REFERENCES STUDIO(StudioCode),
    FOREIGN KEY (SportTypeID) REFERENCES SPORT_TYPE(SportTypeID)
);

CREATE TABLE EQUIPMENT (
    EquipmentID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    ConditionStatus ENUM('GOOD', 'MAINTENANCE', 'DAMAGED') DEFAULT 'GOOD',
    LateFee DECIMAL(8,2) DEFAULT 0 CHECK (LateFee >= 0),
    SportTypeID INT,
    StudioCode VARCHAR(10),
    IsAvailable BOOLEAN DEFAULT TRUE,
    ImageURL VARCHAR(500),
    FOREIGN KEY (SportTypeID) REFERENCES SPORT_TYPE(SportTypeID),
    FOREIGN KEY (StudioCode) REFERENCES STUDIO(StudioCode)
);

CREATE TABLE COURSE (
    CourseID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(100) NOT NULL,
    Level VARCHAR(30),
    DurationHours DECIMAL(4,1) NOT NULL CHECK (DurationHours > 0),
    StandardFee DECIMAL(10,2) NOT NULL CHECK (StandardFee >= 0),
    SportTypeID INT NOT NULL,
    StudioCode VARCHAR(10),
    RoomID INT,
    TrainerID INT,
    ImageURL VARCHAR(500),
    FOREIGN KEY (SportTypeID) REFERENCES SPORT_TYPE(SportTypeID),
    FOREIGN KEY (StudioCode) REFERENCES STUDIO(StudioCode),
    FOREIGN KEY (RoomID) REFERENCES ROOM(RoomID),
    FOREIGN KEY (TrainerID) REFERENCES TRAINER(TrainerID)
);

CREATE TABLE TRAINER_SCHEDULE (
    ScheduleID INT PRIMARY KEY AUTO_INCREMENT,
    TrainerID INT NOT NULL,
    WorkDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    ScheduleStatus ENUM('AVAILABLE', 'UNAVAILABLE') DEFAULT 'AVAILABLE',
    FOREIGN KEY (TrainerID) REFERENCES TRAINER(TrainerID)
);

CREATE TABLE BOOKING (
    BookingID INT PRIMARY KEY AUTO_INCREMENT,
    BookingDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    Status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    MemberID INT NOT NULL,
    RoomID INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MemberID) REFERENCES MEMBER(MemberID),
    FOREIGN KEY (RoomID) REFERENCES ROOM(RoomID)
);

CREATE TABLE REDEMPTION (
    RedemptionID INT PRIMARY KEY AUTO_INCREMENT,
    MemberID INT NOT NULL,
    RewardID INT NOT NULL,
    RedemptionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    PointsUsed INT NOT NULL CHECK (PointsUsed > 0),
    Status ENUM('REQUESTED', 'APPROVED', 'FULFILLED', 'CANCELLED') DEFAULT 'REQUESTED',
    FOREIGN KEY (MemberID) REFERENCES MEMBER(MemberID),
    FOREIGN KEY (RewardID) REFERENCES REWARD_ITEM(RewardID)
);

CREATE TABLE ENROLLMENT (
    EnrollmentID INT PRIMARY KEY AUTO_INCREMENT,
    MemberID INT NOT NULL,
    CourseID INT NOT NULL,
    EnrollmentDate DATE NOT NULL,
    PaymentStatus ENUM('UNPAID', 'PAID', 'CANCELLED') DEFAULT 'UNPAID',
    UNIQUE KEY unique_member_course (MemberID, CourseID),
    FOREIGN KEY (MemberID) REFERENCES MEMBER(MemberID),
    FOREIGN KEY (CourseID) REFERENCES COURSE(CourseID)
);

CREATE TABLE PAYMENT (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    Amount DECIMAL(10,2) NOT NULL CHECK (Amount >= 0),
    PaymentDate DATETIME,
    PaymentMethod VARCHAR(30),
    PaymentStatus ENUM('UNPAID', 'PAID', 'REFUNDED') DEFAULT 'UNPAID',
    BookingID INT NULL,
    RedemptionID INT NULL,
    EnrollmentID INT NULL,
    FOREIGN KEY (BookingID) REFERENCES BOOKING(BookingID),
    FOREIGN KEY (RedemptionID) REFERENCES REDEMPTION(RedemptionID),
    FOREIGN KEY (EnrollmentID) REFERENCES ENROLLMENT(EnrollmentID)
);

CREATE TABLE POINT_TRANSACTION (
    TransactionID INT PRIMARY KEY AUTO_INCREMENT,
    MemberID INT NOT NULL,
    PaymentID INT NOT NULL,
    TransactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    PointsChange INT NOT NULL,
    Reason VARCHAR(40) NOT NULL,
    FOREIGN KEY (MemberID) REFERENCES MEMBER(MemberID),
    FOREIGN KEY (PaymentID) REFERENCES PAYMENT(PaymentID)
);

CREATE TABLE COURSE_PREREQUISITE (
    CourseID INT,
    PrerequisiteCourseID INT,
    PRIMARY KEY (CourseID, PrerequisiteCourseID),
    FOREIGN KEY (CourseID) REFERENCES COURSE(CourseID),
    FOREIGN KEY (PrerequisiteCourseID) REFERENCES COURSE(CourseID)
);

CREATE TABLE BOOKING_EQUIPMENT (
    BookingID INT,
    EquipmentID INT,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    ReturnStatus ENUM('NOT_ISSUED', 'ISSUED', 'RETURNED', 'LATE') DEFAULT 'NOT_ISSUED',
    PRIMARY KEY (BookingID, EquipmentID),
    FOREIGN KEY (BookingID) REFERENCES BOOKING(BookingID),
    FOREIGN KEY (EquipmentID) REFERENCES EQUIPMENT(EquipmentID)
);

CREATE TABLE BOOKING_TRAINER (
    BookingID INT,
    TrainerID INT,
    TrainerRole VARCHAR(50),
    HourlyRateAtBooking DECIMAL(8,2),
    PRIMARY KEY (BookingID, TrainerID),
    FOREIGN KEY (BookingID) REFERENCES BOOKING(BookingID),
    FOREIGN KEY (TrainerID) REFERENCES TRAINER(TrainerID)
);

CREATE TABLE TRAINER_QUALIFICATION (
    TrainerID INT,
    QualID INT,
    DateObtained DATE,
    ExpiryDate DATE,
    PRIMARY KEY (TrainerID, QualID),
    FOREIGN KEY (TrainerID) REFERENCES TRAINER(TrainerID),
    FOREIGN KEY (QualID) REFERENCES QUALIFICATION(QualID)
);

CREATE TABLE TRAINER_COURSE (
    TrainerID INT,
    CourseID INT,
    AssignedDate DATE NOT NULL,
    TeachingRole VARCHAR(50),
    PRIMARY KEY (TrainerID, CourseID),
    FOREIGN KEY (TrainerID) REFERENCES TRAINER(TrainerID),
    FOREIGN KEY (CourseID) REFERENCES COURSE(CourseID)
);

CREATE TABLE STUDIO_SPORT_TYPE (
    StudioCode VARCHAR(10),
    SportTypeID INT,
    PRIMARY KEY (StudioCode, SportTypeID),
    FOREIGN KEY (StudioCode) REFERENCES STUDIO(StudioCode),
    FOREIGN KEY (SportTypeID) REFERENCES SPORT_TYPE(SportTypeID)
);

-- ============================================
-- STEP 3: Seed Master Data
-- ============================================

-- 1. STUDIO
INSERT INTO STUDIO (StudioCode, Name, Location, Capacity, NumberOfRooms, ImageURL) VALUES
('ST001', 'SheSparks Nimman', 'Nimman, Chiang Mai', 50, 3, 'https://sponsoredworkpermit.com/wp-content/uploads/2025/09/6385c11e3fff88628f36e7eb_SWP-blog-image.jpg'),
('ST002', 'SheSparks Old City', 'Old City, Chiang Mai', 40, 2, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYOL7TtMv4uEkirUH0yoSsp8uVU5FuQzNl8uFymQh7KxgAk6r68PPwMgo&s=10'),
('ST003', 'SheSparks Riverside', 'Riverside, Chiang Mai', 60, 3, 'https://thechiangmai.com/riverside/wp-content/uploads/2023/10/Live-the-Suite-Life.jpg');

-- 2. SPORT_TYPE
INSERT INTO SPORT_TYPE (SportTypeID, SportName, IntensityLevel, ImageURL) VALUES
(1, 'Yoga', 'Low', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),
(2, 'Pilates', 'Medium', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400'),
(3, 'Boxing', 'High', 'https://www.lecercle-boxing.com/wp-content/uploads/2024/10/allonge-boxe-cover.jpg'),
(4, 'Badminton', 'Medium', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400');

-- 3. STUDIO_SPORT_TYPE
INSERT INTO STUDIO_SPORT_TYPE (StudioCode, SportTypeID) VALUES
('ST001', 1), ('ST001', 2),
('ST002', 3), ('ST002', 4),
('ST003', 1), ('ST003', 3), ('ST003', 2);

-- 4. MEMBER
INSERT INTO MEMBER (MemberID, Name, Phone, DOB, MemberLevel, Email, StudioCode, CreatedAt) VALUES
(1, 'Jane Doe', '081-234-5678', '1995-05-15', 'Silver', 'jane@shesparks.com', 'ST001', NOW()),
(2, 'Sarah Smith', '081-234-5679', '1990-01-01', 'Platinum', 'sarah@shesparks.com', 'ST001', NOW());

-- 5. TRAINER
INSERT INTO TRAINER (TrainerID, Name, Phone, HireDate, Position, StudioCode, SportTypeID, ImageURL) VALUES
(1, 'Coach Mali', '081-111-1111', '2024-01-15', 'Senior Trainer', 'ST001', 1, 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400'),
(2, 'Coach Ploy', '082-222-2222', '2024-03-15', 'Trainer', 'ST001', 2, 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400'),
(3, 'Coach Fah', '083-333-3333', '2023-08-01', 'Senior Trainer', 'ST002', 3, 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400');

-- 6. USER_ACCOUNT
INSERT INTO USER_ACCOUNT (Username, PasswordHash, Role, TrainerID) VALUES
('admin01', 'hashed_pwd_123', 'ADMIN', NULL),
('manager_nimman', 'hashed_pwd_123', 'STUDIO_MANAGER', NULL),
('trainer_mali', 'hashed_pwd_123', 'TRAINER', 1),
('member_jane', 'hashed_pwd_123', 'MEMBER', NULL);

-- 7. REWARD_ITEM
INSERT INTO REWARD_ITEM (RewardID, Name, PointCost, Value, Category, ImageURL) VALUES
(1, 'Spa Voucher 500 THB', 500, 500.00, 'Beauty', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400'),
(2, 'Yoga Mat', 800, 800.00, 'Sports', 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400'),
(3, '10% Massage Discount', 100, 100.00, 'Discount', 'https://images.gowabi.com/pictures/images/000/194/101/big_slider_pic/58.png?1752746788');

-- 8. ROOM
INSERT INTO ROOM (RoomID, RoomName, Capacity, StudioCode, SportTypeID, HourlyRate, TrainerRate, ImageURL) VALUES
(1, 'Yoga Room A', 20, 'ST001', 1, 300.00, 500.00, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/f3/71/95/yoga-studio-on-6th-floor.jpg?w=1200&h=1200&s=1'),
(2, 'Pilates Room B', 15, 'ST001', 2, 350.00, 500.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcFdpjDVDQMtEqvSlfb8WhliMusPHTfxLqybpgnLrfroHdDglf0TzB6of5&s=10'),
(3, 'Boxing Ring C', 10, 'ST002', 3, 400.00, 600.00, 'https://www.protecboxing.com/wp-content/uploads/2023/10/IMG_8300-scaled.webp');

-- 9. EQUIPMENT
INSERT INTO EQUIPMENT (EquipmentID, Name, ConditionStatus, LateFee, SportTypeID, StudioCode, ImageURL) VALUES
(1, 'Yoga Mat Pro', 'GOOD', 50.00, 1, 'ST001', 'https://mandukathailand.com/cdn/shop/files/111011Z30-Mats-PRO71-VERVE-02_c20a6342-8663-4436-8441-093cfd3d0f5d_1080x.jpg?v=1738237472'),
(2, 'Pilates Ball', 'GOOD', 80.00, 2, 'ST001', 'https://contents.mediadecathlon.com/p3067465/k$ebc9793bcd6ee90c724d45b7bb344dc4/900-g-weighted-pilates-ball-brown-domyos-8975529.jpg?f=1920x0&format=auto'),
(3, 'Boxing Gloves', 'MAINTENANCE', 120.00, 3, 'ST002', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKjp1FY6k2x0eKZfeIA_dhWtubgZJhq3u4mSyENJVa4W0tMiARcsNY-Vk&s=10');

-- 10. QUALIFICATION
INSERT INTO QUALIFICATION (QualID, QualName, IssuedBy) VALUES
(1, 'Certified Yoga Instructor', 'Yoga Alliance'),
(2, 'Pilates Master Trainer', 'Pilates Method Alliance');

INSERT INTO TRAINER_QUALIFICATION (TrainerID, QualID, DateObtained, ExpiryDate) VALUES
(1, 1, '2020-05-10', '2027-05-10'),
(2, 2, '2021-08-15', '2028-08-15');

-- 11. COURSE
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

-- 12. TRAINER_SCHEDULE
INSERT INTO TRAINER_SCHEDULE (TrainerID, WorkDate, StartTime, EndTime, ScheduleStatus) VALUES
(1, CURDATE(), '09:00:00', '12:00:00', 'AVAILABLE'),
(2, CURDATE(), '13:00:00', '16:00:00', 'AVAILABLE');

-- 13. SITE_SETTING
INSERT INTO SITE_SETTING (SettingKey, SettingValue) VALUES
('points_per_baht', '1'),
('max_booking_days_advance', '30');

-- 14. COURSE_PREREQUISITE
INSERT INTO COURSE_PREREQUISITE (CourseID, PrerequisiteCourseID) VALUES
(3, 1),
(4, 3);
