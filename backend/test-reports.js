const assert = require("assert");
const mysql = require("mysql2/promise");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const base = `http://localhost:${process.env.PORT || 3000}`;

async function get(path) {
  const url = base + path;
  const response = await fetch(url);
  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Expected JSON but received another response\n` +
      `URL: ${url}\n` +
      `HTTP Status: ${response.status}\n` +
      `Response: ${text.slice(0, 300)}`
    );
  }

  assert(
    response.ok,
    `${url} returned HTTP ${response.status}: ${JSON.stringify(data)}`
  );

  assert(
    Array.isArray(data),
    `${url} should return a JSON array.`
  );

  return data;
}

async function main() {
  let db;

  try {
    console.log("Starting SheSparks tests...");
    console.log("Backend URL:", base);

    // Check MySQL connection and database tables.
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_NAME || "shesparks",
    });

    console.log("PASS MySQL connection");

    const databaseName = process.env.DB_NAME || "shesparks";

    const [[tables]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM information_schema.tables
       WHERE table_schema = ?
       AND table_name IN (
         'MEMBER', 'STUDIO', 'ROOM', 'SPORT_TYPE',
         'EQUIPMENT', 'TRAINER', 'COURSE', 'QUALIFICATION',
         'REWARD_ITEM', 'BOOKING', 'PAYMENT',
         'POINT_TRANSACTION', 'BOOKING_EQUIPMENT',
         'BOOKING_TRAINER', 'TRAINER_QUALIFICATION',
         'TRAINER_COURSE', 'ENROLLMENT', 'REDEMPTION',
         'COURSE_PREREQUISITE', 'STUDIO_SPORT_TYPE',
         'DEPENDENT'
       )`,
      [databaseName]
    );

    assert.strictEqual(
      Number(tables.total),
      21,
      "Expected 21 required database tables."
    );

    console.log("PASS Database tables:", tables.total);

    const [[members]] = await db.query(
      "SELECT COUNT(*) AS total FROM MEMBER"
    );

    assert(
      Number(members.total) >= 6,
      "Expected at least 6 seed members."
    );

    console.log("PASS Member seed data:", members.total);

    const [[bookings]] = await db.query(
      "SELECT COUNT(*) AS total FROM BOOKING"
    );

    assert(
      Number(bookings.total) >= 10,
      "Expected at least 10 seed bookings."
    );

    console.log("PASS Booking seed data:", bookings.total);

    await db.end();
    db = null;

    // Test the report endpoints registered in reportRoutes.js.
    const checks = [
      ["/api/reports/bookings", "Booking report"],
      ["/api/reports/revenue", "Revenue report"],
      ["/api/reports/courses", "Course report"],
      [
        "/api/reports/course-revenue-monthly",
        "Monthly course revenue report",
      ],
      ["/api/reports/members", "Member level report"],
    ];

    let passed = 0;
    const failures = [];

    for (const [endpoint, label] of checks) {
      try {
        const data = await get(endpoint);
        console.log(`PASS ${label}: ${data.length} row(s)`);
        passed++;
      } catch (error) {
        console.error(`FAIL ${label}: ${error.message}`);
        failures.push(label);
      }
    }

    console.log("\n========== TEST SUMMARY ==========");
    console.log(`Passed: ${passed}/${checks.length}`);
    console.log(`Failed: ${failures.length}/${checks.length}`);

    if (failures.length > 0) {
      throw new Error(
        "Some report API tests failed. Check the Backend terminal for SQL or route errors."
      );
    }

    console.log("\nAll configured report API tests passed!");

  } finally {
    if (db) {
      await db.end().catch(() => {});
    }
  }
}

main().catch((error) => {
  console.error("\nTest failed:", error.message);
  process.exitCode = 1;
});