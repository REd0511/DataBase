/* ============================================
   manager-dashboard.js - Studio Manager Dashboard
   FEATURES:
   - View Switcher (Dropdown) — สลับ Studio ได้
   - Profile ของ Studio ที่เลือก
   - Bookings จาก localStorage.bookings
   - Fallback Mock ถ้าไม่มีข้อมูล
   ============================================ */

// ==================== MOCK DATA (Fallback) ====================
const MOCK_TODAY_BOOKINGS = []; // ← ตั้งเป็น array ว่าง
const MOCK_EQUIPMENT = [
  {
    StudioCode: "ST001",
    EquipmentID: 1,
    Name: "Yoga Mat Pro",
    SportName: "Yoga",
    Condition: "Good",
    LateFee: 50,
  },
  {
    StudioCode: "ST001",
    EquipmentID: 2,
    Name: "Pilates Ball",
    SportName: "Pilates",
    Condition: "Good",
    LateFee: 80,
  },
  {
    StudioCode: "ST002",
    EquipmentID: 5,
    Name: "Boxing Gloves",
    SportName: "Boxing",
    Condition: "Good",
    LateFee: 120,
  },
];

// ==================== STATE ====================
let currentStudioCode = null;

// ==================== INIT ====================
window.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  // ตรวจสอบสิทธิ์: Admin หรือ Manager
  if (!user || (user.role !== "manager" && user.role !== "admin")) {
    alert("Please login as Studio Manager or Admin");
    window.location.href = "/views/login.html";
    return;
  }

  // สร้าง Dropdown
  populateStudioSwitcher();

  // ถ้า Login เป็น Manager → ใช้ Studio ของตัวเอง
  // ถ้า Login เป็น Admin → ใช้ Studio แรก
  if (user.role === "manager") {
    currentStudioCode = user.studioCode;
  } else {
    currentStudioCode = STUDIOS[0].StudioCode;
  }

  document.getElementById("studioSwitcher").value = currentStudioCode;

  // โหลด Dashboard
  loadManagerDashboard(currentStudioCode);
});

// ==================== POPULATE SWITCHER ====================
function populateStudioSwitcher() {
  const select = document.getElementById("studioSwitcher");
  if (!select) return;

  select.innerHTML = STUDIOS.map((s) => {
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
  const studio = STUDIOS.find((s) => s.StudioCode === studioCode);
  if (!studio) {
    alert("Studio not found");
    return;
  }

  // ==================== PROFILE ====================
  document.getElementById("profile-avatar").textContent = studio.Name.charAt(0);
  document.getElementById("manager-name").textContent =
    `Manager of ${studio.Name}`;
  document.getElementById("manager-studio").textContent = `🏢 ${studio.Name}`;
  document.getElementById("manager-location").textContent =
    `📍 ${studio.Location}`;

  const studioSports = getStudioSports(studio.StudioCode);
  const sportNames = studioSports.map((s) => s.SportName).join(" • ");
  document.getElementById("manager-sporttypes").textContent =
    `🏋️ ${sportNames || "No sports"}`;

  // ==================== FILTER DATA ====================
  const studioRooms = ROOMS.filter((r) => r.StudioCode === studio.StudioCode);
  const studioTrainers = TRAINERS.filter(
    (t) => t.StudioCode === studio.StudioCode,
  );

  // ==================== LOAD BOOKINGS FROM localStorage ====================
  const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const studioBookings = allBookings.filter(
    (b) => b.StudioCode === studio.StudioCode,
  );

  // Equipment จาก Mock
  const studioEquipment = MOCK_EQUIPMENT.filter(
    (e) => e.StudioCode === studio.StudioCode,
  );

  // ==================== SUMMARY CARDS ====================
  document.getElementById("roomCount").textContent = studioRooms.length;
  document.getElementById("trainerCount").textContent = studioTrainers.length;
  document.getElementById("bookingCount").textContent =
    studioBookings.length ||
    MOCK_TODAY_BOOKINGS.filter((b) => b.StudioCode === studio.StudioCode)
      .length;
  document.getElementById("equipmentCount").textContent =
    studioEquipment.length;

  // ==================== ROOMS ====================
  renderRooms(studioRooms);

  // ==================== TRAINERS ====================
  renderTrainers(studioTrainers);

  // ==================== BOOKINGS ====================
  renderBookings(studioBookings, studio.StudioCode);

  // ==================== EQUIPMENT ====================
  renderEquipment(studioEquipment);
}

// ==================== RENDER ROOMS ====================
function renderRooms(studioRooms) {
  const container = document.getElementById("roomsList");
  if (!container) return;

  if (studioRooms.length === 0) {
    container.innerHTML =
      '<p style="color:var(--text-mid);">No rooms in this studio.</p>';
    return;
  }

  container.innerHTML = studioRooms
    .map(
      (r) => `
    <div class="room-card">
      <h3>${r.RoomName}</h3>
      <p>Capacity: ${r.Capacity} people</p>
      <p>Sport: ${getSportName(r.SportTypeID)}</p>
    </div>
  `,
    )
    .join("");
}

// ==================== RENDER TRAINERS ====================
function renderTrainers(studioTrainers) {
  const container = document.getElementById("trainersList");
  if (!container) return;

  if (studioTrainers.length === 0) {
    container.innerHTML =
      '<p style="color:var(--text-mid);">No trainers in this studio.</p>';
    return;
  }

  container.innerHTML = studioTrainers
    .map(
      (t) => `
    <div class="trainer-card">
      <div class="avatar">${t.Name.split(" ")[1]?.[0] || "T"}</div>
      <h3>${t.Name}</h3>
      <span class="specialty">${getSportName(t.SportTypeID)}</span>
      <p>${t.Phone}</p>
    </div>
  `,
    )
    .join("");
}

// ==================== RENDER BOOKINGS ====================
function renderBookings(studioBookings, studioCode) {
  const tbody = document.querySelector("#bookingsTable tbody");
  if (!tbody) return;

  if (studioBookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-mid);">No bookings yet — waiting for bookings.</td></tr>`;
    return;
  }

  tbody.innerHTML = studioBookings
    .map(
      (b) => `
    <tr>
      <td>${b.Date}</td>
      <td>${b.StartTime} - ${b.EndTime}</td>
      <td>${b.RoomName}</td>
      <td>${b.SportName}</td>
      <td>${b.MemberName}</td>
      <td class="earned">${b.Status || "Confirmed"}</td>
    </tr>
  `,
    )
    .join("");
}

// ==================== RENDER EQUIPMENT ====================
function renderEquipment(studioEquipment) {
  const tbody = document.querySelector("#equipmentTable tbody");
  if (!tbody) return;

  if (studioEquipment.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-mid);padding:20px;">No equipment in this studio.</td></tr>`;
    return;
  }

  tbody.innerHTML = studioEquipment
    .map(
      (e) => `
    <tr>
      <td>${e.Name}</td>
      <td>${e.SportName}</td>
      <td>${e.Condition}</td>
      <td>฿${e.LateFee}</td>
    </tr>
  `,
    )
    .join("");
}
