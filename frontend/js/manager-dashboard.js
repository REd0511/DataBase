/* ============================================
   manager-dashboard.js - Studio Manager Dashboard
   FEATURES:
   - ตรวจสอบสิทธิ์ Manager
   - แสดง Profile ของ Manager
   - แสดง Rooms ใน Studio
   - แสดง Trainers ใน Studio
   - แสดง Today's Bookings (Mock)
   - แสดง Equipment Inventory (Mock)
   ============================================ */

// ==================== MOCK DATA ====================
const MOCK_TODAY_BOOKINGS = [
    { Time: "09:00 - 11:00", Room: "Yoga Room A", Sport: "Yoga", Member: "Member A", Status: "Paid" },
    { Time: "11:00 - 13:00", Room: "Pilates Room B", Sport: "Pilates", Member: "Member B", Status: "Paid" },
    { Time: "14:00 - 16:00", Room: "Yoga Room A", Sport: "Yoga", Member: "Member C", Status: "Pending" },
];

const MOCK_EQUIPMENT = [
    { EquipmentID: 1, Name: "Yoga Mat Pro", SportName: "Yoga", Condition: "Good", LateFee: 50 },
    { EquipmentID: 2, Name: "Pilates Ball", SportName: "Pilates", Condition: "Good", LateFee: 80 },
    { EquipmentID: 3, Name: "Yoga Block", SportName: "Yoga", Condition: "Fair", LateFee: 30 },
    { EquipmentID: 4, Name: "Pilates Ring", SportName: "Pilates", Condition: "Good", LateFee: 100 },
];

// ==================== CHECK MANAGER LOGIN ====================
window.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "manager") {
        alert("Please login as Studio Manager");
        window.location.href = "/views/login.html";
        return;
    }

    loadManagerDashboard(user);
});

// ==================== LOAD DASHBOARD ====================
function loadManagerDashboard(user) {
    // ==================== STUDIO PROFILE ====================
    const studio = STUDIOS.find(s => s.StudioCode === user.studioCode);
    if (!studio) {
        alert("Studio not found");
        return;
    }

    document.getElementById("profile-avatar").textContent = user.name.charAt(0);
    document.getElementById("manager-name").textContent = user.name;
    document.getElementById("manager-studio").textContent = `🏢 ${studio.Name}`;
    document.getElementById("manager-location").textContent = `📍 ${studio.Location}`;
    document.getElementById("manager-sporttypes").textContent = `🏋️ ${studio.SportTypes.join(" • ")}`;

    // ==================== FILTER DATA ====================
    const studioRooms = ROOMS.filter(r => r.StudioCode === studio.StudioCode);
    const studioTrainers = TRAINERS.filter(t => t.StudioCode === studio.StudioCode);

    // ==================== SUMMARY CARDS ====================
    document.getElementById("roomCount").textContent = studioRooms.length;
    document.getElementById("trainerCount").textContent = studioTrainers.length;
    document.getElementById("bookingCount").textContent = MOCK_TODAY_BOOKINGS.length;
    document.getElementById("equipmentCount").textContent = MOCK_EQUIPMENT.length;

    // ==================== ROOMS ====================
    const roomsList = document.getElementById("roomsList");
    if (roomsList) {
        if (studioRooms.length === 0) {
            roomsList.innerHTML = '<p style="color:var(--text-mid);">No rooms in this studio.</p>';
        } else {
            roomsList.innerHTML = studioRooms.map(r => `
        <div class="room-card">
          <h3>${r.RoomName}</h3>
          <p>Capacity: ${r.Capacity} people</p>
          <p>Sport: ${r.SportType}</p>
        </div>
      `).join("");
        }
    }

    // ==================== TRAINERS ====================
    const trainersList = document.getElementById("trainersList");
    if (trainersList) {
        if (studioTrainers.length === 0) {
            trainersList.innerHTML = '<p style="color:var(--text-mid);">No trainers in this studio.</p>';
        } else {
            trainersList.innerHTML = studioTrainers.map(t => `
        <div class="trainer-card">
          <div class="avatar">${t.Name.split(" ")[1]?.[0] || "T"}</div>
          <h3>${t.Name}</h3>
          <span class="specialty">${t.SportType}</span>
          <p>${t.Phone}</p>
        </div>
      `).join("");
        }
    }

    // ==================== TODAY'S BOOKINGS ====================
    const bookingsTable = document.querySelector("#bookingsTable tbody");
    if (bookingsTable) {
        bookingsTable.innerHTML = MOCK_TODAY_BOOKINGS.map(b => `
      <tr>
        <td>${b.Time}</td>
        <td>${b.Room}</td>
        <td>${b.Sport}</td>
        <td>${b.Member}</td>
        <td class="${b.Status === "Paid" ? "earned" : "redeemed"}">${b.Status}</td>
      </tr>
    `).join("");
    }

    // ==================== EQUIPMENT INVENTORY ====================
    const equipmentTable = document.querySelector("#equipmentTable tbody");
    if (equipmentTable) {
        equipmentTable.innerHTML = MOCK_EQUIPMENT.map(e => `
      <tr>
        <td>${e.Name}</td>
        <td>${e.SportName}</td>
        <td>${e.Condition}</td>
        <td>฿${e.LateFee}</td>
      </tr>
    `).join("");
    }
}