/* ============================================
   booking-flow.js - Studio → Sport → Room (API Connected)
   FEATURES:
   - Step 1: เลือก Studio (ดึงจาก DB)
   - Step 2: เลือก Sport (กรองจาก DB)
   - Step 3: เลือก Room (ตรวจสอบห้องว่างจาก API /api/rooms/available)
   ============================================ */

let flow = JSON.parse(localStorage.getItem("bookingFlow")) || {};

// ตัวแปรสำหรับเก็บข้อมูลจาก Database
let dbStudios = [];
let dbSports = [];
let dbRooms = [];

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. ดึงข้อมูล Master Data จาก API แทน Mock Data
    dbStudios = await SheSparksAPI.studios();
    dbSports = await SheSparksAPI.sports();
    dbRooms = await SheSparksAPI.rooms();

    // 2. Render หน้าที่กำลังเปิดอยู่
    if (document.getElementById("studio-list")) renderStudios();
    if (document.getElementById("sport-list")) renderSports();
    if (document.getElementById("room-list")) renderRooms();
  } catch (error) {
    console.error("Failed to load data from API:", error);
    alert("ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบว่ารัน Backend แล้วหรือยัง");
  }
});

// Helper: หาว่า Studio นี้มีกีฬาอะไรบ้าง โดยดูจากข้อมูลห้อง (ROOMS) ใน DB
function getSportsForStudio(studioCode) {
  // หา SportTypeID ทั้งหมดที่มีห้องใน Studio นี้
  const sportIdsInStudio = [...new Set(dbRooms.filter(r => r.StudioCode === studioCode).map(r => r.SportTypeID))];
  // คืนค่าออบเจกต์กีฬา
  return dbSports.filter(s => sportIdsInStudio.includes(s.SportTypeID));
}

// ==================== STEP 1: STUDIO ====================
function renderStudios() {
  const container = document.getElementById("studio-list");
  if (!container) return;

  container.innerHTML = dbStudios.map((s) => {
    const sports = getSportsForStudio(s.StudioCode)
      .map((st) => st.SportName)
      .join(" • ");

    return `
      <div class="studio-card" onclick="selectStudio('${s.StudioCode}')">
        ${s.ImageURL ? `<img src="${s.ImageURL}" class="card-image" alt="${s.Name}" onerror="this.style.display='none'">` : ""}
        <h3>${s.Name}</h3>
        <p>${s.Location}</p>
        <span class="sports-tag">${sports || "No sports"}</span>
      </div>
    `;
  }).join("");
}

function selectStudio(code) {
  flow.studio = dbStudios.find((s) => s.StudioCode === code);
  saveFlow();
  window.location.href = "/views/sport.html";
}

// ==================== STEP 2: SPORT ====================
function renderSports() {
  const container = document.getElementById("sport-list");
  if (!container || !flow.studio) return;

  const label = document.getElementById("selected-studio-label");
  if (label) label.textContent = `at ${flow.studio.Name}`;

  const sports = getSportsForStudio(flow.studio.StudioCode);

  if (sports.length === 0) {
    container.innerHTML = "<p>No sports available at this studio.</p>";
    return;
  }

  container.innerHTML = sports
    .map(
      (s) => `
    <div class="sport-card" onclick="selectSport(${s.SportTypeID})">
      ${s.ImageURL ? `<img src="${s.ImageURL}" class="card-image" alt="${s.SportName}" onerror="this.style.display='none'">` : ""}
      <h3>${s.SportName}</h3>
      <p>Intensity: ${s.IntensityLevel}</p>
    </div>
  `,
    )
    .join("");
}

function selectSport(sportTypeID) {
  flow.sport = dbSports.find((s) => s.SportTypeID === sportTypeID);
  saveFlow();
  window.location.href = "/views/room.html";
}

// ==================== STEP 3: ROOM ====================
function renderRooms(filteredRooms = null) {
  const container = document.getElementById("room-list");
  if (!container) return;

  if (!flow.studio || !flow.sport) {
    container.innerHTML = "<p>Please select Studio and Sport first.</p>";
    return;
  }

  const label = document.getElementById("selected-sport-label");
  if (label) {
    label.textContent = `${flow.sport.SportName} at ${flow.studio.Name}`;
  }

  // ถ้าไม่ได้กรองด้วยฟิลเตอร์ ให้แสดงห้องทั้งหมดของสตูดิโอและกีฬานั้นๆ
  const rooms = filteredRooms || dbRooms.filter(
      (r) => r.StudioCode === flow.studio.StudioCode && r.SportTypeID === flow.sport.SportTypeID
  );

  if (rooms.length === 0) {
    container.innerHTML = "<p>No rooms available for this selection.</p>";
    return;
  }

  container.innerHTML = rooms
    .map(
      (r) => {
        const sportName = dbSports.find(s => s.SportTypeID === r.SportTypeID)?.SportName || 'Unknown';
        return `
        <div class="room-card" onclick="openRoomModal(${r.RoomID})">
          ${r.ImageURL ? `<img src="${r.ImageURL}" class="card-image" alt="${r.RoomName}" onerror="this.style.display='none'">` : ""}
          <h3>${r.RoomName}</h3>
          <p>Capacity: ${r.Capacity} people</p>
          <p>Sport: ${sportName}</p>
          <button class="btn-primary">Select</button>
        </div>
      `})
    .join("");
}

// ==================== APPLY FILTERS (เรียก API ตรวจสอบห้องว่าง) ====================
async function applyFilters() {
  const date = document.getElementById("filterDate")?.value;
  const startTime = document.getElementById("filterStartTime")?.value;
  const endTime = document.getElementById("filterEndTime")?.value;
  const capacity = parseInt(document.getElementById("filterCapacity")?.value) || 1;

  // ถ้าไม่เลือกวัน/เวลา → แสดงทั้งหมดตามปกติ
  if (!date || !startTime || !endTime) {
    renderRooms();
    return;
  }

  if (startTime >= endTime) {
    showModal({
      type: "warning",
      title: "เวลาไม่ถูกต้อง",
      message: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น",
    });
    return;
  }

  if (capacity < 1 || capacity > 30) {
    showModal({
      type: "warning",
      title: "จำนวนคนไม่ถูกต้อง",
      message: "จำนวนคนต้องอยู่ระหว่าง 1 - 30 คน",
    });
    return;
  }

  try {
    // ✅ เรียก API หาห้องว่างโดยตรง (จัดการเรื่องการป้องกันห้องซ้อนได้ 100%)
    const availableRoomsFromApi = await SheSparksAPI.availableRooms(date, startTime, endTime);

    // กรองเพิ่มตาม Studio, Sport และความจุห้อง
    const filtered = availableRoomsFromApi.filter((r) => {
      if (r.StudioCode !== flow.studio.StudioCode) return false;
      if (r.SportTypeID !== flow.sport.SportTypeID) return false;
      if (r.Capacity < capacity) return false;
      return true;
    });

    renderRooms(filtered);
  } catch (error) {
    console.error("Filter error:", error);
    showModal({ type: "error", title: "Error", message: "ไม่สามารถค้นหาห้องว่างจากระบบได้" });
  }
}

function clearFilters() {
  const dateEl = document.getElementById("filterDate");
  const startEl = document.getElementById("filterStartTime");
  const endEl = document.getElementById("filterEndTime");
  const capEl = document.getElementById("filterCapacity");

  if (dateEl) dateEl.value = "";
  if (startEl) startEl.value = "09:00";
  if (endEl) endEl.value = "11:00";
  if (capEl) capEl.value = "1";

  renderRooms();
}

// ==================== HELPERS ====================
function saveFlow() {
  localStorage.setItem("bookingFlow", JSON.stringify(flow));
}

function goBack() {
  window.history.back();
}