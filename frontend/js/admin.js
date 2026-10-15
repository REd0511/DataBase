/* ============================================
   admin.js - Admin Dashboard (API Connected)
   ============================================ */

let currentTab = "studios";
let editingId = null;

// ตัวแปรสำหรับเก็บข้อมูลจาก Database
let dbStudios = [];
let dbSports = [];
let dbRooms = [];
let dbCourses = [];
let dbTrainers = [];
let dbRewards = [];
let dbEquipments = [];
let dbMembers = [];

window.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "admin") {
    alert("Please login as Admin");
    window.location.href = "/views/login.html";
    return;
  }

  // เรียกฟังก์ชันโหลดข้อมูลทั้งหมด
  await loadDashboard();
});

async function loadDashboard() {
  const api = window.SheSparksAPI;

  if (!api) {
    showDashboardError("API client was not loaded.");
    return;
  }

  // Set Loading States
  setText("totalMembers", "…");
  setText("totalBookings", "…");
  setText("totalRevenue", "…");
  setText("totalPointsRedeemed", "…");
  setTableMessage("#popularCoursesTable tbody", "Loading course report…");
  setTableMessage("#loyaltySummaryTable tbody", "Loading loyalty points…");

  try {
    // 1. ดึงข้อมูล Reports จาก API
    const [members, bookings, revenueRows, courses] = await Promise.all([
      api.members(),
      api.bookings(),
      api.reports.revenue(),
      api.reports.courses()
    ]);

    // Summary Cards (จากข้อมูลจริง)
    setText("totalMembers", members.length.toLocaleString());
    setText("totalBookings", bookings.length.toLocaleString());

    const totalRevenue = revenueRows.reduce((sum, row) => sum + Number(row.TotalRevenue || 0), 0);
    setText("totalRevenue", "฿" + totalRevenue.toLocaleString());

    // Report 3: Popular Courses
    renderPopularCourses(courses);

    // Report 2: Loyalty Points Summary
    if (members.length > 0) {
      const pointPromises = members.map(async (member) => {
        try {
          const points = await api.memberPoints(member.MemberID);
          return { member, points };
        } catch { return null; }
      });

      const pointResults = await Promise.all(pointPromises);
      const validPoints = pointResults.filter(p => p !== null);

      const redeemedTotal = validPoints.reduce((sum, item) => sum + Number(item.points.TotalRedeemed || 0), 0);
      setText("totalPointsRedeemed", redeemedTotal.toLocaleString());

      renderLoyaltySummary(validPoints, bookings);
    }

    // 2. ดึงข้อมูล Master Data สำหรับ Manage Content (TABs)
    dbStudios = await api.studios();
    dbSports = await api.sports();
    dbRooms = await api.rooms();
    dbCourses = await api.courses();
    dbTrainers = await api.trainers();
    dbRewards = await api.rewards();
    dbEquipments = await api.get('/equipments'); // สมมติว่ามี route GET /api/equipments
    dbMembers = members; // ใช้ข้อมูล members ที่ดึงมาแล้วได้เลย

    // Render ข้อมูลลง Tab
    renderAdminContent();

  } catch (error) {
    console.error("Dashboard Load Error:", error);
    showDashboardError("Failed to load dashboard data: " + error.message);
  }
}

// ==================== HELPERS ====================
function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setTableMessage(selector, message) {
  const tbody = document.querySelector(selector);
  if (tbody) tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:20px;color:var(--text-mid);">${message}</td></tr>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function showDashboardError(message) {
  let notice = document.getElementById("dashboard-api-notice");
  if (!notice) {
    notice = document.createElement("p");
    notice.id = "dashboard-api-notice";
    notice.style.cssText = "margin:12px auto;padding:10px 14px;max-width:1000px;border:1px solid #e7a1b7;border-radius:8px;color:#8b3152;background:#fff4f7;";
    const main = document.querySelector("main");
    if (main) main.insertBefore(notice, main.firstChild.nextSibling);
  }
  notice.textContent = message;
}


// ============================================
// REPORT 3 RENDERER
// ============================================
function renderPopularCourses(courses) {
  const tbody = document.querySelector("#popularCoursesTable tbody");
  if (!tbody) return;

  if (!courses.length) {
    setTableMessage("#popularCoursesTable tbody", "No course records found.");
    return;
  }

  const sortedCourses = [...courses].sort((a, b) => {
    const enrollA = Number(a.TotalEnrollments || a.Enrollments || 0);
    const enrollB = Number(b.TotalEnrollments || b.Enrollments || 0);

    if (enrollB !== enrollA) {
      return enrollB - enrollA;
    }

    const revA = Number(a.Revenue || a.TotalRevenue || a.revenue || 0);
    const revB = Number(b.Revenue || b.TotalRevenue || b.revenue || 0);
    return revB - revA;
  });

  tbody.innerHTML = sortedCourses.map((course) => {
    const title = course.Title ?? course.title ?? "Untitled course";
    const enrollments = Number(course.TotalEnrollments || course.Enrollments || 0);
    const revenue = Number(course.Revenue || course.TotalRevenue || course.revenue || 0);
    return `<tr>
              <td>${escapeHtml(title)}</td>
              <td>${enrollments.toLocaleString()}</td>
              <td class="earned">฿${revenue.toLocaleString()}</td>
            </tr>`;
  }).join("");
}

// ============================================
// REPORT 2 RENDERERS 
// ============================================
function renderLoyaltySummary(validPoints, bookings) {
  const tbody = document.querySelector("#loyaltySummaryTable tbody");
  if (!tbody) return;

  const bookingsByMember = {};
  bookings.forEach((b) => {
    if (!bookingsByMember[b.MemberID]) bookingsByMember[b.MemberID] = [];
    bookingsByMember[b.MemberID].push(b);
  });

  const reportData = validPoints.map(({ member, points }) => {
    const earned = Number(points.TotalEarned || 0);
    const redeemed = Number(points.TotalRedeemed || 0);
    return {
      name: member.Name,
      bookingCount: (bookingsByMember[member.MemberID] || []).length,
      earned, redeemed, balance: earned - redeemed
    };
  });

  setText("totalLoyaltyEarned", reportData.reduce((sum, row) => sum + row.earned, 0).toLocaleString());
  setText("totalLoyaltyRedeemed", reportData.reduce((sum, row) => sum + row.redeemed, 0).toLocaleString());
  setText("totalLoyaltyBalance", reportData.reduce((sum, row) => sum + row.balance, 0).toLocaleString());

  tbody.innerHTML = reportData.map((row) => `
    <tr>
      <td><strong>${escapeHtml(row.name)}</strong></td>
      <td>${row.bookingCount}</td>
      <td class="earned">+${row.earned.toLocaleString()}</td>
      <td class="redeemed">-${row.redeemed.toLocaleString()}</td>
      <td class="balance">${row.balance.toLocaleString()}</td>
    </tr>
  `).join("");
}

// ============================================
// ADMIN TABS (MANAGE CONTENT)
// ============================================
function showTab(tab, event) {
  currentTab = tab;
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  if (event) event.target.classList.add("active");
  renderAdminContent();
}

function renderAdminContent() {
  const content = document.getElementById("admin-content");
  if (!content) return;

  if (currentTab === "loyalty") {
    renderLoyaltySettings(content);
    return;
  }

  // Map ข้อมูลและวิธีแสดงผลของแต่ละ Tab ให้เชื่อมกับ DB Variables
  const dataMap = {
    studios: { data: dbStudios, name: (x) => x.Name, extra: (x) => `${x.Location}` },
    sports: { data: dbSports, name: (x) => x.SportName, extra: (x) => `Intensity: ${x.IntensityLevel}` },
    rooms: { data: dbRooms, name: (x) => x.RoomName, extra: (x) => `${x.StudioLocation || x.StudioCode} • Capacity: ${x.Capacity}` },
    courses: { data: dbCourses, name: (x) => x.Title, extra: (x) => `${x.Level} • ฿${x.StandardFee}` },
    trainers: { data: dbTrainers, name: (x) => x.Name, extra: (x) => `${x.SportName || "Trainer"} • ${x.Phone}` },
    rewards: { data: dbRewards, name: (x) => x.Name, extra: (x) => `${x.PointCost} pts • ${x.Category}` },
    equipments: { data: dbEquipments, name: (x) => x.Name, extra: (x) => `${x.SportName || "Equipment"} • ${x.ConditionStatus || "Good"}` },
    members: { data: dbMembers, name: (x) => x.Name, extra: (x) => `Level: ${x.MemberLevel} • Phone: ${x.Phone}` },
  };

  const config = dataMap[currentTab];
  if (!config) return;

  const data = config.data || [];

  content.innerHTML = `
  <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
    <button class="btn-primary" onclick="alert('ปุ่มนี้ใช้สาธิต UI สำหรับเพิ่มข้อมูล (ยังไม่เชื่อมต่อ API Create จริง)')">+ Add New</button>
  </div>
  <table class="admin-table">
    <thead>
      <tr>
        <th>Image</th>
        <th>Name</th>
        <th>Details</th>
        <th style="text-align: right;">Actions</th>
      </tr>
    </thead>
    <tbody>
      ${data.length === 0 ? `<tr><td colspan="4" style="text-align:center;">No data available in Database.</td></tr>` :
      data.map((item) => `
        <tr>
          <td>
            ${item.ImageURL ? `<img src="${item.ImageURL}" class="table-thumb" alt="image" onerror="this.style.display='none'">` : `<div class="no-image">No img</div>`}
          </td>
          <td><strong>${escapeHtml(config.name(item))}</strong></td>
          <td>${escapeHtml(config.extra(item))}</td>
          <td style="text-align: right;">
            <button class="action-btn btn-edit" onclick="alert('ปุ่มนี้ใช้สาธิต UI สำหรับแก้ไข (ยังไม่เชื่อมต่อ API Update จริง)')">Edit</button>
            <button class="action-btn btn-delete" onclick="alert('ปุ่มนี้ใช้สาธิต UI สำหรับลบ (ยังไม่เชื่อมต่อ API Delete จริง)')">Delete</button>
          </td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  `;
}

// ==================== LOYALTY SETTINGS ====================
// (คงไว้เหมือนเดิม เพราะมันบันทึกลง localStorage ของ Admin)
function renderLoyaltySettings(content) {
  const rules = JSON.parse(localStorage.getItem("loyaltyRules")) || { pointsPerHour: 30, pointsPerTrainer: 50, pointsPerEquipment: 20, pointsPerCapacity: 2 };

  content.innerHTML = `
    <h3 style="color: var(--pink-deep); margin-bottom: 8px;">Loyalty Points Settings</h3>
    <div class="loyalty-settings">
      <div class="loyalty-item"><label>Points per Hour</label><input type="number" id="pts-hr" value="${rules.pointsPerHour}"></div>
      <div class="loyalty-item"><label>Points per Trainer</label><input type="number" id="pts-tr" value="${rules.pointsPerTrainer}"></div>
      <div class="loyalty-item"><label>Points per Equipment</label><input type="number" id="pts-eq" value="${rules.pointsPerEquipment}"></div>
      <div class="loyalty-item"><label>Points per Person</label><input type="number" id="pts-cp" value="${rules.pointsPerCapacity}"></div>
    </div>
    <button class="btn-primary" onclick="saveLoyaltySettings()">Save Settings</button>
  `;
}

function saveLoyaltySettings() {
  const rules = {
    pointsPerHour: parseInt(document.getElementById("pts-hr").value) || 0,
    pointsPerTrainer: parseInt(document.getElementById("pts-tr").value) || 0,
    pointsPerEquipment: parseInt(document.getElementById("pts-eq").value) || 0,
    pointsPerCapacity: parseInt(document.getElementById("pts-cp").value) || 0,
  };
  localStorage.setItem("loyaltyRules", JSON.stringify(rules));
  alert("Loyalty Points settings saved");
}

// ============================================
// SIDEBAR NAVIGATION (Smooth Scroll + Active)
// ============================================
function scrollToSection(sectionId, event) {
  if (event) event.preventDefault();
  const section = document.getElementById(sectionId);
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelectorAll(".sidebar-link").forEach((link) => link.classList.remove("active"));
  if (event && event.currentTarget) event.currentTarget.classList.add("active");
}

window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll(".admin-section");
  const navLinks = document.querySelectorAll(".sidebar-link");
  let currentSection = "";
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 120) currentSection = section.getAttribute("id");
  });
  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentSection}`) link.classList.add("active");
  });
});

// ============================================
// REPORT 1: AVAILABLE ROOMS
// ============================================
async function loadAvailableRooms() {
  // ดึงค่า Input (รองรับทั้งแบบมีคำว่า admin นำหน้าและไม่มี)
  const date = document.getElementById("adminDate")?.value || document.getElementById("date")?.value;
  const start = document.getElementById("adminStart")?.value || document.getElementById("start")?.value;
  const end = document.getElementById("adminEnd")?.value || document.getElementById("end")?.value;

  // จุดที่จะแสดงผลลัพธ์
  const container = document.getElementById("availableRoomsList") || document.getElementById("results");

  if (!container) return;

  if (!date || !start || !end) {
    alert("Please select date and start/end time.");
    return;
  }
  if (start >= end) {
    alert("End time must be later than start time.");
    return;
  }

  container.innerHTML = "<p style='color:var(--text-mid); padding:20px;'>กำลังค้นหาข้อมูลห้องว่างจาก Database...</p>";

  try {
    const api = window.SheSparksAPI;

    // เรียก API ค้นหา ห้อง, อุปกรณ์, เทรนเนอร์ ที่ว่างพร้อมๆ กัน
    const [rooms, equipment, trainers] = await Promise.all([
      api.availableRooms(date, start, end),
      api.get(`/equipments/available?date=${date}&startTime=${start}&endTime=${end}`),
      api.availableTrainers(date, start, end)
    ]);

    let html = "";

    // แสดงห้องว่าง
    html += `<h3>Available Rooms (${rooms.length})</h3><div class="room-list">`;
    html += rooms.map(r => `<div class="room-card"><h3>${escapeHtml(r.RoomName)}</h3><p>Capacity: ${r.Capacity} people</p><p>Studio: ${escapeHtml(r.StudioLocation || r.StudioCode)}</p></div>`).join('') || '<p style="color:var(--text-mid);">ไม่มีห้องว่าง</p>';
    html += `</div>`;

    // แสดงอุปกรณ์ว่าง
    html += `<h3 style="margin-top:24px;">Available Equipment (${equipment.length})</h3><div class="room-list">`;
    html += equipment.map(e => `<div class="room-card" style="background:var(--white);"><h3>${escapeHtml(e.Name)}</h3><p>Condition: ${escapeHtml(e.ConditionStatus || e.Condition)}</p><p>Studio: ${escapeHtml(e.StudioCode)}</p></div>`).join('') || '<p style="color:var(--text-mid);">ไม่มีอุปกรณ์ว่าง</p>';
    html += `</div>`;

    // แสดงเทรนเนอร์ว่าง
    html += `<h3 style="margin-top:24px;">Available Trainers (${trainers.length})</h3><div class="room-list">`;
    html += trainers.map(t => `<div class="room-card"><h3>${escapeHtml(t.Name)}</h3><p>Sport: ${escapeHtml(t.SportName)}</p><p>Studio: ${escapeHtml(t.StudioCode)}</p></div>`).join('') || '<p style="color:var(--text-mid);">ไม่มีเทรนเนอร์ว่าง</p>';
    html += `</div>`;

    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = `<p style="color:var(--danger); padding:20px;">API error: ${escapeHtml(error.message)}</p>`;
  }
}