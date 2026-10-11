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

  renderAdminContent();
}

// ==================== REPORT 1 ====================
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

  container.innerHTML = MOCK_ADMIN.availableRooms.map(r => `
    <div class="room-card">
      <h3>${r.RoomName}</h3>
      <p>Capacity: ${r.Capacity} people</p>
      <p>Sport: ${r.SportType}</p>
    </div>
  `).join("");
}

// ============================================
// ADMIN TABS
// ============================================

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

  const dataMap = {
    studios: {
      data: STUDIOS,
      name: (x) => x.Name,
      extra: (x) => {
        const sports = getStudioSports(x.StudioCode).map(s => s.SportName).join(", ");
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
      extra: (x) => `${getStudioName(x.StudioCode)} • ${getSportName(x.SportTypeID)} • ${x.Capacity} people`,
    },
    courses: {
      data: COURSES,
      name: (x) => x.Title,
      extra: (x) => {
        const prereq = x.PrerequisiteCourseID ? ` ← ${getCourseName(x.PrerequisiteCourseID)}` : "";
        return `${x.Level} • ${getStudioName(x.StudioCode)} • ${getRoomName(x.RoomID)}${prereq}`;
      },
    },
    trainers: {
      data: TRAINERS,
      name: (x) => x.Name,
      extra: (x) => `${getSportName(x.SportTypeID)} • ${getStudioName(x.StudioCode)} • ${x.Phone}`,
    },
    rewards: {
      data: REWARDS,
      name: (x) => x.Name,
      extra: (x) => `${x.PointCost} pts • ${x.Category} • ฿${x.Value}`,
    },
  };

  const config = dataMap[currentTab];
  if (!config) return;

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
        ${config.data.map(item => `
          <tr>
            <td>
              ${item.ImageURL
                ? `<img src="${item.ImageURL}" class="table-thumb" alt="${config.name(item)}" onerror="this.style.display='none'">`
                : `<div class="no-image">No img</div>`}
            </td>
            <td><strong>${config.name(item)}</strong></td>
            <td>${config.extra(item)}</td>
            <td style="text-align: right;">
              <button class="action-btn btn-edit" onclick='openEditForm(${JSON.stringify(item).replace(/'/g, "&#39;")})'>Edit</button>
              <button class="action-btn btn-delete" onclick='deleteItem(${JSON.stringify(item).replace(/'/g, "&#39;")})'>Delete</button>
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
    studios: true, sports: true, courses: true, rewards: true,
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

// ============================================
// MODAL FORM
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
  const sports = item ? getStudioSports(item.StudioCode).map(s => s.SportTypeID) : [];
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
        ${SPORT_TYPES.map(s => `
          <label class="checkbox-item">
            <input type="checkbox" name="SportTypeIDs" value="${s.SportTypeID}" ${sports.includes(s.SportTypeID) ? "checked" : ""}>
            ${s.SportName}
          </label>
        `).join("")}
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
        ${["Low", "Medium", "High"].map(opt => `<option value="${opt}" ${item?.IntensityLevel === opt ? "selected" : ""}>${opt}</option>`).join("")}
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
        ${STUDIOS.map(s => `<option value="${s.StudioCode}" ${item?.StudioCode === s.StudioCode ? "selected" : ""}>${s.Name} (${s.Location})</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Sport Type</label>
      <select name="SportTypeID">
        <option value="">-- เลือก Sport --</option>
        ${SPORT_TYPES.map(s => `<option value="${s.SportTypeID}" ${item?.SportTypeID === s.SportTypeID ? "selected" : ""}>${s.SportName}</option>`).join("")}
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
        ${["Beginner", "Intermediate", "Advanced"].map(opt => `<option value="${opt}" ${item?.Level === opt ? "selected" : ""}>${opt}</option>`).join("")}
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
        ${STUDIOS.map(s => `<option value="${s.StudioCode}" ${item?.StudioCode === s.StudioCode ? "selected" : ""}>${s.Name}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Room</label>
      <select name="RoomID" id="course-room">
        <option value="">-- เลือก Room --</option>
        ${ROOMS.map(r => `<option value="${r.RoomID}" ${item?.RoomID === r.RoomID ? "selected" : ""}>${r.RoomName} (${getStudioName(r.StudioCode)})</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Trainer</label>
      <select name="TrainerID">
        <option value="">-- เลือก Trainer --</option>
        ${TRAINERS.map(t => `<option value="${t.TrainerID}" ${item?.TrainerID === t.TrainerID ? "selected" : ""}>${t.Name} (${getSportName(t.SportTypeID)})</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Prerequisite Course (ถ้ามี)</label>
      <select name="PrerequisiteCourseID">
        <option value="">-- ไม่มี --</option>
        ${COURSES.filter(c => !item || c.CourseID !== item.CourseID).map(c => `<option value="${c.CourseID}" ${item?.PrerequisiteCourseID === c.CourseID ? "selected" : ""}>${c.Title} (${c.Level})</option>`).join("")}
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
        ${SPORT_TYPES.map(s => `<option value="${s.SportTypeID}" ${item?.SportTypeID === s.SportTypeID ? "selected" : ""}>${s.SportName}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Studio</label>
      <select name="StudioCode">
        <option value="">-- เลือก Studio --</option>
        ${STUDIOS.map(s => `<option value="${s.StudioCode}" ${item?.StudioCode === s.StudioCode ? "selected" : ""}>${s.Name}</option>`).join("")}
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
        ${["Beauty", "Sports", "Discount"].map(opt => `<option value="${opt}" ${item?.Category === opt ? "selected" : ""}>${opt}</option>`).join("")}
      </select>
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
  ["Capacity", "DurationHours", "StandardFee", "PointCost", "Value", "SportTypeID", "RoomID", "CourseID", "TrainerID", "RewardID", "PrerequisiteCourseID"].forEach(k => {
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
    newData.SportTypeIDs.forEach(sportID => {
      STUDIO_SPORT_TYPE.push({ StudioCode: studioCode, SportTypeID: sportID });
    });

    delete newData.SportTypeIDs;
  }

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