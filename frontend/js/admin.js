/* ============================================
   admin.js - Admin Dashboard + CRUD
   FEATURES:
   - Reports 1, 2, 3 (from API + localStorage fallback)
   - CRUD: Studios, Sports, Rooms, Courses, Trainers, Equipment, Rewards
   - Loyalty Settings
   ============================================ */

// ==================== STATE ====================
let currentTab = "studios";
let editingId = null;

// ==================== INIT ====================
window.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "admin") {
    alert("Please login as Admin");
    window.location.href = "/views/login.html";
    return;
  }
  loadDashboard();
});

// ==================== LOAD DASHBOARD ====================
async function loadDashboard() {
  const api = window.SheSparksAPI;

  if (!api) {
    showDashboardError(
      "API client was not loaded. Add /js/api.js before /js/admin.js.",
    );
    renderAdminContent();
    return;
  }

  // Loading states
  setText("totalMembers", "…");
  setText("totalBookings", "…");
  setText("totalRevenue", "…");
  setText("totalPointsRedeemed", "…");
  setTableMessage("#popularCoursesTable tbody", "Loading course report…");
  setTableMessage("#loyaltySummaryTable tbody", "Loading loyalty points…");

  // ==================== FETCH FROM API ====================
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

  // Summary Cards
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

  // ==================== REPORT 3: Popular Courses ====================
  if (coursesResult.status === "fulfilled") {
    renderPopularCourses(courses);
  } else {
    setTableMessage(
      "#popularCoursesTable tbody",
      "Unable to load courses: " + errorMessage(coursesResult.reason),
    );
  }

  // ==================== REPORT 2: Loyalty Points Summary ====================
  if (membersResult.status === "fulfilled" && members.length > 0) {
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
  } else {
    // ถ้า API ไม่มีข้อมูล → ใช้ localStorage.bookings
    setText("totalPointsRedeemed", "—");
    renderLoyaltySummary([], []);
  }

  // ==================== MANAGE CONTENT ====================
  renderAdminContent();
}

// ==================== HELPERS ====================
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
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:20px;color:var(--text-mid);">${escapeHtml(message)}</td></tr>`;
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

// ============================================
// REPORT 3: POPULAR COURSES
// ============================================
function renderPopularCourses(courses) {
  const tbody = document.querySelector("#popularCoursesTable tbody");
  if (!tbody) return;

  if (!courses.length) {
    tbody.innerHTML =
      '<tr><td colspan="3" style="text-align:center;padding:20px;color:var(--text-mid);">No course records found.</td></tr>';
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
// REPORT 2: LOYALTY POINTS SUMMARY
// ============================================
function renderLoyaltySummary(validPoints, bookings) {
  const tbody = document.querySelector("#loyaltySummaryTable tbody");
  if (!tbody) return;

  // ถ้าไม่มีข้อมูลจาก API → ใช้ localStorage.bookings
  if (!validPoints || !validPoints.length) {
    renderLoyaltyFromLocalStorage();
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

  // Build Report Data
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
// FALLBACK: Loyalty Summary from localStorage
// (ใช้เมื่อ API ไม่มีข้อมูล)
// ============================================
function renderLoyaltyFromLocalStorage() {
  const tbody = document.querySelector("#loyaltySummaryTable tbody");
  if (!tbody) return;

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  if (bookings.length === 0) {
    setText("totalLoyaltyEarned", "0");
    setText("totalLoyaltyRedeemed", "0");
    setText("totalLoyaltyBalance", "0");
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:40px;color:var(--text-mid);">
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

// ============================================
// REPORT 1: AVAILABLE ROOMS
// ============================================
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

  if (!window.SheSparksAPI) {
    container.textContent =
      "API client is unavailable. Please check /js/api.js.";
    return;
  }

  container.textContent = "Loading available rooms from database…";

  try {
    const rooms = await window.SheSparksAPI.availableRooms(date, start, end);

    if (!Array.isArray(rooms) || rooms.length === 0) {
      container.innerHTML =
        '<p style="text-align:center;padding:20px;color:var(--text-mid);">No available rooms found.</p>';
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
    container.innerHTML = `<p style="text-align:center;padding:20px;color:var(--text-mid);">Could not load rooms: ${escapeHtml(errorMessage(error))}</p>`;
  }
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
    members: {
      data: USERS.filter((u) => u.role === "member"),
      name: (x) => x.name,
      extra: (x) => {
        const level = x.memberLevel || "Silver";
        const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
        const count = bookings.filter((b) => b.MemberID === x.id).length;
        return `Level: ${level} • Bookings: ${count}`;
      },
    },
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
      Set the points members earn from each type of booking.
    </p>

    <div class="loyalty-settings">
      <div class="loyalty-item">
        <label>Points per Hour (Room)</label>
        <div class="loyalty-input-wrap">
          <input type="number" id="points-per-hour" value="${rules.pointsPerHour}" min="0" />
          <span class="loyalty-unit">pts / hour</span>
        </div>
      </div>

      <div class="loyalty-item">
        <label>Points per Trainer</label>
        <div class="loyalty-input-wrap">
          <input type="number" id="points-per-trainer" value="${rules.pointsPerTrainer}" min="0" />
          <span class="loyalty-unit">pts / trainer</span>
        </div>
      </div>

      <div class="loyalty-item">
        <label>Points per Equipment</label>
        <div class="loyalty-input-wrap">
          <input type="number" id="points-per-equipment" value="${rules.pointsPerEquipment}" min="0" />
          <span class="loyalty-unit">pts / item</span>
        </div>
      </div>

      <div class="loyalty-item">
        <label>Points per Capacity</label>
        <div class="loyalty-input-wrap">
          <input type="number" id="points-per-capacity" value="${rules.pointsPerCapacity}" min="0" />
          <span class="loyalty-unit">pts / person</span>
        </div>
      </div>
    </div>

    <div style="background: var(--pink-bg); padding: 16px; border-radius: var(--radius-sm); margin: 20px 0;">
      <p style="font-size: 0.85rem; color: var(--text-mid); margin-bottom: 8px;">
        <strong>Example calculation:</strong>
      </p>
      <p style="font-size: 0.85rem; color: var(--text-dark);">
        Book 2 hrs + Trainer + 2 Equipment + 5 people
        = <strong id="loyalty-example" style="color: var(--pink-deep);">- pts</strong>
      </p>
    </div>

    <button class="btn-primary" onclick="saveLoyaltySettings()">Save Settings</button>
  `;

  // Update example on input change
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
  alert("✅ Loyalty Points settings saved");
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
    case "members":
      html = renderMemberFields(item, isEdit);
      break;
  }

  fields.innerHTML = html;

  const form = document.getElementById("admin-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    saveItem();
  };
}

// ==================== FIELD RENDERERS ====================
function renderMemberFields(item, isEdit) {
  return `
    <div class="form-group">
      <label>Member ID</label>
      <input type="text" name="id" value="${item?.id || ""}" disabled>
      <input type="hidden" name="id" value="${item?.id || ""}">
    </div>
    <div class="form-group">
      <label>Name</label>
      <input type="text" name="name" value="${item?.name || ""}">
    </div>
    <div class="form-group">
      <label>Email</label>
      <input type="email" name="email" value="${item?.email || ""}">
    </div>
    <div class="form-group">
      <label>Member Level (Demo Mode)</label>
      <select name="memberLevel">
        ${["Silver", "Gold", "Platinum"].map((opt) => `<option value="${opt}" ${item?.memberLevel === opt ? "selected" : ""}>${opt}</option>`).join("")}
      </select>
      <small style="color: var(--text-mid); font-size: 0.8rem;">Admin can override Member Level for demo</small>
    </div>
  `;
}

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
      <input type="text" name="Name" value="${item?.Name || ""}" placeholder="SheSparks Nimman">
    </div>
    <div class="form-group">
      <label>Location</label>
      <input type="text" name="Location" value="${item?.Location || ""}" placeholder="Nimman, Chiang Mai">
    </div>
    <div class="form-group">
      <label>Capacity</label>
      <input type="number" name="Capacity" value="${item?.Capacity || ""}" placeholder="50">
    </div>
    <div class="form-group">
      <label>Sports (multi-select)</label>
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
        <option value="">-- Select Studio --</option>
        ${STUDIOS.map((s) => `<option value="${s.StudioCode}" ${item?.StudioCode === s.StudioCode ? "selected" : ""}>${s.Name} (${s.Location})</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Sport Type</label>
      <select name="SportTypeID">
        <option value="">-- Select Sport --</option>
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
      <select name="StudioCode">
        <option value="">-- Select Studio --</option>
        ${STUDIOS.map((s) => `<option value="${s.StudioCode}" ${item?.StudioCode === s.StudioCode ? "selected" : ""}>${s.Name}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Room</label>
      <select name="RoomID">
        <option value="">-- Select Room --</option>
        ${ROOMS.map((r) => `<option value="${r.RoomID}" ${item?.RoomID === r.RoomID ? "selected" : ""}>${r.RoomName} (${getStudioName(r.StudioCode)})</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Trainer</label>
      <select name="TrainerID">
        <option value="">-- Select Trainer --</option>
        ${TRAINERS.map((t) => `<option value="${t.TrainerID}" ${item?.TrainerID === t.TrainerID ? "selected" : ""}>${t.Name} (${getSportName(t.SportTypeID)})</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Prerequisite Course (optional)</label>
      <select name="PrerequisiteCourseID">
        <option value="">-- None --</option>
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
        <option value="">-- Select Sport --</option>
        ${SPORT_TYPES.map((s) => `<option value="${s.SportTypeID}" ${item?.SportTypeID === s.SportTypeID ? "selected" : ""}>${s.SportName}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Studio</label>
      <select name="StudioCode">
        <option value="">-- Select Studio --</option>
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
        <option value="">-- Select Sport --</option>
        ${SPORT_TYPES.map((s) => `<option value="${s.SportTypeID}" ${item?.SportTypeID === s.SportTypeID ? "selected" : ""}>${s.SportName}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Studio</label>
      <select name="StudioCode">
        <option value="">-- Select Studio --</option>
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

  // Handle multi-select for Studios
  if (currentTab === "studios") {
    const sportIDs = formData.getAll("SportTypeIDs").map(Number);
    newData.SportTypeIDs = sportIDs;
  }

  formData.forEach((value, key) => {
    if (key !== "SportTypeIDs") {
      newData[key] = value;
    }
  });

  // Convert numbers
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

    // Remove old
    for (let i = STUDIO_SPORT_TYPE.length - 1; i >= 0; i--) {
      if (STUDIO_SPORT_TYPE[i].StudioCode === studioCode) {
        STUDIO_SPORT_TYPE.splice(i, 1);
      }
    }

    // Add new
    newData.SportTypeIDs.forEach((sportID) => {
      STUDIO_SPORT_TYPE.push({ StudioCode: studioCode, SportTypeID: sportID });
    });

    delete newData.SportTypeIDs;
  }

  if (editingId) {
    // EDIT
    if (currentTab === "members") {
      // Update member in USERS array
      const user = USERS.find(
        (u) => u.id === newData.id || u.id === editingId.id,
      );
      if (user) {
        user.name = newData.name || user.name;
        user.email = newData.email || user.email;
        user.memberLevel = newData.memberLevel || user.memberLevel;

        // Save to localStorage
        const overrides =
          JSON.parse(localStorage.getItem("memberLevelOverrides")) || {};
        overrides[user.id] = user.memberLevel;
        localStorage.setItem("memberLevelOverrides", JSON.stringify(overrides));

        alert("✅ Member updated (Demo Mode)");
      }
    } else {
      // Other tabs
      const dataArray = getCurrentDataArray();
      const index = dataArray.findIndex((x) => isSameItem(x, editingId));
      if (index >= 0) {
        dataArray[index] = { ...editingId, ...newData };
        alert("✅ Item updated (Prototype)");
      }
    }
  } else {
    // ADD
    const dataArray = getCurrentDataArray();
    dataArray.push(newData);
    alert("✅ Item added (Prototype)");
  }

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
    alert("✅ Item deleted (Prototype)");
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
    members: USERS,
  };
  return map[currentTab];
}

function isSameItem(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// SIDEBAR NAVIGATION (Smooth Scroll + Active)
// ============================================
function scrollToSection(sectionId, event) {
  if (event) event.preventDefault();

  const section = document.getElementById(sectionId);
  if (!section) return;

  // Smooth scroll
  section.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  // Update active state
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.classList.remove("active");
  });
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  }
}

// ============================================
// ACTIVE HIGHLIGHT ON SCROLL
// ============================================
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll(".admin-section");
  const navLinks = document.querySelectorAll(".sidebar-link");

  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentSection}`) {
      link.classList.add("active");
    }
  });
});
