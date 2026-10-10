/* ============================================
   admin.js - Admin Dashboard + CRUD + Recommend
   FEATURES:
   - ตรวจสอบสิทธิ์ Admin
   - Summary Cards
   - Report 1, 2, 3
   - Admin Tabs: Studios, Sports, Rooms, Courses, Trainers, Rewards, Recommend
   - CRUD ผ่าน Modal + ImageURL
   - Recommend Settings (บันทึกใน localStorage)
   TODO: เชื่อมกับ API /api/admin/* เมื่อ Backend พร้อม
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
    { RoomID: 4, RoomName: "Badminton Court D", Capacity: 4, SportType: "Badminton" },
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

// ==================== LOAD DASHBOARD ====================
function loadDashboard() {
  document.getElementById("totalMembers").textContent = MOCK_ADMIN.totalMembers;
  document.getElementById("totalBookings").textContent = MOCK_ADMIN.totalBookings;
  document.getElementById("totalRevenue").textContent = "฿" + MOCK_ADMIN.totalRevenue.toLocaleString();
  document.getElementById("totalPointsRedeemed").textContent = MOCK_ADMIN.totalPointsRedeemed.toLocaleString();

  // Report 3
  const courseTable = document.querySelector("#popularCoursesTable tbody");
  if (courseTable) {
    courseTable.innerHTML = MOCK_ADMIN.popularCourses.map(c => `
      <tr>
        <td>${c.Title}</td>
        <td>${c.Enrollments}</td>
        <td class="earned">฿${c.Revenue.toLocaleString()}</td>
      </tr>
    `).join("");
  }

  // Report 2
  const pointsTable = document.querySelector("#memberPointsTable tbody");
  if (pointsTable) {
    pointsTable.innerHTML = MOCK_ADMIN.memberPoints.map(m => `
      <tr>
        <td>${m.Name}</td>
        <td class="earned">+${m.Earned}</td>
        <td class="redeemed">-${m.Redeemed}</td>
        <td class="balance">${m.Balance}</td>
      </tr>
    `).join("");
  }

  // Render Tab Content
  renderAdminContent();
}

// ==================== REPORT 1: AVAILABLE ROOMS ====================
function loadAvailableRooms() {
  const date = document.getElementById("adminDate").value;
  const start = document.getElementById("adminStart").value;
  const end = document.getElementById("adminEnd").value;

  if (!date || !start || !end) {
    alert("Please select date and time");
    return;
  }

  const container = document.getElementById("availableRoomsList");
  if (!container) return;

  if (MOCK_ADMIN.availableRooms.length === 0) {
    container.innerHTML = '<p style="color:var(--text-mid);">No rooms available.</p>';
    return;
  }

  container.innerHTML = MOCK_ADMIN.availableRooms.map(r => `
    <div class="room-card">
      <h3>${r.RoomName}</h3>
      <p>Capacity: ${r.Capacity} people</p>
      <p>Sport: ${r.SportType}</p>
    </div>
  `).join("");
}

// ============================================
// ADMIN TABS - CRUD
// ============================================

// ==================== TAB SWITCHING ====================
function showTab(tab, event) {
  currentTab = tab;

  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  if (event) event.target.classList.add("active");

  renderAdminContent();
}

// ==================== RENDER TAB CONTENT ====================
function renderAdminContent() {
  const content = document.getElementById("admin-content");
  if (!content) return;

  if (currentTab === "recommend") {
    renderRecommendSettings(content);
    return;
  }

  // Data Map
  const dataMap = {
    studios: { data: STUDIOS, key: "StudioCode", name: (x) => x.Name, extra: (x) => x.Location },
    sports: { data: SPORT_TYPES, key: "SportTypeID", name: (x) => x.SportName, extra: (x) => x.IntensityLevel },
    rooms: { data: ROOMS, key: "RoomID", name: (x) => x.RoomName, extra: (x) => `${x.SportType} • ${x.Capacity} people` },
    courses: { data: COURSES, key: "CourseID", name: (x) => x.Title, extra: (x) => `${x.Level} • ฿${x.StandardFee}` },
    trainers: { data: TRAINERS, key: "TrainerID", name: (x) => x.Name, extra: (x) => `${x.SportType} • ${x.Phone}` },
    rewards: { data: REWARDS, key: "RewardID", name: (x) => x.Name, extra: (x) => `${x.PointCost} pts • ${x.Category}` },
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
        ${data.map(item => `
          <tr>
            <td>
              ${item.ImageURL
                ? `<img src="${item.ImageURL}" class="table-thumb" alt="${config.name(item)}" onerror="this.style.display='none'">`
                : `<div class="no-image">No img</div>`}
            </td>
            <td><strong>${config.name(item)}</strong></td>
            <td>${config.extra(item)}</td>
            <td style="text-align: right;">
              <button class="action-btn btn-edit" onclick="openEditForm(${JSON.stringify(item).replace(/"/g, '&quot;')})">Edit</button>
              <button class="action-btn btn-delete" onclick="deleteItem(${JSON.stringify(item).replace(/"/g, '&quot;')})">Delete</button>
            </td>
          </tr>
        `).join("")}
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
      <label>
        <input type="checkbox" id="rec-studios" ${settings.studios ? "checked" : ""}>
        Show Recommended Studios
      </label>
      <label>
        <input type="checkbox" id="rec-sports" ${settings.sports ? "checked" : ""}>
        Show Recommended Sports
      </label>
      <label>
        <input type="checkbox" id="rec-courses" ${settings.courses ? "checked" : ""}>
        Show Recommended Courses
      </label>
      <label>
        <input type="checkbox" id="rec-rewards" ${settings.rewards ? "checked" : ""}>
        Show Recommended Rewards
      </label>
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

// ==================== MODAL FORM ====================
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

function renderModalFields(item) {
  const fields = document.getElementById("modal-fields");
  const isEdit = !!item;

  const fieldMap = {
    studios: [
      { key: "StudioCode", label: "Studio Code", type: "text", placeholder: "ST001" },
      { key: "Name", label: "Name", type: "text", placeholder: "SheSparks Silom" },
      { key: "Location", label: "Location", type: "text", placeholder: "Silom, Bangkok" },
      { key: "ImageURL", label: "Image URL", type: "url", placeholder: "https://..." },
    ],
    sports: [
      { key: "SportTypeID", label: "Sport Type ID", type: "number", placeholder: "1" },
      { key: "SportName", label: "Sport Name", type: "text", placeholder: "Yoga" },
      { key: "IntensityLevel", label: "Intensity Level", type: "select", options: ["Low", "Medium", "High"] },
      { key: "ImageURL", label: "Image URL", type: "url", placeholder: "https://..." },
    ],
    rooms: [
      { key: "RoomID", label: "Room ID", type: "number", placeholder: "1" },
      { key: "RoomName", label: "Room Name", type: "text", placeholder: "Yoga Room A" },
      { key: "StudioCode", label: "Studio Code", type: "text", placeholder: "ST001" },
      { key: "SportType", label: "Sport Type", type: "text", placeholder: "Yoga" },
      { key: "Capacity", label: "Capacity", type: "number", placeholder: "20" },
      { key: "ImageURL", label: "Image URL", type: "url", placeholder: "https://..." },
    ],
    courses: [
      { key: "CourseID", label: "Course ID", type: "number", placeholder: "1" },
      { key: "Title", label: "Title", type: "text", placeholder: "Basic Yoga" },
      { key: "Level", label: "Level", type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
      { key: "DurationHours", label: "Duration (Hours)", type: "number", placeholder: "10" },
      { key: "StandardFee", label: "Standard Fee (฿)", type: "number", placeholder: "1500" },
      { key: "ImageURL", label: "Image URL", type: "url", placeholder: "https://..." },
    ],
    trainers: [
      { key: "TrainerID", label: "Trainer ID", type: "number", placeholder: "1" },
      { key: "Name", label: "Name", type: "text", placeholder: "Coach Mali" },
      { key: "Phone", label: "Phone", type: "text", placeholder: "081-111-1111" },
      { key: "SportType", label: "Sport Type", type: "text", placeholder: "Yoga" },
      { key: "StudioCode", label: "Studio Code", type: "text", placeholder: "ST001" },
      { key: "Qualification", label: "Qualification", type: "text", placeholder: "Certified Yoga Instructor" },
      { key: "ImageURL", label: "Image URL", type: "url", placeholder: "https://..." },
    ],
    rewards: [
      { key: "RewardID", label: "Reward ID", type: "number", placeholder: "1" },
      { key: "Name", label: "Name", type: "text", placeholder: "Spa Voucher 500 THB" },
      { key: "PointCost", label: "Point Cost", type: "number", placeholder: "500" },
      { key: "Category", label: "Category", type: "select", options: ["Beauty", "Sports", "Discount"] },
      { key: "Value", label: "Value (฿)", type: "number", placeholder: "500" },
      { key: "ImageURL", label: "Image URL", type: "url", placeholder: "https://..." },
    ],
  };

  const fieldsConfig = fieldMap[currentTab] || [];

  fields.innerHTML = fieldsConfig.map(f => {
    const value = isEdit ? (item[f.key] || "") : "";
    const disabled = isEdit && f.key.includes("ID") ? "disabled" : "";

    if (f.type === "select") {
      return `
        <div class="form-group">
          <label>${f.label}</label>
          <select name="${f.key}" ${disabled}>
            ${f.options.map(opt => `<option value="${opt}" ${value === opt ? "selected" : ""}>${opt}</option>`).join("")}
          </select>
        </div>
      `;
    }

    return `
      <div class="form-group">
        <label>${f.label}</label>
        <input type="${f.type}" name="${f.key}" value="${value}" placeholder="${f.placeholder || ""}" ${disabled}>
      </div>
    `;
  }).join("");

  // Bind Submit
  const form = document.getElementById("admin-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    saveItem();
  };
}

// ==================== SAVE ITEM ====================
function saveItem() {
  const form = document.getElementById("admin-form");
  const formData = new FormData(form);
  const newData = {};

  formData.forEach((value, key) => {
    newData[key] = value;
  });

  // Convert numbers
  ["Capacity", "DurationHours", "StandardFee", "PointCost", "Value", "SportTypeID", "RoomID", "CourseID", "TrainerID", "RewardID"].forEach(k => {
    if (newData[k]) newData[k] = Number(newData[k]);
  });

  if (editingId) {
    // EDIT
    const dataArray = getCurrentDataArray();
    const index = dataArray.findIndex(x => isSameItem(x, editingId));
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
  const name = item.Name || item.RoomName || item.Title || item.SportName || "this item";
  if (!confirm(`Delete "${name}"?`)) return;

  const dataArray = getCurrentDataArray();
  const index = dataArray.findIndex(x => isSameItem(x, item));
  if (index >= 0) {
    dataArray.splice(index, 1);
    alert("✅ ลบข้อมูลสำเร็จ (Prototype)");
  }

  // TODO: call API DELETE
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
  };
  return map[currentTab];
}

function isSameItem(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}