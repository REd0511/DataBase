-- ใช้ Database
USE shesparks;

-- ============================
-- 1. ตาราง Master (ไม่มี FK)
-- ============================

CREATE TABLE MEMBER (
    MemberID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(20) UNIQUE NOT NULL,
    DOB DATE,
    MemberLevel ENUM('Silver','Gold','Platinum') DEFAULT 'Silver'
);

CREATE TABLE STUDIO (
    StudioCode INT PRIMARY KEY AUTO_INCREMENT,
    Location VARCHAR(200),
    Capacity INT
);

CREATE TABLE SPORT_TYPE (
    SportTypeID INT PRIMARY KEY AUTO_INCREMENT,
    SportName VARCHAR(50) NOT NULL,
    IntensityLevel VARCHAR(20)
);

CREATE TABLE QUALIFICATION (
    QualID INT PRIMARY KEY AUTO_INCREMENT,
    QualName VARCHAR(100),
    IssuedBy VARCHAR(100)
);

CREATE TABLE REWARD_ITEM (
    RewardID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    PointCost INT NOT NULL,
    Category ENUM('Beauty','Sports','Discount') NOT NULL
);

-- ============================
-- 2. ตารางที่มี FK ชั้นที่ 1
-- ============================

CREATE TABLE ROOM (
    RoomID INT PRIMARY KEY AUTO_INCREMENT,
    RoomName VARCHAR(100),
    Capacity INT CHECK (Capacity > 0),
    StudioCode INT,
    FOREIGN KEY (StudioCode) REFERENCES STUDIO(StudioCode)
);

CREATE TABLE EQUIPMENT (
    EquipmentID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100),
    `Condition` VARCHAR(50),
    LateFee DECIMAL(10,2),
    SportTypeID INT,
    FOREIGN KEY (SportTypeID) REFERENCES SPORT_TYPE(SportTypeID)
);

CREATE TABLE TRAINER (
    TrainerID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(20),
    HireDate DATE,
    Position VARCHAR(50),
    Salary DECIMAL(10,2),
    Age INT,
    StudioCode INT,
    SportTypeID INT,
    FOREIGN KEY (StudioCode) REFERENCES STUDIO(StudioCode),
    FOREIGN KEY (SportTypeID) REFERENCES SPORT_TYPE(SportTypeID)
);

CREATE TABLE COURSE (
    CourseID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(100) NOT NULL,
    Level VARCHAR(20),
    DurationHours INT,
    StandardFee DECIMAL(10,2),
    SportTypeID INT,
    FOREIGN KEY (SportTypeID) REFERENCES SPORT_TYPE(SportTypeID)
);