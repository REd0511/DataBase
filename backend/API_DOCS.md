# SheSparks Wellness API Documentation

## Base URL
http://localhost:3000

## วิธีรัน Backend
1. `npm install`
2. สร้างไฟล์ `.env` (ดูจาก `.env.example`)
3. `npm run dev`

## Members
- GET /api/members — ดูสมาชิกทั้งหมด
- GET /api/members/:id — ดูสมาชิกคนเดียว
- POST /api/members — สมัครสมาชิกใหม่
- GET /api/members/:id/points — ดูแต้มสะสม

## Rooms & Studios
- GET /api/studios — ดูสตูดิโอ
- GET /api/rooms — ดูห้องทั้งหมด
- GET /api/rooms/available?date=&startTime=&endTime= — ห้องว่าง
- GET /api/sports — ดูประเภทกีฬา

## Trainers
- GET /api/trainers — ดูเทรนเนอร์
- GET /api/trainers/:id — ดูตารางสอน
- GET /api/trainers/available?date=&startTime=&endTime= — เทรนเนอร์ว่าง

## Courses
- GET /api/courses — ดูคอร์ส
- POST /api/courses/enroll — ลงทะเบียน

## Bookings
- POST /api/bookings — จองห้อง
- GET /api/bookings/member/:id — ประวัติการจอง
- GET /api/bookings — ดูทั้งหมด (Admin)

## Payments & Points
- POST /api/payments — ชำระเงิน + สะสมแต้ม (1 บาท = 1 แต้ม)
- GET /api/payments/member/:id — ประวัติชำระเงิน

## Rewards
- GET /api/rewards — ดูรางวัล
- POST /api/rewards/redeem — แลกรางวัล
- GET /api/rewards/member/:id — ประวัติการแลก

## Reports
- GET /api/reports/bookings — การจองทั้งหมด
- GET /api/reports/revenue — รายได้รายเดือน
- GET /api/reports/courses — คอร์สยอดนิยม

## Authentication (Simple)
- POST /api/auth/login — เข้าสู่ระบบด้วยเบอร์โทร