const assert = require("assert");
const http = require("http");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const base = `http://localhost:${process.env.PORT || 3000}`;
async function get(path) {
  const r = await fetch(base + path);
  const j = await r.json();
  return { status: r.status, data: j };
}
(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "shesparks",
  });
  const [[tables]] = await db.query(
    "SELECT COUNT(*) c FROM information_schema.tables WHERE table_schema=? AND table_name IN ('MEMBER','STUDIO','ROOM','SPORT_TYPE','EQUIPMENT','TRAINER','COURSE','QUALIFICATION','REWARD_ITEM','BOOKING','PAYMENT','POINT_TRANSACTION','BOOKING_EQUIPMENT','BOOKING_TRAINER','TRAINER_QUALIFICATION','TRAINER_COURSE','ENROLLMENT','REDEMPTION','COURSE_PREREQUISITE','STUDIO_SPORT_TYPE','DEPENDENT')",
    [process.env.DB_NAME || "shesparks"],
  );
  assert.equal(
    Number(tables.c),
    21,
    "Proposal schema should contain 21 tables",
  );
  const [[seed]] = await db.query("SELECT COUNT(*) c FROM MEMBER");
  assert(seed.c >= 6, "Seed members missing");
  const [[booking]] = await db.query("SELECT COUNT(*) c FROM BOOKING");
  assert(booking.c >= 10, "Seed bookings missing");
  await db.end();
  const health = await get("/api/reports/health");
  assert.equal(health.status, 200);
  assert.equal(health.data.ok, true);
  const avail = await get(
    "/api/reports/availability?date=2026-10-08&start=09:30&end=10:30",
  );
  assert.equal(avail.status, 200);
  assert(
    Array.isArray(avail.data.rooms) &&
      Array.isArray(avail.data.equipment) &&
      Array.isArray(avail.data.trainers),
  );
  const points = await get("/api/reports/member-points");
  assert.equal(points.status, 200);
  assert(points.data.members.length >= 6);
  const courses = await get("/api/reports/course-performance");
  assert.equal(courses.status, 200);
  assert(courses.data.courses.length >= 5);
  assert(Array.isArray(courses.data.monthly));
  const dash = await get("/api/admin/dashboard");
  assert.equal(dash.status, 200);
  assert(dash.data.summary.totalMembers >= 6);
  assert(dash.data.summary.totalBookings >= 10);
  console.log("✅ All report/dashboard tests passed.");
})().catch((e) => {
  console.error("❌ Test failed:", e.message);
  process.exit(1);
});
