-- ============================================
-- SheSparks Wellness - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS shesparks;
USE shesparks;

-- ============================
--  MASTER TABLES
-- ============================

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

-- ============================
-- ENTITY TABLES
-- ============================

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

-- ============================
-- TRANSACTION TABLES
-- ============================
CREATE TABLE TRAINER_SCHEDULE (
    ScheduleID INT PRIMARY KEY AUTO_INCREMENT,
    TrainerID INT NOT NULL,
    WorkDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    ScheduleStatus ENUM('AVAILABLE', 'UNAVAILABLE') DEFAULT 'AVAILABLE',
    FOREIGN KEY (TrainerID) REFERENCES TRAINER(TrainerID)
);

-- ============================
-- BOOKING
-- ============================
CREATE TABLE BOOKING (
    BookingID INT PRIMARY KEY AUTO_INCREMENT,
    BookingDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    Status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    MemberID INT NOT NULL,
    RoomID INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,   -- ✅ เพิ่ม CreatedAt เก็บเวลาจองจริง
    FOREIGN KEY (MemberID) REFERENCES MEMBER(MemberID),
    FOREIGN KEY (RoomID) REFERENCES ROOM(RoomID)
);

-- ============================
-- REDEMPTION
-- ============================
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

-- ============================
-- ENROLLMENT
-- ============================
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

-- ============================
-- PAYMENT
-- ============================
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

-- ============================
-- POINT_TRANSACTION
-- ============================
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

-- ============================
-- JUNCTION TABLES (M:N)
-- ============================
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