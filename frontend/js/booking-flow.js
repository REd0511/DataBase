/* ============================================
   booking-flow.js - Studio -> Sport -> Room
   ============================================ */

let flow = JSON.parse(localStorage.getItem("bookingFlow")) || {};

// ==================== STEP 1: STUDIO ====================
function renderStudios() {
  const container = document.getElementById("studio-list");
  if (!container) return;

  container.innerHTML = STUDIOS.map(
    (s) => `
        <div class="studio-card" onclick="selectStudio('${s.StudioCode}')">
            <h3>${s.Name}</h3>
            <p>${s.Location}</p>
            <span class="sports-tag">${s.SportTypes.join(" • ")}</span>
        </div>
    `,
  ).join("");
}

function selectStudio(code) {
  flow.studio = STUDIOS.find((s) => s.StudioCode === code);
  saveFlow();
  window.location.href = "/views/sport.html";
}

// ==================== STEP 2: SPORT ====================
function renderSports() {
  const container = document.getElementById("sport-list");
  if (!container || !flow.studio) return;

  document.getElementById("selected-studio-label").textContent =
    `at ${flow.studio.Name}`;

  const sports = SPORT_TYPES.filter((st) =>
    flow.studio.SportTypes.includes(st.SportName),
  );
  container.innerHTML = sports
    .map(
      (s) => `
        <div class="sport-card" onclick="selectSport('${s.SportName}')">
            <h3>${s.SportName}</h3>
            <p>Intensity: ${s.IntensityLevel}</p>
        </div>
    `,
    )
    .join("");
}

function selectSport(name) {
  flow.sport = SPORT_TYPES.find((s) => s.SportName === name);
  saveFlow();
  window.location.href = "/views/room.html";
}

// ==================== STEP 3: ROOM ====================
function renderRooms() {
  const container = document.getElementById("room-list");
  if (!container || !flow.studio || !flow.sport) return;

  document.getElementById("selected-sport-label").textContent =
    `${flow.sport.SportName} at ${flow.studio.Name}`;

  const rooms = ROOMS.filter(
    (r) =>
      r.StudioCode === flow.studio.StudioCode &&
      r.SportType === flow.sport.SportName,
  );

  if (rooms.length === 0) {
    container.innerHTML = "<p>No rooms available.</p>";
    return;
  }

  container.innerHTML = rooms
    .map(
      (r) => `
        <div class="room-card">
            <h3>${r.RoomName}</h3>
            <p>Capacity: ${r.Capacity} people</p>
            <p>Sport: ${r.SportType}</p>
            <p class="times">Available: ${r.AvailableTimes.join(", ")}</p>
            <button class="btn-primary" onclick="selectRoom(${r.RoomID})">Select</button>
        </div>
    `,
    )
    .join("");
}

function selectRoom(id) {
  flow.room = ROOMS.find((r) => r.RoomID === id);

  const date = document.getElementById("filterDate")?.value;
  const time = document.getElementById("filterTime")?.value;
  if (date) flow.date = date;
  if (time) flow.time = time;

  saveFlow();
  window.location.href = "/views/summary.html";
}

function applyFilters() {
  renderRooms(); // Simplified: re-render with filters (extend as needed)
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
