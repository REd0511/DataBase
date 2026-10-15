/* ============================================
   admin.js - Admin Dashboard (API Connected)
   ============================================ */

let currentTab = "studios";
let editingId = null;

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
  await loadDashboard();
});

async function loadDashboard() {
  const api = window.SheSparksAPI;
  if (!api) {
    showDashboardError("API client was not loaded.");
    return;
  }

  setText("totalMembers", "…");
  setText("totalBookings", "…");
  setText("totalRevenue", "…");
  setText("totalPointsRedeemed", "…");
  setTableMessage("#popularCoursesTable tbody", "Loading course report…");
  setTableMessage("#loyaltySummaryTable tbody", "Loading loyalty points…");

  try {
    const [members, bookings, revenueRows, courses] = await Promise.all([
      api.members(),
      api.bookings(),
      api.reports.revenue(),
      api.reports.courses()
    ]);

    setText("totalMembers", members.length.toLocaleString());
    setText("totalBookings", bookings.length.toLocaleString());

    const totalRevenue = revenueRows.reduce((sum, row) => sum + Number(row.TotalRevenue || 0), 0);
    setText("totalRevenue", "฿" + totalRevenue.toLocaleString());

    renderPopularCourses(courses);

    if (members.length > 0) {
      const pointPromises = members.map(async (member) => {
        try {
          const points = await api.memberPoints(member.MemberID);
          return { member, points };
        } catch {
          return null;
        }
      });

      const pointResults = await Promise.all(pointPromises);
      const validPoints = pointResults.filter((p) => p !== null);

      const redeemedTotal = validPoints.reduce(
        (sum, item) => sum + Number(item.points.TotalRedeemed || 0),
        0
      );
      setText("totalPointsRedeemed", redeemedTotal.toLocaleString());

      renderLoyaltySummary(validPoints, bookings);
    }

    dbStudios = await api.studios();
    dbSports = await api.sports();
    dbRooms = await api.rooms();
    dbCourses = await api.courses();
    dbTrainers = await api.trainers();
    dbRewards = await api.rewards();
    dbEquipments = await api.get('/equipments');
    dbMembers = members;

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
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:20px;color:var(--text-mid);">${message}</td></tr>`;
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
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
// REPORT 3
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
    if (enrollB !== enrollA) return enrollB - enrollA;

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
// REPORT 2
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
      earned,
      redeemed,
      balance: earned - redeemed,
    };
  });

  setText("totalLoyaltyEarned", reportData.reduce((s, r) => s + r.earned, 0).toLocaleString());
  setText("totalLoyaltyRedeemed", reportData.reduce((s, r) => s + r.redeemed, 0).toLocaleString());
  setText("totalLoyaltyBalance", reportData.reduce((s, r) => s + r.balance, 0).toLocaleString());

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
// ADMIN TABS
// ============================================
function showTab(tab, event) {
  currentTab = tab;
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  if (event) event.target.classList.add("active");
  renderAdminContent();
}

// ✅ Fixed: SINGLE definition, safe event listeners (no JSON-in-onclick)
function renderAdminContent() {
  const content = document.getElementById("admin-content");
  if (!content) return;

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
    <div style="display:flex;justify-content:flex-end;margin-bottom:16px;">
      <button class="btn-primary" onclick="openAddForm()">+ Add New</button>
    </div>
    <table class="admin-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Details</th>
          <th style="text-align:right;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${data.length === 0
      ? `<tr><td colspan="4" style="text-align:center;">No data available in Database.</td></tr>`
      : data.map((item, idx) => `
            <tr>
              <td>
                ${item.ImageURL
          ? `<img src="${item.ImageURL}" class="table-thumb" alt="image" onerror="this.style.display='none'">`
          : `<div class="no-image">No img</div>`}
              </td>
              <td><strong>${escapeHtml(config.name(item))}</strong></td>
              <td>${escapeHtml(config.extra(item))}</td>
              <td style="text-align:right;">
                <button class="action-btn btn-edit" data-tab="${currentTab}" data-idx="${idx}">Edit</button>
                <button class="action-btn btn-delete" data-tab="${currentTab}" data-idx="${idx}">Delete</button>
              </td>
            </tr>`).join("")}
      </tbody>
    </table>
  `;

  // Attach listeners safely
  content.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const d = dataMap[btn.dataset.tab].data[Number(btn.dataset.idx)];
      openEditForm(d);
    });
  });
  content.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const d = dataMap[btn.dataset.tab].data[Number(btn.dataset.idx)];
      deleteItem(d);
    });
  });
}

// ============================================
// SIDEBAR NAVIGATION
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
    if (window.scrollY >= section.offsetTop - 120) {
      currentSection = section.getAttribute("id");
    }
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
  const date = document.getElementById("adminDate")?.value || document.getElementById("date")?.value;
  const start = document.getElementById("adminStart")?.value || document.getElementById("start")?.value;
  const end = document.getElementById("adminEnd")?.value || document.getElementById("end")?.value;

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

  container.innerHTML = "<p style='color:var(--text-mid); padding:20px;'>Searching for available rooms from the Database...</p>";

  try {
    const api = window.SheSparksAPI;

    const [rooms, equipment, trainers] = await Promise.all([
      api.availableRooms(date, start, end),
      api.get(`/equipments/available?date=${date}&startTime=${start}&endTime=${end}`),
      api.availableTrainers(date, start, end)
    ]);

    let html = "";

    html += `<h3>Available Rooms (${rooms.length})</h3><div class="room-list">`;
    html += rooms.map((r) => `<div class="room-card"><h3>${escapeHtml(r.RoomName)}</h3><p>Capacity: ${r.Capacity} people</p><p>Studio: ${escapeHtml(r.StudioLocation || r.StudioCode)}</p></div>`).join("") || '<p style="color:var(--text-mid);">No rooms available.</p>';
    html += `</div>`;

    html += `<h3 style="margin-top:24px;">Available Equipment (${equipment.length})</h3><div class="room-list">`;
    html += equipment.map((e) => `<div class="room-card" style="background:var(--white);"><h3>${escapeHtml(e.Name)}</h3><p>Condition: ${escapeHtml(e.ConditionStatus || e.Condition)}</p><p>Studio: ${escapeHtml(e.StudioCode)}</p></div>`).join("") || '<p style="color:var(--text-mid);">No equipment available.</p>';
    html += `</div>`;

    html += `<h3 style="margin-top:24px;">Available Trainers (${trainers.length})</h3><div class="room-list">`;
    html += trainers.map((t) => `<div class="room-card"><h3>${escapeHtml(t.Name)}</h3><p>Sport: ${escapeHtml(t.SportName)}</p><p>Studio: ${escapeHtml(t.StudioCode)}</p></div>`).join("") || '<p style="color:var(--text-mid);">No trainers available.</p>';
    html += `</div>`;

    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = `<p style="color:var(--danger); padding:20px;">API error: ${escapeHtml(error.message)}</p>`;
  }
}

// ============================================
// MODAL FORM (CRUD)
// ============================================
function openAddForm() {
  editingId = null;
  document.getElementById("modal-title").textContent = "Add New " + capitalize(currentTab);
  renderModalFields(null);
  document.getElementById("admin-modal").classList.add("active");
}

function openEditForm(item) {
  editingId = item;
  document.getElementById("modal-title").textContent = "Edit " + capitalize(currentTab);
  renderModalFields(item);
  document.getElementById("admin-modal").classList.add("active");
}

function closeModal() {
  document.getElementById("admin-modal").classList.remove("active");
  editingId = null;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderModalFields(item) {
  const fields = document.getElementById("modal-fields");
  let html = "";

  if (currentTab === "courses") {
    html = `
      <div class="form-group">
        <label>Course ID (Auto Generated)</label>
        <input type="text" value="${item?.CourseID || 'New'}" disabled>
      </div>
      <div class="form-group">
        <label>Title</label>
        <input type="text" name="Title" value="${item?.Title || ''}" placeholder="Basic Yoga" required>
      </div>
      <div class="form-group">
        <label>Level</label>
        <select name="Level">
          ${["Beginner", "Intermediate", "Advanced"].map((opt) => `<option value="${opt}" ${item?.Level === opt ? "selected" : ""}>${opt}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Duration (Hours)</label>
        <input type="number" step="0.5" name="DurationHours" value="${item?.DurationHours || ''}" placeholder="10" required>
      </div>
      <div class="form-group">
        <label>Standard Fee (฿)</label>
        <input type="number" name="StandardFee" value="${item?.StandardFee || ''}" placeholder="1500" required>
      </div>
      <div class="form-group">
        <label>Sport Type</label>
        <select name="SportTypeID" required>
          <option value="">-- Select Sport --</option>
          ${dbSports.map((s) => `<option value="${s.SportTypeID}" ${item?.SportTypeID === s.SportTypeID ? "selected" : ""}>${s.SportName}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Studio</label>
        <select name="StudioCode">
          <option value="">-- Select Studio --</option>
          ${dbStudios.map((s) => `<option value="${s.StudioCode}" ${item?.StudioCode === s.StudioCode ? "selected" : ""}>${s.Name}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Prerequisite Course (Optional)</label>
        <select name="PrerequisiteCourseID">
          <option value="">-- None --</option>
          ${dbCourses
        .filter((c) => !item || Number(c.CourseID) !== Number(item.CourseID))
        .map((c) => `<option value="${c.CourseID}" ${Number(item?.PrerequisiteCourseID) === Number(c.CourseID) ? "selected" : ""}>${c.Title}</option>`)
        .join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Image URL</label>
        <input type="url" name="ImageURL" value="${item?.ImageURL || ''}" placeholder="https://...">
      </div>
    `;
  } else {
    html = `<p style="text-align:center; color:var(--text-mid); padding:20px;">The form for the ${currentTab} tab is not yet available in the MVP version.</p>`;
  }

  fields.innerHTML = html;

  const saveBtn = document.querySelector("#admin-form button[type='submit']");
  if (saveBtn) saveBtn.style.display = currentTab === "courses" ? "inline-block" : "none";

  const form = document.getElementById("admin-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    saveItem();
  };
}

// ==================== SAVE ITEM ====================
async function saveItem() {
  const form = document.getElementById("admin-form");
  const formData = new FormData(form);
  const newData = {};

  formData.forEach((value, key) => { newData[key] = value; });

  ["DurationHours", "StandardFee", "SportTypeID", "RoomID", "CourseID", "TrainerID", "PrerequisiteCourseID"].forEach((k) => {
    if (newData[k] && newData[k] !== "") newData[k] = Number(newData[k]);
    if (newData[k] === "") newData[k] = null;
  });

  if (currentTab === "courses") {
    try {
      if (editingId) {
        await window.SheSparksAPI.put(`/courses/${editingId.CourseID}`, newData);
        alert("Course updated successfully!");
      } else {
        await window.SheSparksAPI.post(`/courses`, newData);
        alert("Course created successfully!");
      }

      closeModal();
      await loadDashboard();
    } catch (error) {
      alert("Error: " + error.message);
    }
  } else {
    alert('The update feature for this tab is not yet available.');
    closeModal();
  }
}

// ==================== DELETE ITEM ====================
async function deleteItem(item) {
  const name = item.Name || item.RoomName || item.Title || item.SportName || "this item";

  if (!confirm(`Are you sure you want to permanently delete "${name}" อย่างถาวร?`)) return;

  if (currentTab === "courses") {
    try {
      await window.SheSparksAPI.delete(`/courses/${item.CourseID}`);
      alert(`Course "${name}" has been removed from the system.`);
      await loadDashboard();
    } catch (error) {
      alert("Cannot delete: " + error.message);
    }
  } else {
    alert('The delete feature for this tab is not yet available.');
  }
}