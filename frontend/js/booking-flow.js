/* ============================================
   booking-flow.js - Studio → Sport → Room (API Connected)
   FEATURES:
   - Step 1: Select Studio (from DB)
   - Step 2: Select Sport (filtered from DB)
   - Step 3: Select Room (check availability from API /api/rooms/available)
   ============================================ */

let flow = JSON.parse(localStorage.getItem("bookingFlow")) || {};

// Variables to store data from Database
let dbStudios = [];
let dbSports = [];
let dbRooms = [];

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. Fetch Master Data from API instead of Mock Data
    dbStudios = await SheSparksAPI.studios();
    dbSports = await SheSparksAPI.sports();
    dbRooms = await SheSparksAPI.rooms();

    // 2. Render current page
    if (document.getElementById("studio-list")) renderStudios();
    if (document.getElementById("sport-list")) renderSports();
    if (document.getElementById("room-list")) renderRooms();
  } catch (error) {
    console.error("Failed to load data from API:", error);
    alert("Cannot connect to database. Please check if Backend is running.");
  }
});

// find which sports a Studio has by checking ROOMS data in DB
function getSportsForStudio(studioCode) {
  // Find all SportTypeIDs that have rooms in this Studio
  const sportIdsInStudio = [...new Set(dbRooms.filter(r => r.StudioCode === studioCode).map(r => r.SportTypeID))];
  // Return sport objects
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

// ==================== APPLY FILTERS ====================
async function applyFilters() {
  const date = document.getElementById("filterDate")?.value;
  const startTime = document.getElementById("filterStartTime")?.value;
  const endTime = document.getElementById("filterEndTime")?.value;
  const capacity = parseInt(document.getElementById("filterCapacity")?.value) || 1;

  // If no date/time selected → show all as normal
  if (!date || !startTime || !endTime) {
    renderRooms();
    return;
  }

  if (startTime >= endTime) {
    showModal({
      type: "warning",
      title: "Invalid time",
      message: "End time must be after start time",
    });
    return;
  }

  if (capacity < 1 || capacity > 30) {
    showModal({
      type: "warning",
      title: "Invalid capacity",
      message: "Number of people must be between 1 and 30",
    });
    return;
  }

  try {
    //  find available rooms directly 
    const availableRoomsFromApi = await SheSparksAPI.availableRooms(date, startTime, endTime);

    // Additional filter by Studio, Sport, and capacity
    const filtered = availableRoomsFromApi.filter((r) => {
      if (r.StudioCode !== flow.studio.StudioCode) return false;
      if (r.SportTypeID !== flow.sport.SportTypeID) return false;
      if (r.Capacity < capacity) return false;
      return true;
    });

    renderRooms(filtered);
  } catch (error) {
    console.error("Filter error:", error);
    showModal({ type: "error", title: "Error", message: "Cannot search for available rooms" });
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