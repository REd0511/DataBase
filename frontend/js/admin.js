/* ============================================
   admin.js - Admin Dashboard + CRUD (Phase D)
   FEATURES:
   - CRUD ทั้ง 7 Tabs (Studios, Sports, Rooms, Courses, Trainers, Rewards, Recommend)
   - Modal Form พร้อม Dropdown
   - Studio เลือกได้หลาย Sports (Multi-select)
   - Course เลือก Studio → Room → Trainer → Prerequisite
   ============================================ */

// ==================== MOCK DATA ====================
const MOCK_ADMIN = {
  totalMembers: 45,
  totalBookings: 128,
  totalRevenue: 85000,
  totalPointsRedeemed: 3200,
  popularCourses: [
    { Title: "Basic Yoga", Enrollments: 25, Revenue: 37500 },
    { Title: "Women Boxing", Enrollments: 18, Revenue: 36000 },
    { Title: "Pilates Intro", Enrollments: 15, Revenue: 18000 },
    { Title: "Advanced Yoga", Enrollments: 10, Revenue: 25000 },
  ],
  memberPoints: [
    { Name: "Member A", Earned: 1500, Redeemed: 500, Balance: 1000 },
    { Name: "Member B", Earned: 800, Redeemed: 200, Balance: 600 },
    { Name: "Member C", Earned: 2000, Redeemed: 1200, Balance: 800 },
    { Name: "Member D", Earned: 1200, Redeemed: 400, Balance: 800 },
  ],
  availableRooms: [
    { RoomID: 1, RoomName: "Yoga Room A", Capacity: 20, SportType: "Yoga" },
    {
      RoomID: 4,
      RoomName: "Badminton Court D",
      Capacity: 4,
      SportType: "Badminton",
    },
  ],
};

// ==================== STATE ====================
let currentTab = "studios";
let editingId = null;

// ==================== CHECK ADMIN LOGIN ====================
window.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "admin") {
    alert("Please login as Admin");
    window.location.href = "/views/login.html";
    return;
  }
  loadDashboard();
});

// ==================== LOAD DASHBOARD FROM REAL API ====================
// Dashboard/report sections use the backend API. CRUD tabs below still use
// the existing data.js structures and should be migrated separately.
async function loadDashboard() {
  const api = window.SheSparksAPI;
  if (!api) {
    showDashboardError(
      "API client was not loaded. Add /js/api.js before /js/admin.js.",
    );
    renderAdminContent();
    return;
  }

  setText("totalMembers", "…");
  setText("totalBookings", "…");
  setText("totalRevenue", "…");
  setText("totalPointsRedeemed", "…");
  setTableMessage("#popularCoursesTable tbody", "Loading course report…");
  setTableMessage("#loyaltySummaryTable tbody", "Loading loyalty points…");

  const [membersResult, bookingsResult, revenueResult, coursesResult] =
    await Promise.allSettled([
      api.members(),
      api.bookings(),
      api.reports.revenue(),
      api.reports.courses(),
    ]);

  const members = valueOrEmpty(membersResult);
  const bookings = valueOrEmpty(bookingsResult);
  const revenueRows = valueOrEmpty(revenueResult);
  const courses = valueOrEmpty(coursesResult);

  if (membersResult.status === "fulfilled")
    setText("totalMembers", members.length.toLocaleString());
  else setText("totalMembers", "—");

  if (bookingsResult.status === "fulfilled")
    setText("totalBookings", bookings.length.toLocaleString());
  else setText("totalBookings", "—");

  if (revenueResult.status === "fulfilled") {
    const totalRevenue = revenueRows.reduce(
      (sum, row) =>
        sum + numberValue(row.TotalRevenue ?? row.totalRevenue ?? row.Amount),
      0,
    );
    setText("totalRevenue", "฿" + totalRevenue.toLocaleString());
  } else setText("totalRevenue", "—");

  if (coursesResult.status === "fulfilled") renderPopularCourses(courses);
  else
    setTableMessage(
      "#popularCoursesTable tbody",
      "Unable to load courses: " + errorMessage(coursesResult.reason),
    );

  // ============================================
  // Report 2: Loyalty Points Summary
  // ============================================
  if (membersResult.status === "fulfilled") {
    const pointResults = await Promise.allSettled(
      members.map((member) => {
        const id = member.MemberID ?? member.memberId ?? member.id;
        return id == null
          ? Promise.reject(new Error("Member ID is missing"))
          : api.memberPoints(id).then((points) => ({ member, points }));
      }),
    );
    const validPoints = pointResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
    const redeemedTotal = validPoints.reduce(
      (sum, item) =>
        sum +
        numberValue(item.points.TotalRedeemed ?? item.points.totalRedeemed),
      0,
    );
    setText("totalPointsRedeemed", redeemedTotal.toLocaleString());
    renderLoyaltySummary(validPoints, bookings);
    if (pointResults.some((result) => result.status === "rejected")) {
      showDashboardError(
        "Some member point records could not be loaded. Check the browser Console and backend terminal.",
      );
    }
  } else {
    // ✅ FALLBACK: ถ้า API ไม่พร้อม → ใช้ Mock Data
    // TODO: ลบ Fallback นี้เมื่อ Backend พร้อม
    setText(
      "totalPointsRedeemed",
      MOCK_ADMIN.totalPointsRedeemed.toLocaleString(),
    );
    renderLoyaltySummaryFromMock();
  }

  if (
    [membersResult, bookingsResult, revenueResult, coursesResult].some(
      (result) => result.status === "rejected",
    )
  ) {
    showDashboardError(
      "Some dashboard data could not be loaded from the API. See the messages in the report tables and check the backend terminal.",
    );
  }

  // Keep existing Manage Content tabs intact.
  renderAdminContent();
}

function valueOrEmpty(result) {
  if (result.status !== "fulfilled") return [];
  const value = result.value;
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setTableMessage(selector, message) {
  const tbody = document.querySelector(selector);
  if (tbody)
    tbody.innerHTML = `<tr><td colspan="10">${escapeHtml(message)}</td></tr>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function errorMessage(error) {
  return error && error.message ? error.message : "Unknown API error";
}

function showDashboardError(message) {
  let notice = document.getElementById("dashboard-api-notice");
  if (!notice) {
    notice = document.createElement("p");
    notice.id = "dashboard-api-notice";
    notice.setAttribute("role", "status");
    notice.style.cssText =
      "margin:12px auto;padding:10px 14px;max-width:1000px;border:1px solid #e7a1b7;border-radius:8px;color:#8b3152;background:#fff4f7;";
    const main = document.querySelector("main");
    if (main) main.insertBefore(notice, main.firstChild.nextSibling);
  }
  notice.textContent = message;
}

function renderPopularCourses(courses) {
  const tbody = document.querySelector("#popularCoursesTable tbody");
  if (!tbody) return;

  // ✅ FALLBACK: ถ้าไม่มีข้อมูล → ใช้ Mock
  // TODO: ลบ Fallback นี้เมื่อ Backend พร้อม
  if (!courses.length) {
    tbody.innerHTML = MOCK_ADMIN.popularCourses
      .map(
        (c) => `
      <tr>
        <td>${escapeHtml(c.Title)}</td>
        <td>${c.Enrollments}</td>
        <td class="earned">฿${c.Revenue.toLocaleString()}</td>
      </tr>
    `,
      )
      .join("");
    return;
  }

  tbody.innerHTML = courses
    .map((course) => {
      const title = course.Title ?? course.title ?? "Untitled course";
      const enrollments = numberValue(
        course.TotalEnrollments ??
          course.Enrollments ??
          course.totalEnrollments,
      );
      const revenue = numberValue(
        course.Revenue ?? course.TotalRevenue ?? course.revenue,
      );
      return `<tr><td>${escapeHtml(title)}</td><td>${enrollments.toLocaleString()}</td><td class="earned">฿${revenue.toLocaleString()}</td></tr>`;
    })
    .join("");
}

// ============================================
// Report 2: Loyalty Points Summary
// ============================================
function renderLoyaltySummary(validPoints, bookings) {
  const tbody = document.querySelector("#loyaltySummaryTable tbody");
  if (!tbody) return;

  // ✅ FALLBACK: ถ้าไม่มีข้อมูล → ใช้ Mock
  // TODO: ลบ Fallback นี้เมื่อ Backend พร้อม
  if (!validPoints || !validPoints.length) {
    renderLoyaltySummaryFromMock();
    return;
  }

  // Group bookings by MemberID
  const bookingsByMember = {};
  (bookings || []).forEach((b) => {
    const memberId = b.MemberID ?? b.memberId;
    if (memberId == null) return;
    if (!bookingsByMember[memberId]) bookingsByMember[memberId] = [];
    bookingsByMember[memberId].push(b);
  });

  // สร้างข้อมูล Report
  const reportData = validPoints.map(({ member, points }) => {
    const memberId = member.MemberID ?? member.memberId ?? member.id;
    const name = member.Name ?? member.name ?? `Member ${memberId ?? ""}`;
    const earned = numberValue(points.TotalEarned ?? points.totalEarned);
    const redeemed = numberValue(points.TotalRedeemed ?? points.totalRedeemed);
    const balance = numberValue(
      points.Balance ?? points.balance ?? earned - redeemed,
    );
    const bookingCount = (bookingsByMember[memberId] || []).length;

    return { name, bookingCount, earned, redeemed, balance };
  });

  // Summary Cards
  const totalEarned = reportData.reduce((sum, row) => sum + row.earned, 0);
  const totalRedeemed = reportData.reduce((sum, row) => sum + row.redeemed, 0);
  const totalBalance = reportData.reduce((sum, row) => sum + row.balance, 0);

  setText("totalLoyaltyEarned", totalEarned.toLocaleString());
  setText("totalLoyaltyRedeemed", totalRedeemed.toLocaleString());
  setText("totalLoyaltyBalance", totalBalance.toLocaleString());

  // Table
  tbody.innerHTML = reportData
    .map(
      (row) => `
    <tr>
      <td><strong>${escapeHtml(row.name)}</strong></td>
      <td>${row.bookingCount}</td>
      <td class="earned">+${row.earned.toLocaleString()}</td>
      <td class="redeemed">-${row.redeemed.toLocaleString()}</td>
      <td class="balance">${row.balance.toLocaleString()}</td>
    </tr>
  `,
    )
    .join("");
}

// ============================================
// FALLBACK: Load from localStorage (remove when Backend is ready)
// ============================================
function renderLoyaltySummaryFromMock() {
  const tbody = document.querySelector("#loyaltySummaryTable tbody");
  if (!tbody) return;

  // Load from localStorage.bookings
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  if (bookings.length === 0) {
    setText("totalLoyaltyEarned", "0");
    setText("totalLoyaltyRedeemed", "0");
    setText("totalLoyaltyBalance", "0");
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-mid);">
          No loyalty points data yet — waiting for bookings.
        </td>
      </tr>
    `;
    return;
  }

  // Group by Member
  const byMember = {};
  bookings.forEach((b) => {
    const id = b.MemberID;
    if (!byMember[id]) {
      byMember[id] = {
        Name: b.MemberName || id,
        Bookings: 0,
        Earned: 0,
        Redeemed: 0,
      };
    }
    byMember[id].Bookings++;
    byMember[id].Earned += b.Points || 0;
  });

  const reportData = Object.values(byMember);

  const totalEarned = reportData.reduce((sum, row) => sum + row.Earned, 0);
  const totalRedeemed = reportData.reduce((sum, row) => sum + row.Redeemed, 0);
  const totalBalance = totalEarned - totalRedeemed;

  setText("totalLoyaltyEarned", totalEarned.toLocaleString());
  setText("totalLoyaltyRedeemed", totalRedeemed.toLocaleString());
  setText("totalLoyaltyBalance", totalBalance.toLocaleString());

  tbody.innerHTML = reportData
    .map(
      (row) => `
    <tr>
      <td><strong>${escapeHtml(row.Name)}</strong></td>
      <td>${row.Bookings}</td>
      <td class="earned">+${row.Earned.toLocaleString()}</td>
      <td class="redeemed">-${row.Redeemed.toLocaleString()}</td>
      <td class="balance">${(row.Earned - row.Redeemed).toLocaleString()}</td>
    </tr>
  `,
    )
    .join("");
}

// ==================== REPORT 1: AVAILABLE ROOMS ====================
async function loadAvailableRooms() {
  const date = document.getElementById("adminDate")?.value;
  const start = document.getElementById("adminStart")?.value;
  const end = document.getElementById("adminEnd")?.value;
  const container = document.getElementById("availableRoomsList");
  if (!container) return;

  if (!date || !start || !end) {
    alert("Please select date and start/end time.");
    return;
  }
  if (start >= end) {
    alert("End time must be later than start time.");
    return;
  }
  // ✅ FALLBACK: ถ้าไม่มี API → ใช้ Mock
  // TODO: ลบ Fallback นี้เมื่อ Backend พร้อม
  if (!window.SheSparksAPI) {
    renderAvailableRoomsFromMock(container);
    return;
  }

  container.textContent = "Loading available rooms from database…";
  try {
    const rooms = await window.SheSparksAPI.availableRooms(date, start, end);

    // ✅ FALLBACK: ถ้า API ไม่คืนค่า → ใช้ Mock
    if (!Array.isArray(rooms) || rooms.length === 0) {
      renderAvailableRoomsFromMock(container);
      return;
    }

    container.innerHTML = rooms
      .map(
        (room) => `
      <div class="room-card">
        <h3>${escapeHtml(room.RoomName ?? room.Name ?? `Room ${room.RoomID ?? ""}`)}</h3>
        <p>Capacity: ${escapeHtml(room.Capacity ?? "—")} people</p>
        <p>Studio: ${escapeHtml(room.StudioLocation ?? room.Location ?? "—")}</p>
        <p>Sport: ${escapeHtml(room.SportName ?? room.SportType ?? "—")}</p>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    // ✅ FALLBACK: ถ้า API Error → ใช้ Mock
    renderAvailableRoomsFromMock(container);
  }
}

// ============================================
// ✅ FALLBACK: Mock Data (ลบเมื่อ Backend พร้อม)
// ============================================
function renderAvailableRoomsFromMock(container) {
  container.innerHTML = MOCK_ADMIN.availableRooms
    .map(
      (r) => `
    <div class="room-card">
      <h3>${escapeHtml(r.RoomName)}</h3>
      <p>Capacity: ${r.Capacity} people</p>
      <p>Sport: ${escapeHtml(r.SportType)}</p>
    </div>
  `,
    )
    .join("");
}

// ============================================
// ADMIN TABS
// ============================================

function showTab(tab, event) {
  currentTab = tab;
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  if (event) event.target.classList.add("active");
  renderAdminContent();
}

// ==================== RENDER TAB CONTENT ====================
function renderAdminContent() {
  const content = document.getElementById("admin-content");
  if (!content) return;

  if (currentTab === "loyalty") {
    renderLoyaltySettings(content);
    return;
  }

  const dataMap = {
    studios: {
      data: STUDIOS,
      name: (x) => x.Name,
      extra: (x) => {
        const sports = getStudioSports(x.StudioCode)
          .map((s) => s.SportName)
          .join(", ");
        return `${x.Location} • ${sports || "No sports"}`;
      },
    },
    sports: {
      data: SPORT_TYPES,
      name: (x) => x.SportName,
      extra: (x) => `Intensity: ${x.IntensityLevel}`,
    },
    rooms: {
      data: ROOMS,
      name: (x) => x.RoomName,
      extra: (x) =>
        `${getStudioName(x.StudioCode)} • ${getSportName(x.SportTypeID)} • ${x.Capacity} people`,
    },
    courses: {
      data: COURSES,
      name: (x) => x.Title,
      extra: (x) => {
        const prereq = x.PrerequisiteCourseID
          ? ` ← ${getCourseName(x.PrerequisiteCourseID)}`
          : "";
        return `${x.Level} • ${getStudioName(x.StudioCode)} • ${getRoomName(x.RoomID)}${prereq}`;
      },
    },
    trainers: {
      data: TRAINERS,
      name: (x) => x.Name,
      extra: (x) =>
        `${getSportName(x.SportTypeID)} • ${getStudioName(x.StudioCode)} • ${x.Phone}`,
    },
    rewards: {
      data: REWARDS,
      name: (x) => x.Name,
      extra: (x) => `${x.PointCost} pts • ${x.Category} • ฿${x.Value}`,
    },
    equipments: {
      data: EQUIPMENTS,
      name: (x) => x.Name,
      extra: (x) =>
        `${getSportName(x.SportTypeID)} • ${getStudioName(x.StudioCode)} • ${x.Condition}`,
    },
    // loyalty: {
    //   data: LOYALTY_PROGRAM,
    //   name: (x) => x.Name,
    //   extra: (x) => `${x.PointsRequired} points • ${x.Benefit}`,
    // },
  };

  const config = dataMap[currentTab];
  if (!config) return;

  const data = config.data;

  content.innerHTML = `
  <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
    <button class="btn-primary" onclick="openAddForm()">+ Add New</button>
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
      ${data
        .map(
          (item) => `
        <tr>
          <td>
            ${
              item.ImageURL
                ? `<img src="${item.ImageURL}" class="table-thumb" alt="${config.name(item)}" onerror="this.style.display='none'">`
                : `<div class="no-image">No img</div>`
            }
          </td>
          <td><strong>${config.name(item)}</strong></td>
          <td>
            ${
              currentTab === "equipments"
                ? `${getSportName(item.SportTypeID)} • ${getStudioName(item.StudioCode)}
                 <br><span class="condition-badge ${item.Condition.toLowerCase()}">${item.Condition}</span>`
                : config.extra(item)
            }
          </td>
          <td style="text-align: right;">
            <button class="action-btn btn-edit" onclick='openEditForm(${JSON.stringify(item).replace(/'/g, "&#39;")})'>Edit</button>
            <button class="action-btn btn-delete" onclick='deleteItem(${JSON.stringify(item).replace(/'/g, "&#39;")})'>Delete</button>
          </td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>
`;
}

// ==================== RECOMMEND SETTINGS ====================
function renderRecommendSettings(content) {
  const settings = JSON.parse(localStorage.getItem("recommendSettings")) || {
    studios: true,
    sports: true,
    courses: true,
    rewards: true,
  };

  content.innerHTML = `
    <h3 style="color: var(--pink-deep); margin-bottom: 8px;">Recommendation Settings</h3>
    <p style="color: var(--text-mid); font-size: 0.9rem; margin-bottom: 16px;">
      เลือกสิ่งที่ต้องการให้แสดงในหน้า Home
    </p>
    <div class="recommend-setting">
      <label><input type="checkbox" id="rec-studios" ${settings.studios ? "checked" : ""}> Show Recommended Studios</label>
      <label><input type="checkbox" id="rec-sports" ${settings.sports ? "checked" : ""}> Show Recommended Sports</label>
      <label><input type="checkbox" id="rec-courses" ${settings.courses ? "checked" : ""}> Show Recommended Courses</label>
      <label><input type="checkbox" id="rec-rewards" ${settings.rewards ? "checked" : ""}> Show Recommended Rewards</label>
    </div>
    <button class="btn-primary" onclick="saveRecommendSettings()">Save Settings</button>
  `;
}

function saveRecommendSettings() {
  const settings = {
    studios: document.getElementById("rec-studios").checked,
    sports: document.getElementById("rec-sports").checked,
    courses: document.getElementById("rec-courses").checked,
    rewards: document.getElementById("rec-rewards").checked,
  };
  localStorage.setItem("recommendSettings", JSON.stringify(settings));
  alert("✅ บันทึกการตั้งค่าแล้ว");
}

// ==================== LOYALTY SETTINGS ====================
function renderLoyaltySettings(content) {
  const rules = JSON.parse(localStorage.getItem("loyaltyRules")) || {
    pointsPerHour: 30,
    pointsPerTrainer: 50,
    pointsPerEquipment: 20,
    pointsPerCapacity: 2,
  };

  content.innerHTML = `
    <h3 style="color: var(--pink-deep); margin-bottom: 8px;">Loyalty Points Settings</h3>
    <p style="color: var(--text-mid); font-size: 0.9rem; margin-bottom: 24px;">
      กำหนดคะแนนที่สมาชิกจะได้รับจากการจองแต่ละประเภท
    </p>

    <div class="loyalty-settings">
      <div class="loyalty-item">
        <label>Points per Hour (Room)</label>
        <div class="loyalty-input-wrap">
          <input type="number" id="points-per-hour" value="${rules.pointsPerHour}" min="0" />
          <span class="loyalty-unit">pts / ชั่วโมง</span>
        </div>
      </div>

      <div class="loyalty-item">
        <label>Points per Trainer</label>
        <div class="loyalty-input-wrap">
          <input type="number" id="points-per-trainer" value="${rules.pointsPerTrainer}" min="0" />
          <span class="loyalty-unit">pts / คน</span>
        </div>
      </div>

      <div class="loyalty-item">
        <label>Points per Equipment</label>
        <div class="loyalty-input-wrap">
          <input type="number" id="points-per-equipment" value="${rules.pointsPerEquipment}" min="0" />
          <span class="loyalty-unit">pts / ชิ้น</span>
        </div>
      </div>

      <div class="loyalty-item">
        <label>Points per Capacity</label>
        <div class="loyalty-input-wrap">
          <input type="number" id="points-per-capacity" value="${rules.pointsPerCapacity}" min="0" />
          <span class="loyalty-unit">pts / คน</span>
        </div>
      </div>
    </div>

    <div style="background: var(--pink-bg); padding: 16px; border-radius: var(--radius-sm); margin: 20px 0;">
      <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 8px;">
        <strong>ตัวอย่างการคำนวณ:</strong>
      </p>
      <p style="font-size: 0.85rem; color: var(--text-dark);">
        จอง 2 ชม. + Trainer + Equipment 2 ชิ้น + Capacity 5 คน
        = <strong id="loyalty-example" style="color: var(--pink-deep);">- pts</strong>
      </p>
    </div>

    <button class="btn-primary" onclick="saveLoyaltySettings()">Save Settings</button>
  `;

  // อัปเดตตัวอย่างเมื่อเปลี่ยนค่า
  const inputs = [
    "points-per-hour",
    "points-per-trainer",
    "points-per-equipment",
    "points-per-capacity",
  ];
  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateLoyaltyExample);
  });

  updateLoyaltyExample();
}

function updateLoyaltyExample() {
  const pointsPerHour =
    parseInt(document.getElementById("points-per-hour")?.value) || 0;
  const pointsPerTrainer =
    parseInt(document.getElementById("points-per-trainer")?.value) || 0;
  const pointsPerEquipment =
    parseInt(document.getElementById("points-per-equipment")?.value) || 0;
  const pointsPerCapacity =
    parseInt(document.getElementById("points-per-capacity")?.value) || 0;

  // ตัวอย่าง: 2 ชม. + Trainer + 2 Equipment + 5 คน
  const example =
    2 * pointsPerHour +
    pointsPerTrainer +
    2 * pointsPerEquipment +
    5 * pointsPerCapacity;

  const el = document.getElementById("loyalty-example");
  if (el) el.textContent = `${example} pts`;
}

function saveLoyaltySettings() {
  const rules = {
    pointsPerHour:
      parseInt(document.getElementById("points-per-hour").value) || 0,
    pointsPerTrainer:
      parseInt(document.getElementById("points-per-trainer").value) || 0,
    pointsPerEquipment:
      parseInt(document.getElementById("points-per-equipment").value) || 0,
    pointsPerCapacity:
      parseInt(document.getElementById("points-per-capacity").value) || 0,
  };

  localStorage.setItem("loyaltyRules", JSON.stringify(rules));
  alert("✅ บันทึกการตั้งค่า Loyalty Points แล้ว");
}

// ============================================
// MODAL FORM
// ============================================

function openAddForm() {
  editingId = null;
  document.getElementById("modal-title").textContent =
    "Add New " + capitalize(currentTab);
  renderModalFields(null);
  document.getElementById("admin-modal").classList.add("active");
}

function openEditForm(item) {
  editingId = item;
  document.getElementById("modal-title").textContent =
    "Edit " + capitalize(currentTab);
  renderModalFields(item);
  document.getElementById("admin-modal").classList.add("active");
}

function closeModal() {
  document.getElementById("admin-modal").classList.remove("active");
  editingId = null;
}

// ==================== RENDER MODAL FIELDS ====================
function renderModalFields(item) {
  const fields = document.getElementById("modal-fields");
  const isEdit = !!item;

  let html = "";

  switch (currentTab) {
    case "studios":
      html = renderStudioFields(item, isEdit);
      break;
    case "sports":
      html = renderSportFields(item, isEdit);
      break;
    case "rooms":
      html = renderRoomFields(item, isEdit);
      break;
    case "courses":
      html = renderCourseFields(item, isEdit);
      break;
    case "trainers":
      html = renderTrainerFields(item, isEdit);
      break;
    case "rewards":
      html = renderRewardFields(item, isEdit);
      break;
    case "equipments":
      html = renderEquipmentFields(item, isEdit);
      break;
  }

  fields.innerHTML = html;

  // Bind Submit
  const form = document.getElementById("admin-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    saveItem();
  };
}

// ==================== STUDIO FIELDS ====================
function renderStudioFields(item, isEdit) {
  const sports = item
    ? getStudioSports(item.StudioCode).map((s) => s.SportTypeID)
    : [];
  return `
    <div class="form-group">
      <label>Studio Code</label>
      <input type="text" name="StudioCode" value="${item?.StudioCode || ""}" placeholder="ST001" ${isEdit ? "disabled" : ""}>
    </div>
    <div class="form-group">
      <label>Name</label>
      <input type="text" name="Name" value="${item?.Name || ""}" placeholder="SheSparks Silom">
    </div>
    <div class="form-group">
      <label>Location</label>
      <input type="text" name="Location" value="${item?.Location || ""}" placeholder="Silom, Bangkok">
    </div>
    <div class="form-group">
      <label>Capacity</label>
      <input type="number" name="Capacity" value="${item?.Capacity || ""}" placeholder="50">
    </div>
    <div class="form-group">
      <label>Sports (เลือกได้หลายอย่าง)</label>
      <div class="checkbox-group">
        ${SPORT_TYPES.map(
          (s) => `
          <label class="checkbox-item">
            <input type="checkbox" name="SportTypeIDs" value="${s.SportTypeID}" ${sports.includes(s.SportTypeID) ? "checked" : ""}>
            ${s.SportName}
          </label>
        `,
        ).join("")}
      </div>
    </div>
    <div class="form-group">
      <label>Image URL</label>
      <input type="url" name="ImageURL" value="${item?.ImageURL || ""}" placeholder="https://...">
    </div>
  `;
}

// ==================== SPORT FIELDS ====================
function renderSportFields(item, isEdit) {
  return `
    <div class="form-group">
      <label>Sport Type ID</label>
      <input type="number" name="SportTypeID" value="${item?.SportTypeID || ""}" placeholder="1" ${isEdit ? "disabled" : ""}>
    </div>
    <div class="form-group">
      <label>Sport Name</label>
      <input type="text" name="SportName" value="${item?.SportName || ""}" placeholder="Yoga">
    </div>
    <div class="form-group">
      <label>Intensity Level</label>
      <select name="IntensityLevel">
        ${["Low", "Medium", "High"].map((opt) => `<option value="${opt}" ${item?.IntensityLevel === opt ? "selected" : ""}>${opt}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Image URL</label>
      <input type="url" name="ImageURL" value="${item?.ImageURL || ""}" placeholder="https://...">
    </div>
  `;
}

// ==================== ROOM FIELDS ====================
function renderRoomFields(item, isEdit) {
  return `
    <div class="form-group">
      <label>Room ID</label>
      <input type="number" name="RoomID" value="${item?.RoomID || ""}" placeholder="1" ${isEdit ? "disabled" : ""}>
    </div>
    <div class="form-group">
      <label>Room Name</label>
      <input type="text" name="RoomName" value="${item?.RoomName || ""}" placeholder="Yoga Room A">
    </div>
    <div class="form-group">
      <label>Studio</label>
      <select name="StudioCode">
        <option value="">-- เลือก Studio --</option>
        ${STUDIOS.map((s) => `<option value="${s.StudioCode}" ${item?.StudioCode === s.StudioCode ? "selected" : ""}>${s.Name} (${s.Location})</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Sport Type</label>
      <select name="SportTypeID">
        <option value="">-- เลือก Sport --</option>
        ${SPORT_TYPES.map((s) => `<option value="${s.SportTypeID}" ${item?.SportTypeID === s.SportTypeID ? "selected" : ""}>${s.SportName}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Capacity</label>
      <input type="number" name="Capacity" value="${item?.Capacity || ""}" placeholder="20">
    </div>
    <div class="form-group">
      <label>Image URL</label>
      <input type="url" name="ImageURL" value="${item?.ImageURL || ""}" placeholder="https://...">
    </div>
  `;
}

// ==================== COURSE FIELDS ====================
function renderCourseFields(item, isEdit) {
  return `
    <div class="form-group">
      <label>Course ID</label>
      <input type="number" name="CourseID" value="${item?.CourseID || ""}" placeholder="1" ${isEdit ? "disabled" : ""}>
    </div>
    <div class="form-group">
      <label>Title</label>
      <input type="text" name="Title" value="${item?.Title || ""}" placeholder="Basic Yoga">
    </div>
    <div class="form-group">
      <label>Level</label>
      <select name="Level">
        ${["Beginner", "Intermediate", "Advanced"].map((opt) => `<option value="${opt}" ${item?.Level === opt ? "selected" : ""}>${opt}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Duration (Hours)</label>
      <input type="number" name="DurationHours" value="${item?.DurationHours || ""}" placeholder="10">
    </div>
    <div class="form-group">
      <label>Standard Fee (฿)</label>
      <input type="number" name="StandardFee" value="${item?.StandardFee || ""}" placeholder="1500">
    </div>
    <div class="form-group">
      <label>Studio</label>
      <select name="StudioCode" id="course-studio">
        <option value="">-- เลือก Studio --</option>
        ${STUDIOS.map((s) => `<option value="${s.StudioCode}" ${item?.StudioCode === s.StudioCode ? "selected" : ""}>${s.Name}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Room</label>
      <select name="RoomID" id="course-room">
        <option value="">-- เลือก Room --</option>
        ${ROOMS.map((r) => `<option value="${r.RoomID}" ${item?.RoomID === r.RoomID ? "selected" : ""}>${r.RoomName} (${getStudioName(r.StudioCode)})</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Trainer</label>
      <select name="TrainerID">
        <option value="">-- เลือก Trainer --</option>
        ${TRAINERS.map((t) => `<option value="${t.TrainerID}" ${item?.TrainerID === t.TrainerID ? "selected" : ""}>${t.Name} (${getSportName(t.SportTypeID)})</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Prerequisite Course (ถ้ามี)</label>
      <select name="PrerequisiteCourseID">
        <option value="">-- ไม่มี --</option>
        ${COURSES.filter((c) => !item || c.CourseID !== item.CourseID)
          .map(
            (c) =>
              `<option value="${c.CourseID}" ${item?.PrerequisiteCourseID === c.CourseID ? "selected" : ""}>${c.Title} (${c.Level})</option>`,
          )
          .join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Image URL</label>
      <input type="url" name="ImageURL" value="${item?.ImageURL || ""}" placeholder="https://...">
    </div>
  `;
}

// ==================== TRAINER FIELDS ====================
function renderTrainerFields(item, isEdit) {
  return `
    <div class="form-group">
      <label>Trainer ID</label>
      <input type="number" name="TrainerID" value="${item?.TrainerID || ""}" placeholder="1" ${isEdit ? "disabled" : ""}>
    </div>
    <div class="form-group">
      <label>Name</label>
      <input type="text" name="Name" value="${item?.Name || ""}" placeholder="Coach Mali">
    </div>
    <div class="form-group">
      <label>Phone</label>
      <input type="text" name="Phone" value="${item?.Phone || ""}" placeholder="081-111-1111">
    </div>
    <div class="form-group">
      <label>Sport Type</label>
      <select name="SportTypeID">
        <option value="">-- เลือก Sport --</option>
        ${SPORT_TYPES.map((s) => `<option value="${s.SportTypeID}" ${item?.SportTypeID === s.SportTypeID ? "selected" : ""}>${s.SportName}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Studio</label>
      <select name="StudioCode">
        <option value="">-- เลือก Studio --</option>
        ${STUDIOS.map((s) => `<option value="${s.StudioCode}" ${item?.StudioCode === s.StudioCode ? "selected" : ""}>${s.Name}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Qualification</label>
      <input type="text" name="Qualification" value="${item?.Qualification || ""}" placeholder="Certified Yoga Instructor">
    </div>
    <div class="form-group">
      <label>Image URL</label>
      <input type="url" name="ImageURL" value="${item?.ImageURL || ""}" placeholder="https://...">
    </div>
  `;
}

// ==================== REWARD FIELDS ====================
function renderRewardFields(item, isEdit) {
  return `
    <div class="form-group">
      <label>Reward ID</label>
      <input type="number" name="RewardID" value="${item?.RewardID || ""}" placeholder="1" ${isEdit ? "disabled" : ""}>
    </div>
    <div class="form-group">
      <label>Name</label>
      <input type="text" name="Name" value="${item?.Name || ""}" placeholder="Spa Voucher 500 THB">
    </div>
    <div class="form-group">
      <label>Point Cost</label>
      <input type="number" name="PointCost" value="${item?.PointCost || ""}" placeholder="500">
    </div>
    <div class="form-group">
      <label>Value (฿)</label>
      <input type="number" name="Value" value="${item?.Value || ""}" placeholder="500">
    </div>
    <div class="form-group">
      <label>Category</label>
      <select name="Category">
        ${["Beauty", "Sports", "Discount"].map((opt) => `<option value="${opt}" ${item?.Category === opt ? "selected" : ""}>${opt}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Image URL</label>
      <input type="url" name="ImageURL" value="${item?.ImageURL || ""}" placeholder="https://...">
    </div>
  `;
}

// ==================== EQUIPMENT FIELDS ====================
function renderEquipmentFields(item, isEdit) {
  return `
    <div class="form-group">
      <label>Equipment ID</label>
      <input type="number" name="EquipmentID" value="${item?.EquipmentID || ""}" placeholder="1" ${isEdit ? "disabled" : ""}>
    </div>
    <div class="form-group">
      <label>Name</label>
      <input type="text" name="Name" value="${item?.Name || ""}" placeholder="Yoga Mat Pro">
    </div>
    <div class="form-group">
      <label>Sport Type</label>
      <select name="SportTypeID">
        <option value="">-- เลือก Sport --</option>
        ${SPORT_TYPES.map((s) => `<option value="${s.SportTypeID}" ${item?.SportTypeID === s.SportTypeID ? "selected" : ""}>${s.SportName}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Studio</label>
      <select name="StudioCode">
        <option value="">-- เลือก Studio --</option>
        ${STUDIOS.map((s) => `<option value="${s.StudioCode}" ${item?.StudioCode === s.StudioCode ? "selected" : ""}>${s.Name}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Condition</label>
      <select name="Condition">
        ${["Good", "Fair", "Damaged", "Maintenance"].map((opt) => `<option value="${opt}" ${item?.Condition === opt ? "selected" : ""}>${opt}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Late Fee (฿)</label>
      <input type="number" name="LateFee" value="${item?.LateFee || ""}" placeholder="50">
    </div>
    <div class="form-group">
      <label>Image URL</label>
      <input type="url" name="ImageURL" value="${item?.ImageURL || ""}" placeholder="https://...">
    </div>
  `;
}

// ==================== SAVE ITEM ====================
function saveItem() {
  const form = document.getElementById("admin-form");
  const formData = new FormData(form);
  const newData = {};

  // Handle Multi-select (Sports)
  if (currentTab === "studios") {
    const sportIDs = formData.getAll("SportTypeIDs").map(Number);
    newData.SportTypeIDs = sportIDs;
  }

  formData.forEach((value, key) => {
    if (key !== "SportTypeIDs") {
      newData[key] = value;
    }
  });

  // Convert Numbers
  [
    "Capacity",
    "DurationHours",
    "StandardFee",
    "PointCost",
    "Value",
    "SportTypeID",
    "RoomID",
    "CourseID",
    "TrainerID",
    "RewardID",
    "PrerequisiteCourseID",
  ].forEach((k) => {
    if (newData[k] && newData[k] !== "") newData[k] = Number(newData[k]);
    if (newData[k] === "") newData[k] = null;
  });

  // Handle Studio ↔ SportType (Bridge Table)
  if (currentTab === "studios" && newData.SportTypeIDs) {
    const studioCode = newData.StudioCode || editingId?.StudioCode;

    // ลบเดิม
    for (let i = STUDIO_SPORT_TYPE.length - 1; i >= 0; i--) {
      if (STUDIO_SPORT_TYPE[i].StudioCode === studioCode) {
        STUDIO_SPORT_TYPE.splice(i, 1);
      }
    }

    // เพิ่มใหม่
    newData.SportTypeIDs.forEach((sportID) => {
      STUDIO_SPORT_TYPE.push({ StudioCode: studioCode, SportTypeID: sportID });
    });

    delete newData.SportTypeIDs;
  }

  if (editingId) {
    // EDIT
    const dataArray = getCurrentDataArray();
    const index = dataArray.findIndex((x) => isSameItem(x, editingId));
    if (index >= 0) {
      dataArray[index] = { ...editingId, ...newData };
      alert("✅ แก้ไขข้อมูลสำเร็จ (Prototype)");
    }
  } else {
    // ADD
    const dataArray = getCurrentDataArray();
    dataArray.push(newData);
    alert("✅ เพิ่มข้อมูลสำเร็จ (Prototype)");
  }

  // TODO: call API POST/PUT
  closeModal();
  renderAdminContent();
}

// ==================== DELETE ITEM ====================
function deleteItem(item) {
  const name =
    item.Name || item.RoomName || item.Title || item.SportName || "this item";
  if (!confirm(`Delete "${name}"?`)) return;

  const dataArray = getCurrentDataArray();
  const index = dataArray.findIndex((x) => isSameItem(x, item));
  if (index >= 0) {
    dataArray.splice(index, 1);
    alert("✅ ลบข้อมูลสำเร็จ (Prototype)");
  }

  renderAdminContent();
}

// ==================== HELPERS ====================
function getCurrentDataArray() {
  const map = {
    studios: STUDIOS,
    sports: SPORT_TYPES,
    rooms: ROOMS,
    courses: COURSES,
    trainers: TRAINERS,
    rewards: REWARDS,
    equipments: EQUIPMENTS,
  };
  return map[currentTab];
}

function isSameItem(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
