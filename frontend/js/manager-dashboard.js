/* ============================================
   manager-dashboard.js - Studio Manager Dashboard (API Connected)
   FEATURES:
   - โหลดข้อมูล Master Data และ Bookings ทั้งหมดจาก API
   - สลับดูข้อมูลของแต่ละ Studio ได้
   ============================================ */

let currentStudioCode = null;

// เก็บข้อมูลที่โหลดมาจาก Database
let dbStudios = [];
let dbRooms = [];
let dbTrainers = [];
let dbBookings = [];
let dbEquipment = [];

window.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  // ตรวจสอบสิทธิ์: Admin หรือ Manager
  if (!user || (user.role !== "manager" && user.role !== "admin")) {
    alert("Please login as Studio Manager or Admin");
    window.location.href = "/views/login.html";
    return;
  }

  try {
    // โหลดข้อมูลทั้งหมดจาก API รวดเดียว
    const api = window.SheSparksAPI;
    [dbStudios, dbRooms, dbTrainers, dbBookings, dbEquipment] = await Promise.all([
      api.studios(),
      api.rooms(),
      api.trainers(),
      api.bookings(),
      api.get('/equipments')
    ]);

    // สร้างตัวเลือก Dropdown สำหรับสลับสาขา
    populateStudioSwitcher();

    // กำหนด Studio เริ่มต้นตาม Role ของผู้ใช้
    if (user.role === "manager") {
      currentStudioCode = user.studioCode || dbStudios[0]?.StudioCode;
    } else {
      currentStudioCode = dbStudios[0]?.StudioCode;
    }

    document.getElementById("studioSwitcher").value = currentStudioCode;

    // เริ่มแสดงข้อมูล Dashboard
    loadManagerDashboard(currentStudioCode);

  } catch (error) {
    console.error("Failed to load manager dashboard data:", error);
    alert("ไม่สามารถโหลดข้อมูลจากระบบได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่");
  }
});

// ==================== POPULATE SWITCHER ====================
function populateStudioSwitcher() {
  const select = document.getElementById("studioSwitcher");
  if (!select) return;

  select.innerHTML = dbStudios.map((s) => {
    return `<option value="${s.StudioCode}">${s.Name} (${s.Location})</option>`;
  }).join("");
}

// ==================== SWITCH STUDIO ====================
function switchStudio(studioCode) {
  currentStudioCode = studioCode;
  loadManagerDashboard(currentStudioCode);
}

// ==================== LOAD DASHBOARD ====================
function loadManagerDashboard(studioCode) {
  const studio = dbStudios.find((s) => s.StudioCode === studioCode);
  if (!studio) {
    alert("Studio not found");
    return;
  }

  // ==================== PROFILE ====================
  document.getElementById("profile-avatar").textContent = studio.Name.charAt(0);
  document.getElementById("manager-name").textContent = `Manager of ${studio.Name}`;
  document.getElementById("manager-studio").textContent = `🏢 ${studio.Name}`;
  document.getElementById("manager-location").textContent = `📍 ${studio.Location}`;
  document.getElementById("manager-sporttypes").textContent = `⚙️ Studio Management`;

  // ==================== FILTER DATA ====================
  // กรองข้อมูลให้ตรงกับสาขาที่เลือก
  const studioRooms = dbRooms.filter((r) => r.StudioCode === studio.StudioCode);
  const studioTrainers = dbTrainers.filter((t) => t.StudioCode === studio.StudioCode);
  const studioEquipment = dbEquipment.filter((e) => e.StudioCode === studio.StudioCode);

  // กรอง Booking ให้แสดงเฉพาะ "ของวันนี้" และ "สาขานี้"
  // แปลงเวลาให้เทียบง่ายขึ้นเป็น YYYY-MM-DD
  const today = new Date();
  const todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, '0') + "-" + String(today.getDate()).padStart(2, '0');
  
  const studioBookings = dbBookings.filter((b) => {
      const bDate = new Date(b.BookingDate);
      const bDateStr = bDate.getFullYear() + "-" + String(bDate.getMonth() + 1).padStart(2, '0') + "-" + String(bDate.getDate()).padStart(2, '0');
      return b.StudioCode === studio.StudioCode && bDateStr === todayStr;
  });

  // ==================== SUMMARY CARDS ====================
  document.getElementById("roomCount").textContent = studioRooms.length;
  document.getElementById("trainerCount").textContent = studioTrainers.length;
  document.getElementById("bookingCount").textContent = studioBookings.length;
  document.getElementById("equipmentCount").textContent = studioEquipment.length;

  // ==================== RENDER SECTIONS ====================
  renderRooms(studioRooms);
  renderTrainers(studioTrainers);
  renderBookings(studioBookings);
  renderEquipment(studioEquipment);
}

// ==================== RENDER ROOMS ====================
function renderRooms(studioRooms) {
  const container = document.getElementById("roomsList");
  if (!container) return;

  if (studioRooms.length === 0) {
    container.innerHTML = '<p style="color:var(--text-mid);">No rooms in this studio.</p>';
    return;
  }

  container.innerHTML = studioRooms.map((r) => `
    <div class="room-card">
      <h3>${r.RoomName}</h3>
      <p>Capacity: ${r.Capacity} people</p>
    </div>
  `).join("");
}

// ==================== RENDER TRAINERS ====================
function renderTrainers(studioTrainers) {
  const container = document.getElementById("trainersList");
  if (!container) return;

  if (studioTrainers.length === 0) {
    container.innerHTML = '<p style="color:var(--text-mid);">No trainers in this studio.</p>';
    return;
  }

  container.innerHTML = studioTrainers.map((t) => `
    <div class="trainer-card">
      <div class="avatar">${t.Name.split(" ")[1]?.[0] || "T"}</div>
      <h3>${t.Name}</h3>
      <span class="specialty">${t.SportName || "Trainer"}</span>
      <p>${t.Phone || "-"}</p>
    </div>
  `).join("");
}

// ==================== RENDER BOOKINGS ====================
function renderBookings(studioBookings) {
  const tbody = document.querySelector("#bookingsTable tbody");
  if (!tbody) return;

  if (studioBookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-mid);">No bookings for today.</td></tr>`;
    return;
  }

  tbody.innerHTML = studioBookings.map((b) => {
    // จัด Format วันเวลา
    const d = new Date(b.BookingDate);
    const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
    const start = (b.StartTime || "").substring(0, 5);
    const end = (b.EndTime || "").substring(0, 5);
    const statusClass = b.Status === "Cancelled" ? "cancelled" : (b.Status === "Completed" ? "completed" : "confirmed");

    return `
    <tr>
      <td>${dateStr}</td>
      <td>${start} - ${end}</td>
      <td>${b.RoomName || "-"}</td>
      <td>${b.SportName || "-"}</td>
      <td>${b.MemberName || "-"}</td>
      <td><span class="condition-badge ${statusClass}">${b.Status || "Confirmed"}</span></td>
    </tr>
  `}).join("");
}

// ==================== RENDER EQUIPMENT ====================
function renderEquipment(studioEquipment) {
  const tbody = document.querySelector("#equipmentTable tbody");
  if (!tbody) return;

  if (studioEquipment.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-mid);padding:20px;">No equipment in this studio.</td></tr>`;
    return;
  }

  tbody.innerHTML = studioEquipment.map((e) => `
    <tr>
      <td>${e.Name}</td>
      <td>${e.SportName || "-"}</td>
      <td><span class="condition-badge ${(e.ConditionStatus || "good").toLowerCase()}">${e.ConditionStatus || "Good"}</span></td>
      <td>฿${e.LateFee || 0}</td>
    </tr>
  `).join("");
}