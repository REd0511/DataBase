# 🚀 Guide for Backend Team — SheSparks Wellness

## 📋 ภาพรวม

**สถานะปัจจุบัน:**

- ✅ **Frontend เสร็จ 100%** — มี Fallback (Mock Data)
- ⚠️ **Backend** — ต้องทำ Database + API
- 🎯 **เป้าหมาย** — ให้ Frontend เรียก API จริงได้

**เทคโนโลยี:**

- Database: **MySQL 8**
- Backend: **Node.js + Express**
- Frontend: **HTML + CSS + Vanilla JS**

---

## 📦 ส่วนที่ 1: Database Schema

### 🔹 1.1 ตารางหลัก (13 ตาราง)

**ดูไฟล์:** `database/schema.sql`

**ตารางที่ต้องมี:**

| #   | Table               | PK            | Attributes                                                                                              |
| :-- | :------------------ | :------------ | :------------------------------------------------------------------------------------------------------ |
| 1   | `MEMBER`            | MemberID      | Name, Phone, DOB, MemberLevel, Email, Password, Role, StudioCode                                        |
| 2   | `STUDIO`            | StudioCode    | Name, Location, Capacity, ImageURL                                                                      |
| 3   | `ROOM`              | RoomID        | RoomName, StudioCode, SportTypeID, Capacity, ImageURL                                                   |
| 4   | `SPORT_TYPE`        | SportTypeID   | SportName, IntensityLevel, ImageURL                                                                     |
| 5   | `TRAINER`           | TrainerID     | Name, Phone, SportTypeID, StudioCode, Qualification, ImageURL                                           |
| 6   | `COURSE`            | CourseID      | Title, Level, DurationHours, StandardFee, StudioCode, RoomID, TrainerID, PrerequisiteCourseID, ImageURL |
| 7   | `EQUIPMENT`         | EquipmentID   | Name, SportTypeID, StudioCode, Condition, LateFee, ImageURL                                             |
| 8   | `REWARD_ITEM`       | RewardID      | Name, PointCost, Value, Category, ImageURL                                                              |
| 9   | `BOOKING`           | BookingID     | BookingDate, StartTime, EndTime, MemberID, RoomID, TrainerID, Capacity                                  |
| 10  | `PAYMENT`           | PaymentID     | Amount, PaymentDate, PaymentMethod, BookingID                                                           |
| 11  | `POINT_TRANSACTION` | TransactionID | PointsEarned, PointsRedeemed, Date, PaymentID                                                           |
| 12  | `ENROLLMENT`        | EnrollmentID  | MemberID, CourseID, EnrollmentDate, PaymentStatus                                                       |
| 13  | `REDEMPTION`        | RedemptionID  | MemberID, RewardID, RedemptionDate, PointsUsed                                                          |

### 🔹 1.2 Bridge Tables (8 ตาราง)

| #   | Table                   | Attributes                                     |
| :-- | :---------------------- | :--------------------------------------------- |
| 1   | `STUDIO_SPORT_TYPE`     | StudioCode, SportTypeID                        |
| 2   | `BOOKING_EQUIPMENT`     | BookingID, EquipmentID, Quantity, ReturnStatus |
| 3   | `BOOKING_TRAINER`       | BookingID, TrainerID, TrainerRole              |
| 4   | `TRAINER_QUALIFICATION` | TrainerID, QualID, DateObtained                |
| 5   | `TRAINER_COURSE`        | TrainerID, CourseID, AssignedDate              |
| 6   | `COURSE_PREREQUISITE`   | CourseID, PrerequisiteCourseID                 |
| 7   | `ENROLLMENT`            | MemberID, CourseID                             |
| 8   | `REDEMPTION`            | MemberID, RewardID                             |

### 🔹 1.3 ตารางเพิ่มเติม (Settings)

```sql
CREATE TABLE SITE_SETTING (
  SettingID INT PRIMARY KEY AUTO_INCREMENT,
  SettingKey VARCHAR(50) UNIQUE,
  SettingValue VARCHAR(255),
  UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO SITE_SETTING (SettingKey, SettingValue) VALUES
('points_per_hour', '30'),
('points_per_trainer', '50'),
('points_per_equipment', '20'),
('points_per_capacity', '2');
```

---

## 📦 ส่วนที่ 2: API Endpoints

### 🔹 2.1 Authentication (ไม่ต้องทำ — Out of Scope)

**ใช้ Hardcode ต่อไป** — Frontend ใช้ `localStorage.user`

**Users:**

- `M001 / 1234` → Member
- `A001 / admin` → Admin
- `T001 / trainer` → Trainer
- `S001 / manager` → Manager

### 🔹 2.2 CRUD ทุก Entity (Pattern เดียวกัน)

| Method | Endpoint             | คำอธิบาย    |
| :----- | :------------------- | :---------- |
| GET    | `/api/studios`       | ดึงทั้งหมด  |
| GET    | `/api/studios/:code` | ดึงตัวเดียว |
| POST   | `/api/studios`       | เพิ่ม       |
| PUT    | `/api/studios/:code` | แก้ไข       |
| DELETE | `/api/studios/:code` | ลบ          |

**Entities ที่ต้องทำ:**

- `studios` (PK: StudioCode)
- `sports` (PK: SportTypeID)
- `rooms` (PK: RoomID)
- `courses` (PK: CourseID)
- `trainers` (PK: TrainerID)
- `equipments` (PK: EquipmentID)
- `rewards` (PK: RewardID)
- `members` (PK: MemberID)

### 🔹 2.3 API ที่ Frontend ใช้อยู่แล้ว

**ดูจาก `frontend/js/api.js`:**

```javascript
window.SheSparksAPI = {
  // Members
  members: () => request("/members"),
  member: (id) => request(`/members/${id}`),
  memberPoints: (id) => request(`/members/${id}/points`),

  // Studios / Rooms / Sports
  studios: () => request("/studios"),
  rooms: () => request("/rooms"),
  availableRooms: (date, startTime, endTime) => request(`/rooms/available?...`),
  sports: () => request("/sports"),

  // Trainers
  trainers: () => request("/trainers"),
  availableTrainers: (date, startTime, endTime) =>
    request(`/trainers/available?...`),

  // Courses
  courses: () => request("/courses"),
  enrollCourse: (data) =>
    request("/courses/enroll", { method: "POST", body: JSON.stringify(data) }),

  // Bookings
  bookings: () => request("/bookings"),
  memberBookings: (id) => request(`/bookings/member/${id}`),

  // Payments
  payments: (id) => request(`/payments/member/${id}`),

  // Rewards
  rewards: () => request("/rewards"),
  redeemReward: (data) =>
    request("/rewards/redeem", { method: "POST", body: JSON.stringify(data) }),

  // Reports
  reports: {
    bookings: () => request("/reports/bookings"),
    revenue: () => request("/reports/revenue"),
    courses: () => request("/reports/courses"),
    members: () => request("/reports/members"),
  },
};
```

### 🔹 2.4 ตัวอย่าง API Endpoint ที่ต้องทำ

#### 🔸 Members API

```javascript
// GET /api/members
app.get("/api/members", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM MEMBER ORDER BY MemberID");
    res.json(rows);
  } catch (e) {
    sendDbError(res, e);
  }
});

// GET /api/members/:id
app.get("/api/members/:id", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM MEMBER WHERE MemberID = ?", [
      req.params.id,
    ]);
    if (!rows.length)
      return res.status(404).json({ message: "Member not found" });
    res.json(rows[0]);
  } catch (e) {
    sendDbError(res, e);
  }
});

// GET /api/members/:id/points
app.get("/api/members/:id/points", async (req, res) => {
  try {
    const rows = await query(
      `
      SELECT
        m.MemberID, m.Name,
        COALESCE(SUM(pt.PointsEarned), 0) AS TotalEarned,
        COALESCE(SUM(pt.PointsRedeemed), 0) AS TotalRedeemed,
        COALESCE(SUM(pt.PointsEarned - pt.PointsRedeemed), 0) AS Balance
      FROM MEMBER m
      LEFT JOIN BOOKING b ON b.MemberID = m.MemberID
      LEFT JOIN PAYMENT p ON p.BookingID = b.BookingID
      LEFT JOIN POINT_TRANSACTION pt ON pt.PaymentID = p.PaymentID
      WHERE m.MemberID = ?
      GROUP BY m.MemberID
    `,
      [req.params.id],
    );
    if (!rows.length)
      return res.status(404).json({ message: "Member not found" });
    res.json(rows[0]);
  } catch (e) {
    sendDbError(res, e);
  }
});
```

#### 🔸 Courses API

```javascript
// GET /api/courses
app.get("/api/courses", async (req, res) => {
  try {
    const rows = await query(`
      SELECT c.*, st.SportName
      FROM COURSE c
      LEFT JOIN SPORT_TYPE st ON st.SportTypeID = c.SportTypeID
      ORDER BY c.CourseID
    `);
    res.json(rows);
  } catch (e) {
    sendDbError(res, e);
  }
});

// POST /api/courses/enroll
app.post("/api/courses/enroll", async (req, res) => {
  try {
    const { MemberID, CourseID, EnrollmentDate, PaymentStatus } = req.body;
    if (!MemberID || !CourseID || !EnrollmentDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    await query(
      "INSERT INTO ENROLLMENT (MemberID, CourseID, EnrollmentDate, PaymentStatus) VALUES (?, ?, ?, ?)",
      [MemberID, CourseID, EnrollmentDate, PaymentStatus || "Pending"],
    );
    res.status(201).json({ message: "Enrolled successfully" });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Already enrolled" });
    }
    sendDbError(res, e);
  }
});
```

#### 🔸 Rewards API

```javascript
// GET /api/rewards
app.get("/api/rewards", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM REWARD_ITEM ORDER BY PointCost");
    res.json(rows);
  } catch (e) {
    sendDbError(res, e);
  }
});

// POST /api/rewards/redeem
app.post("/api/rewards/redeem", async (req, res) => {
  const conn = await db.promise().getConnection();
  try {
    const { MemberID, RewardID, RedemptionDate } = req.body;
    if (!MemberID || !RewardID || !RedemptionDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await conn.beginTransaction();

    // 1. Get reward
    const [rewardRows] = await conn.query(
      "SELECT * FROM REWARD_ITEM WHERE RewardID = ?",
      [RewardID],
    );
    if (!rewardRows.length) throw new Error("Reward not found");
    const reward = rewardRows[0];

    // 2. Check balance
    const [balanceRows] = await conn.query(
      `
      SELECT COALESCE(SUM(pt.PointsEarned - pt.PointsRedeemed), 0) AS Balance
      FROM MEMBER m
      LEFT JOIN BOOKING b ON b.MemberID = m.MemberID
      LEFT JOIN PAYMENT p ON p.BookingID = b.BookingID
      LEFT JOIN POINT_TRANSACTION pt ON pt.PaymentID = p.PaymentID
      WHERE m.MemberID = ?
    `,
      [MemberID],
    );
    const balance = balanceRows[0].Balance;

    if (balance < reward.PointCost) {
      throw new Error(
        `Insufficient points. You have ${balance}, need ${reward.PointCost}`,
      );
    }

    // 3. INSERT REDEMPTION
    await conn.query(
      "INSERT INTO REDEMPTION (MemberID, RewardID, RedemptionDate, PointsUsed) VALUES (?, ?, ?, ?)",
      [MemberID, RewardID, RedemptionDate, reward.PointCost],
    );

    // 4. INSERT POINT_TRANSACTION (Redeemed)
    // Get last payment
    const [paymentRows] = await conn.query(
      `
      SELECT p.PaymentID FROM PAYMENT p
      JOIN BOOKING b ON b.BookingID = p.BookingID
      WHERE b.MemberID = ?
      ORDER BY p.PaymentDate DESC LIMIT 1
    `,
      [MemberID],
    );

    if (paymentRows.length) {
      await conn.query(
        `
        INSERT INTO POINT_TRANSACTION (PointsEarned, PointsRedeemed, Date, PaymentID)
        VALUES (0, ?, ?, ?)
      `,
        [reward.PointCost, RedemptionDate, paymentRows[0].PaymentID],
      );
    }

    await conn.commit();
    res.json({
      message: "Redeemed successfully",
      PointsUsed: reward.PointCost,
    });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});
```

#### 🔸 Bookings API

```javascript
// POST /api/bookings
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      MemberID,
      RoomID,
      BookingDate,
      StartTime,
      EndTime,
      Capacity,
      TrainerID,
    } = req.body;

    // Validate
    if (!MemberID || !RoomID || !BookingDate || !StartTime || !EndTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check overlap
    const overlap = await query(
      `
      SELECT BookingID FROM BOOKING
      WHERE RoomID = ? AND BookingDate = ?
      AND StartTime < ? AND EndTime > ?
    `,
      [RoomID, BookingDate, EndTime, StartTime],
    );

    if (overlap.length > 0) {
      return res.status(409).json({ message: "Room already booked" });
    }

    // Insert Booking
    const result = await query(
      `
      INSERT INTO BOOKING (MemberID, RoomID, BookingDate, StartTime, EndTime, Capacity, TrainerID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        MemberID,
        RoomID,
        BookingDate,
        StartTime,
        EndTime,
        Capacity,
        TrainerID || null,
      ],
    );

    res
      .status(201)
      .json({ message: "Booking created", BookingID: result.insertId });
  } catch (e) {
    sendDbError(res, e);
  }
});
```

#### 🔸 Reports API

```javascript
// GET /api/reports/courses
app.get("/api/reports/courses", async (req, res) => {
  try {
    const rows = await query(`
      SELECT c.CourseID, c.Title,
             COUNT(e.MemberID) AS TotalEnrollments,
             SUM(CASE WHEN e.PaymentStatus = 'Paid' THEN c.StandardFee ELSE 0 END) AS Revenue
      FROM COURSE c
      LEFT JOIN ENROLLMENT e ON e.CourseID = c.CourseID
      GROUP BY c.CourseID, c.Title
      ORDER BY TotalEnrollments DESC
    `);
    res.json(rows);
  } catch (e) {
    sendDbError(res, e);
  }
});

// GET /api/reports/revenue
app.get("/api/reports/revenue", async (req, res) => {
  try {
    const rows = await query(`
      SELECT DATE_FORMAT(PaymentDate, '%Y-%m') AS Month,
             SUM(Amount) AS TotalRevenue
      FROM PAYMENT
      GROUP BY DATE_FORMAT(PaymentDate, '%Y-%m')
      ORDER BY Month
    `);
    res.json(rows);
  } catch (e) {
    sendDbError(res, e);
  }
});
```

---

## 📦 ส่วนที่ 3: วิธีเชื่อม Frontend ↔ Backend

### 🔹 3.1 ตรวจสอบ `server.js`

**Path ของ Static Files:**

```javascript
app.use(express.static(path.join(__dirname, "../frontend")));
```

**Serve HTML:**

```javascript
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/views/index.html")),
);
app.get("/views/:page", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/views", req.params.page)),
);
```

### 🔹 3.2 CORS

**ต้องมี:**

```javascript
const cors = require("cors");
app.use(cors());
```

### 🔹 3.3 Port

**Default:** `3000`

**Frontend เรียก:** `http://localhost:3000/api/...`

### 🔹 3.4 Database Connection

**ใน `.env`:**

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=shesparks
PORT=3000
```

---

## 📦 ส่วนที่ 4: วิธี Run Backend

### 🔹 4.1 ติดตั้ง Dependencies

```bash
cd backend
npm install
```

**Packages ที่ต้องมี:**

```json
{
  "dependencies": {
    "express": "^4.19.2",
    "mysql2": "^3.11.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

### 🔹 4.2 Run

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

**ควรเห็น:**

```
✅ Connected to MySQL database!
🚀 Server running on http://localhost:3000
```

### 🔹 4.3 ทดสอบ

**Postman:**

- `GET http://localhost:3000/api/members`
- `GET http://localhost:3000/api/courses`
- `GET http://localhost:3000/api/rewards`

**Frontend:**

- เปิด `http://localhost:3000/`
- Login `M001 / 1234`
- ดูว่าโหลดข้อมูลจาก API

---

## 📦 ส่วนที่ 5: Checklist ทีละขั้น

### ✅ Database

- [ ] สร้าง `schema.sql` — 13 Tables + 8 Bridge Tables
- [ ] เพิ่ม `ImageURL` ทุก Table
- [ ] เพิ่ม `StudioCode` ใน TRAINER
- [ ] สร้างตาราง `SITE_SETTING`
- [ ] INSERT ข้อมูลตัวอย่าง (20+ แถวต่อตาราง)
- [ ] ทดสอบ Query ใน DBever

### ✅ Backend API

- [ ] `GET /api/members` + `GET /api/members/:id`
- [ ] `GET /api/members/:id/points`
- [ ] `GET /api/studios` + CRUD
- [ ] `GET /api/sports` + CRUD
- [ ] `GET /api/rooms` + CRUD
- [ ] `GET /api/courses` + CRUD
- [ ] `POST /api/courses/enroll`
- [ ] `GET /api/trainers` + CRUD
- [ ] `GET /api/equipments` + CRUD
- [ ] `GET /api/rewards` + CRUD
- [ ] `POST /api/rewards/redeem`
- [ ] `GET /api/bookings` + `POST /api/bookings`
- [ ] `GET /api/reports/courses`
- [ ] `GET /api/reports/revenue`

### ✅ Testing

- [ ] ทดสอบด้วย Postman ทุก Endpoint
- [ ] ส่ง Postman Collection กลับมาให้ Frontend
- [ ] ทดสอบกับ Frontend จริง

---

## 📦 ส่วนที่ 6: หมายเหตุสำคัญ

### 🔹 6.1 Fallback ใน Frontend

**Frontend มี Fallback** → ถ้า API ไม่พร้อม → ใช้ Mock Data

**Marker:** `// TODO: ลบ Fallback นี้เมื่อ Backend พร้อม`

**เมื่อ Backend พร้อม** → ลบ Fallback ใน:

1. `js/admin.js` — `renderLoyaltyFromLocalStorage()`
2. `js/trainer-dashboard.js` — Mock Sessions
3. `js/manager-dashboard.js` — Mock Bookings
4. `js/points.js` — Mock Points
5. `js/course.js` — Mock Courses
6. `js/summary.js` — Mock Booking

### 🔹 6.2 Member Level

**Frontend คำนวณ:**

- Silver: 0-4 Bookings
- Gold: 5-9 Bookings
- Platinum: 10+ Bookings

**Admin สามารถ Override ได้** → เก็บใน `localStorage.memberLevelOverrides`

**Backend** — อาจเพิ่ม `MemberLevel` ในตาราง `MEMBER`

### 🔹 6.3 Loyalty Points Rules

**Frontend เก็บ:** `localStorage.loyaltyRules`

**Backend** — เก็บใน `SITE_SETTING`:

```sql
('points_per_hour', '30'),
('points_per_trainer', '50'),
('points_per_equipment', '20'),
('points_per_capacity', '2');
```

### 🔹 6.4 API Response Format

**ต้องเป็น:**

- **Array ตรง ๆ** — `[{...}, {...}]`
- **ไม่ใช่** — `{ data: [...] }`

**เพราะ Frontend คาดหวัง Array โดยตรง**

---

## 📞 ติดต่อ Frontend Team

- **Frontend Lead:** Many
- **ส่ง Postman Collection** กลับมาเมื่อเสร็จ
- **ส่ง API Spec** (URL + Request + Response)

---

## 🎯 สรุปสิ่งที่เพื่อนต้องทำ

1. **Database** — `schema.sql` ครบ + ข้อมูลตัวอย่าง
2. **Backend API** — 14 Endpoints ตาม Spec
3. **Test** — Postman ทุก Endpoint
4. **ส่ง** — Postman Collection + API Spec

**ใช้เวลา:** 5-7 วัน

**เมื่อเสร็จ:** Frontend จะเปลี่ยนจาก Mock → API จริง

---

## 📌 เอกสารอ้างอิง

- **API Client:** `frontend/js/api.js`
- **Business Rules:** `Business Rules.pdf`
- **ERD:** `ERD.pdf`
- **Proposal:** `Copy of SE212 Lab 6.pdf`
