/* ============================================
   booking-flow.js - Studio → Sport → Room
   FEATURES:
   - Step 1: เลือก Studio
   - Step 2: เลือก Sport
   - Step 3: เลือก Room (กรอง + คลิกเปิด Modal)
   - บันทึกใน localStorage
   ============================================ */

let flow = JSON.parse(localStorage.getItem("bookingFlow")) || {};

// ==================== STEP 1: STUDIO ====================
function renderStudios() {
  const container = document.getElementById("studio-list");
  if (!container) return;

  container.innerHTML = STUDIOS.map(s => {
    const sports = getStudioSports(s.StudioCode).map(st => st.SportName).join(" • ");

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
  console.log("Selected Studio:", code);
  flow.studio = STUDIOS.find(s => s.StudioCode === code);
  saveFlow();
  window.location.href = "/views/sport.html";
}

// ==================== STEP 2: SPORT ====================
function renderSports() {
  const container = document.getElementById("sport-list");
  if (!container || !flow.studio) return;

  const label = document.getElementById("selected-studio-label");
  if (label) label.textContent = `at ${flow.studio.Name}`;

  const sports = getStudioSports(flow.studio.StudioCode);

  if (sports.length === 0) {
    container.innerHTML = "<p>No sports available at this studio.</p>";
    return;
  }

  container.innerHTML = sports.map(s => `
    <div class="sport-card" onclick="selectSport(${s.SportTypeID})">
      ${s.ImageURL ? `<img src="${s.ImageURL}" class="card-image" alt="${s.SportName}" onerror="this.style.display='none'">` : ""}
      <h3>${s.SportName}</h3>
      <p>Intensity: ${s.IntensityLevel}</p>
    </div>
  `).join("");
}

function selectSport(sportTypeID) {
  console.log("Selected Sport:", sportTypeID);
  flow.sport = SPORT_TYPES.find(s => s.SportTypeID === sportTypeID);
  saveFlow();
  window.location.href = "/views/room.html";
}

// ==================== STEP 3: ROOM ====================
function renderRooms(filteredRooms = null) {
  const container = document.getElementById("room-list");
  if (!container) return;

  // ตรวจสอบว่ามี studio + sport
  if (!flow.studio || !flow.sport) {
    container.innerHTML = "<p>Please select Studio and Sport first.</p>";
    return;
  }

  const label = document.getElementById("selected-sport-label");
  if (label) {
    label.textContent = `${flow.sport.SportName} at ${flow.studio.Name}`;
  }

  // ถ้าไม่มี filteredRooms → แสดงทั้งหมดของ Studio + Sport
  const rooms = filteredRooms || ROOMS.filter(r =>
    r.StudioCode === flow.studio.StudioCode &&
    r.SportTypeID === flow.sport.SportTypeID
  );

  if (rooms.length === 0) {
    container.innerHTML = "<p>No rooms available for this selection.</p>";
    return;
  }

  container.innerHTML = rooms.map(r => `
    <div class="room-card" onclick="openRoomModal(${r.RoomID})">
      ${r.ImageURL ? `<img src="${r.ImageURL}" class="card-image" alt="${r.RoomName}" onerror="this.style.display='none'">` : ""}
      <h3>${r.RoomName}</h3>
      <p>Capacity: ${r.Capacity} people</p>
      <p>Sport: ${getSportName(r.SportTypeID)}</p>
      <button class="btn-primary">Select</button>
    </div>
  `).join("");
}

// ==================== APPLY FILTERS ====================
function applyFilters() {
  const date = document.getElementById("filterDate")?.value;
  const startTime = document.getElementById("filterStartTime")?.value;
  const endTime = document.getElementById("filterEndTime")?.value;
  const capacity = parseInt(document.getElementById("filterCapacity")?.value) || 1;

  console.log("=== Filter Debug ===");
  console.log("Date:", date);
  console.log("Start:", startTime);
  console.log("End:", endTime);
  console.log("Capacity:", capacity);

  // ถ้าไม่เลือกวัน/เวลา → แสดงทั้งหมด
  if (!date || !startTime || !endTime) {
    console.log("No filter → Show all");
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

  // กรอง
  const filtered = ROOMS.filter(r => {
    if (r.StudioCode !== flow.studio.StudioCode) return false;
    if (r.SportTypeID !== flow.sport.SportTypeID) return false;
    if (r.Capacity < capacity) return false;

    const isBooked = isRoomBooked(r.RoomID, date, startTime, endTime);
    console.log(`Room ${r.RoomID} (${r.RoomName}) - Booked: ${isBooked}`);
    return !isBooked;
  });

  console.log("Filtered Rooms:", filtered);
  renderRooms(filtered);
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

// ==================== ตรวจสอบการจอง ====================
function isRoomBooked(roomID, date, startTime, endTime) {
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  return bookings.some(b =>
    b.RoomID === roomID &&
    b.Date === date &&
    b.StartTime < endTime &&
    b.EndTime > startTime
  );
}

// ==================== HELPERS ====================
function saveFlow() {
  localStorage.setItem("bookingFlow", JSON.stringify(flow));
}

function goBack() {
  window.history.back();
}

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("studio-list")) renderStudios();
  if (document.getElementById("sport-list")) renderSports();
  if (document.getElementById("room-list")) renderRooms();
});