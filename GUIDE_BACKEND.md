# 🚀 Guide for Backend Team — SheSparks Wellness

## 📋 ภาพรวม

Frontend ใช้ **Mock Data** ไปก่อน  
Backend ต้องทำ **API** ให้ Frontend เรียกใช้  
เมื่อ API พร้อม → Frontend เปลี่ยนจาก Mock → `fetch()`

---

## 📦 Database Schema (ที่ต้องเพิ่ม)

### 1. เพิ่มคอลัมน์ ImageURL

```sql
ALTER TABLE STUDIO ADD COLUMN ImageURL VARCHAR(255);
ALTER TABLE SPORT_TYPE ADD COLUMN ImageURL VARCHAR(255);
ALTER TABLE ROOM ADD COLUMN ImageURL VARCHAR(255);
ALTER TABLE COURSE ADD COLUMN ImageURL VARCHAR(255);
ALTER TABLE TRAINER ADD COLUMN ImageURL VARCHAR(255);
ALTER TABLE EQUIPMENT ADD COLUMN ImageURL VARCHAR(255);
ALTER TABLE REWARD_ITEM ADD COLUMN ImageURL VARCHAR(255);
```

### 2. เพิ่มคอลัมน์ StudioCode ใน TRAINER

```sql
ALTER TABLE TRAINER ADD COLUMN StudioCode VARCHAR(10);
ALTER TABLE TRAINER ADD CONSTRAINT fk_trainer_studio
  FOREIGN KEY (StudioCode) REFERENCES STUDIO(StudioCode);
```

### 3. ตาราง SiteSetting (สำหรับ Recommend + Loyalty Points)

```sql
CREATE TABLE SITE_SETTING (
  SettingID INT PRIMARY KEY AUTO_INCREMENT,
  SettingKey VARCHAR(50) UNIQUE,
  SettingValue VARCHAR(255),
  UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO SITE_SETTING (SettingKey, SettingValue) VALUES
('recommend_studios', 'true'),
('recommend_sports', 'true'),
('recommend_courses', 'true'),
('recommend_rewards', 'true'),
('points_per_hour', '30'),
('points_per_trainer', '50'),
('points_per_equipment', '20'),
('points_per_baht', '1');
```

---

## 📦 API Endpoints ที่ต้องทำ

### 🔹 1. Authentication (ไม่ต้องทำ — Out of Scope)

**ใช้ Hardcode ต่อไป** — Frontend ใช้ `localStorage.user`

---

### 🔹 2. CRUD ทุก Entity

**Pattern เดียวกันทุก Entity:**

| Method | Endpoint | คำอธิบาย |
| :--- | :--- | :--- |
| GET | `/api/studios` | ดึงทั้งหมด |
| GET | `/api/studios/:code` | ดึงตัวเดียว |
| POST | `/api/studios` | เพิ่ม |
| PUT | `/api/studios/:code` | แก้ไข |
| DELETE | `/api/studios/:code` | ลบ |

**Entities ที่ต้องทำ:**
- `studios` (PK: StudioCode)
- `sports` (PK: SportTypeID)
- `rooms` (PK: RoomID)
- `courses` (PK: CourseID)
- `trainers` (PK: TrainerID)
- `equipments` (PK: EquipmentID)
- `rewards` (PK: RewardID)

---

### 🔹 3. ตาราง Bridge Tables

**ต้องทำ CRUD สำหรับ:**
- `studio_sport_types` (StudioCode + SportTypeID)
- `course_prerequisites` (CourseID + PrerequisiteCourseID)

**ตัวอย่าง:**
```javascript
// GET /api/studios/:code/sports
app.get('/api/studios/:code/sports', async (req, res) => {
  const sports = await query(`
    SELECT s.* FROM SPORT_TYPE s
    JOIN STUDIO_SPORT_TYPE sst ON sst.SportTypeID = s.SportTypeID
    WHERE sst.StudioCode = ?
  `, [req.params.code]);
  res.json(sports);
});
```

---

### 🔹 4. Booking + Loyalty Points

**API:**
```javascript
// POST /api/bookings
app.post('/api/bookings', async (req, res) => {
  try {
    const { MemberID, RoomID, Date, StartTime, EndTime, Capacity } = req.body;

    // 1. ตรวจสอบการทับซ้อน
    const overlap = await query(`
      SELECT BookingID FROM BOOKING
      WHERE RoomID = ? AND BookingDate = ?
      AND StartTime < ? AND EndTime > ?
    `, [RoomID, Date, EndTime, StartTime]);

    if (overlap.length > 0) {
      return res.status(409).json({ message: 'ห้องถูกจองแล้ว' });
    }

    // 2. INSERT Booking
    const result = await query(`
      INSERT INTO BOOKING (BookingDate, StartTime, EndTime, MemberID, RoomID)
      VALUES (?, ?, ?, ?, ?)
    `, [Date, StartTime, EndTime, MemberID, RoomID]);

    // 3. คำนวณ Loyalty Points
    const points = calculatePoints(Date, StartTime, EndTime, Capacity);

    // 4. INSERT Payment + PointTransaction
    const payment = await query(`
      INSERT INTO PAYMENT (Amount, PaymentDate, PaymentMethod, BookingID)
      VALUES (?, ?, 'Cash', ?)
    `, [Capacity * 100, Date, result.insertId]);

    await query(`
      INSERT INTO POINT_TRANSACTION (PointsEarned, PointsRedeemed, Date, PaymentID)
      VALUES (?, 0, ?, ?)
    `, [points, Date, payment.insertId]);

    res.status(201).json({
      message: 'จองสำเร็จ',
      BookingID: result.insertId,
      PointsEarned: points
    });
  } catch (e) {
    sendDbError(res, e);
  }
});
```

---

### 🔹 5. Reports (3 ตัว)

#### Report 1: Available Rooms
```javascript
// GET /api/reports/availability?date=&start=&end=
app.get('/api/reports/availability', async (req, res) => {
  const { date, start, end } = req.query;

  const rooms = await query(`
    SELECT r.*, s.Name AS StudioName
    FROM ROOM r
    JOIN STUDIO s ON s.StudioCode = r.StudioCode
    WHERE r.RoomID NOT IN (
      SELECT b.RoomID FROM BOOKING b
      WHERE b.BookingDate = ?
      AND b.StartTime < ? AND b.EndTime > ?
    )
  `, [date, end, start]);

  const equipment = await query(`
    SELECT e.*, st.SportName
    FROM EQUIPMENT e
    JOIN SPORT_TYPE st ON st.SportTypeID = e.SportTypeID
    WHERE e.Condition NOT IN ('Damaged', 'Maintenance')
    AND e.EquipmentID NOT IN (
      SELECT be.EquipmentID FROM BOOKING_EQUIPMENT be
      JOIN BOOKING b ON b.BookingID = be.BookingID
      WHERE b.BookingDate = ?
      AND b.StartTime < ? AND b.EndTime > ?
    )
  `, [date, end, start]);

  const trainers = await query(`
    SELECT t.*, st.SportName
    FROM TRAINER t
    JOIN SPORT_TYPE st ON st.SportTypeID = t.SportTypeID
    WHERE t.TrainerID NOT IN (
      SELECT bt.TrainerID FROM BOOKING_TRAINER bt
      JOIN BOOKING b ON b.BookingID = bt.BookingID
      WHERE b.BookingDate = ?
      AND b.StartTime < ? AND b.EndTime > ?
    )
  `, [date, end, start]);

  res.json({ rooms, equipment, trainers });
});
```

#### Report 2: Member Points
```javascript
// GET /api/reports/member-points
app.get('/api/reports/member-points', async (req, res) => {
  const members = await query(`
    SELECT m.MemberID, m.Name,
           COALESCE(SUM(pt.PointsEarned), 0) AS TotalEarned,
           COALESCE(SUM(pt.PointsRedeemed), 0) AS TotalRedeemed,
           COALESCE(SUM(pt.PointsEarned - pt.PointsRedeemed), 0) AS Balance
    FROM MEMBER m
    LEFT JOIN BOOKING b ON b.MemberID = m.MemberID
    LEFT JOIN PAYMENT p ON p.BookingID = b.BookingID
    LEFT JOIN POINT_TRANSACTION pt ON pt.PaymentID = p.PaymentID
    GROUP BY m.MemberID
    ORDER BY Balance DESC
  `);

  res.json(members);
});
```

#### Report 3: Popular Courses
```javascript
// GET /api/reports/course-performance
app.get('/api/reports/course-performance', async (req, res) => {
  const courses = await query(`
    SELECT c.CourseID, c.Title,
           COUNT(e.MemberID) AS Enrollments,
           SUM(CASE WHEN e.PaymentStatus='Paid' THEN c.StandardFee ELSE 0 END) AS Revenue
    FROM COURSE c
    LEFT JOIN ENROLLMENT e ON e.CourseID = c.CourseID
    GROUP BY c.CourseID
    ORDER BY Enrollments DESC
  `);

  res.json(courses);
});
```

---

### 🔹 6. SiteSetting (Recommend + Loyalty Points)

```javascript
// GET /api/settings
app.get('/api/settings', async (req, res) => {
  const settings = await query('SELECT * FROM SITE_SETTING');
  const result = {};
  settings.forEach(s => result[s.SettingKey] = s.SettingValue);
  res.json(result);
});

// PUT /api/settings
app.put('/api/settings', async (req, res) => {
  const updates = req.body;
  for (const [key, value] of Object.entries(updates)) {
    await query(`
      INSERT INTO SITE_SETTING (SettingKey, SettingValue)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE SettingValue = ?
    `, [key, value, value]);
  }
  res.json({ message: 'Settings saved' });
});
```

---

## 📋 Checklist สำหรับ Backend Team

### Database
- [ ] เพิ่ม `ImageURL` 7 ตาราง
- [ ] เพิ่ม `StudioCode` ใน `TRAINER`
- [ ] สร้างตาราง `SITE_SETTING`
- [ ] เพิ่มข้อมูลตัวอย่าง 20+ แถวต่อตาราง
- [ ] ทดสอบ Query ใน DBever

### Backend API
- [ ] CRUD 7 Entities
- [ ] CRUD 2 Bridge Tables
- [ ] API `/api/bookings` (พร้อม Loyalty Points)
- [ ] API Reports 3 ตัว
- [ ] API `/api/settings`
- [ ] ทดสอบด้วย Postman
- [ ] ส่ง Postman Collection กลับมา

---

## 🔄 เมื่อ Backend พร้อม — Frontend จะเปลี่ยน

**จาก Mock:**
```javascript
const data = STUDIOS;
```

**เปลี่ยนเป็น:**
```javascript
const res = await fetch('http://localhost:3000/api/studios');
const data = await res.json();
```

---

## 📞 ติดต่อ Frontend Team

- **Frontend Lead:** Many
- **ส่ง Postman Collection** กลับมาเมื่อเสร็จ
- **ส่ง API Spec** (URL + Request + Response)

---

## ⚠️ ปัญหาที่อาจเกิดเวลาทำพร้อมกัน

### 1. **Path ไม่ตรงกัน**
- Frontend ใช้ `/api/studios` (relative)
- Backend ใช้ `http://localhost:3000/api/studios` (absolute)
- **วิธีแก้:** ใช้ `API_URL` constant ใน `api.js`

### 2. **Response Format ไม่ตรงกัน**
- Frontend คาดหวัง `[{...}]`
- Backend ส่ง `{data: [...]}`
- **วิธีแก้:** ตกลง Format ก่อน — แนะนำ `[{...}]` ตรงๆ

### 3. **CORS Error**
- Frontend รันที่ `:5501`
- Backend รันที่ `:3000`
- **วิธีแก้:** Backend ต้องมี `app.use(cors())`

### 4. **Database Schema เปลี่ยน**
- Frontend ใช้ `SportType` (string)
- Backend ใช้ `SportTypeID` (number)
- **วิธีแก้:** ใช้ Helper Functions (`getSportName()`)

### 5. **Image URL format**
- Frontend ใช้ URL จาก Unsplash
- Backend เก็บเป็น `VARCHAR(255)`
- **วิธีแก้:** ใช้ URL format เดียวกัน

### 6. **การทับซ้อนของ Booking**
- Frontend ตรวจสอบจาก `localStorage.bookings`
- Backend ตรวจสอบจาก Database
- **วิธีแก้:** Backend ต้อง Return Error 409 ถ้าทับซ้อน

### 7. **Loyalty Points ไม่ตรงกัน**
- Frontend คำนวณเอง
- Backend คำนวณจาก DB
- **วิธีแก้:** Backend เป็น Source of Truth

---

## 📌 สรุป

**Backend Team ทำงาน 5-7 วัน** → Frontend เชื่อม API 2-3 วัน

**ส่ง Guide นี้ให้เพื่อนได้เลย!** 😊