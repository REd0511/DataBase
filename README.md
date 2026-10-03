# DataBase
# สาดไปสมาชิก
Index:
<!-- ============================================
         FEATURES:
         - Summary Cards (Total Members, Bookings, Revenue, Points)
         - Report 1: Available rooms/equipment/trainers
         - Report 2: Member points and redemption stats
         - Report 3: Popular courses + monthly revenue
         - Reward Catalog (CRUD)
         - Booking List
         - TODO: Connect to API /api/admin/*
         ============================================ -->

login:
<!-- ============================================
         FEATURES:
         - ฟอร์ม Login (Member ID + Password)
         - ใช้ Hardcode User (Prototype)
         - เมื่อ Login สำเร็จ → Redirect ตาม Role
         - Member → booking.html
         - Admin → admin.html (ถ้ามี)
         - ไม่เชื่อมต่อ Database จริง (ตาม Out of Scope)
         ============================================ -->

Booking:
<!-- ============================================
         FEATURES:
         - แสดงรายการห้องซ้อม (Mock Data)
         - เลือกวันที่, เวลา, ประเภทกีฬา
         - ปุ่ม "จอง" สำหรับแต่ละห้อง
         - TODO: เชื่อมกับ API /api/rooms และ /api/bookings
         ============================================ -->

Trainer:
<!-- ============================================
         FEATURES:
         - แสดงรายการเทรนเนอร์หญิง (Mock Data)
         - แสดงความเชี่ยวชาญ (SportType)
         - ปุ่ม "จองเทรนเนอร์"
         - TODO: เชื่อมกับ API /api/trainers
         ============================================ -->

Course:
<!-- ============================================
         FEATURES:
         - แสดงคอร์สเรียน (Mock Data)
         - แสดง Level (Beginner/Intermediate/Advanced)
         - ปุ่ม "สมัครเรียน"
         - TODO: เชื่อมกับ API /api/courses และ /api/enrollments
         ============================================ -->

Point:
<!-- ============================================
         FEATURES:
         - แสดงแต้มสะสมของสมาชิก (Mock Data)
         - แสดงประวัติการได้/ใช้แต้ม
         - ปุ่มไปหน้า Rewards
         - TODO: เชื่อมกับ API /api/points/:memberId
         ============================================ -->

Reward:
<!-- ============================================
         FEATURES:
         - แสดงรายการรางวัล/คูปอง (Mock Data)
         - แสดงแต้มที่ต้องใช้แลก
         - ปุ่ม "แลกรางวัล"
         - TODO: เชื่อมกับ API /api/rewards และ /api/redemptions
         ============================================ -->

Admin:
<!-- ============================================
         FEATURES:
         - Summary Cards (Total Members, Bookings, Revenue, Points)
         - Report 1: Available rooms/equipment/trainers
         - Report 2: Member points and redemption stats
         - Report 3: Popular courses + monthly revenue
         - Reward Catalog (CRUD)
         - Booking List
         - TODO: Connect to API /api/admin/*
         ============================================ -->

[เข้าสู่หน้า Booking]
        │
        ▼
[ขั้นที่ 1: เลือก Studio]
   - แสดงรายการ Studio ทั้งหมด
   - เช่น Studio A (สีลม), Studio B (พญาไท)
        │
        ▼
[ขั้นที่ 2: เลือกประเภทกีฬา]
   - เมื่อเลือก Studio แล้ว → แสดง SportType ที่ Studio นั้นเปิดสอน
   - เช่น Studio A มี Yoga, Pilates
        │
        ▼
[ขั้นที่ 3: เลือก Room]
   - แสดงเฉพาะ Room ที่อยู่ใน Studio ที่เลือก
   - และตรงกับ SportType ที่เลือก
        │
        ▼
[ขั้นที่ 4: เลือกวันและเวลา]
   - Date, StartTime, EndTime
        │
        ▼
[ขั้นที่ 5: ยืนยันการจอง]
   - กดปุ่ม "Book"
   - ตรวจสอบการ Login
   - ส่งข้อมูลไป API