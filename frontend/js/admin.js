/* ============================================
   admin.js - Admin Dashboard
   FEATURES:
   - ตรวจสอบสิทธิ์ Admin
   - Summary Cards (Members, Bookings, Revenue)
   - Report 1: Available Rooms
   - Report 2: Member Points Summary
   - Report 3: Popular Courses + Revenue
   - Reward Catalog (CRUD)
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
  rewards: [
    {
      RewardID: 1,
      Name: "Spa Voucher 500 THB",
      PointCost: 500,
      Category: "Beauty",
    },
    { RewardID: 2, Name: "Hair Treatment", PointCost: 300, Category: "Beauty" },
    { RewardID: 3, Name: "Yoga Mat", PointCost: 800, Category: "Sports" },
    { RewardID: 4, Name: "10% Discount", PointCost: 100, Category: "Discount" },
  ],
  availableRooms: [
    { RoomID: 1, RoomName: "Yoga Room A", Capacity: 20, SportType: "Yoga" },
    {
      RoomID: 4,
      RoomName: "Badminton Court D",
      Capacity: 4,
      SportType: "Badminton",
    },
  ],
};

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
  // Summary Cards
  document.getElementById("totalMembers").textContent = MOCK_ADMIN.totalMembers;
  document.getElementById("totalBookings").textContent =
    MOCK_ADMIN.totalBookings;
  document.getElementById("totalRevenue").textContent =
    "฿" + MOCK_ADMIN.totalRevenue.toLocaleString();
  document.getElementById("totalPointsRedeemed").textContent =
    MOCK_ADMIN.totalPointsRedeemed.toLocaleString();

  // Report 3: Popular Courses
  const courseTable = document.querySelector("#popularCoursesTable tbody");
  if (courseTable) {
    courseTable.innerHTML = MOCK_ADMIN.popularCourses
      .map(
        (c) => `
            <tr>
                <td>${c.Title}</td>
                <td>${c.Enrollments}</td>
                <td class="earned">฿${c.Revenue.toLocaleString()}</td>
            </tr>
        `,
      )
      .join("");
  }

  // Report 2: Member Points
  const pointsTable = document.querySelector("#memberPointsTable tbody");
  if (pointsTable) {
    pointsTable.innerHTML = MOCK_ADMIN.memberPoints
      .map(
        (m) => `
            <tr>
                <td>${m.Name}</td>
                <td class="earned">+${m.Earned}</td>
                <td class="redeemed">-${m.Redeemed}</td>
                <td class="balance">${m.Balance}</td>
            </tr>
        `,
      )
      .join("");
  }

  // Reward Catalog
  const rewardList = document.getElementById("adminRewardList");
  if (rewardList) {
    rewardList.innerHTML = MOCK_ADMIN.rewards
      .map(
        (r) => `
            <div class="reward-card">
                <span class="category">${r.Category}</span>
                <h3>${r.Name}</h3>
                <p class="points">${r.PointCost} pts</p>
                <button class="btn-secondary" onclick="editReward(${r.RewardID})">Edit</button>
                <button class="btn-danger" onclick="deleteReward(${r.RewardID})">Delete</button>
            </div>
        `,
      )
      .join("");
  }
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

  // TODO: call API /api/admin/available-rooms?date=...
  if (MOCK_ADMIN.availableRooms.length === 0) {
    container.innerHTML =
      '<p style="color:var(--text-mid);">No rooms available.</p>';
    return;
  }

  container.innerHTML = MOCK_ADMIN.availableRooms
    .map(
      (r) => `
        <div class="room-card">
            <h3>${r.RoomName}</h3>
            <p>Capacity: ${r.Capacity} people</p>
            <p>Sport: ${r.SportType}</p>
        </div>
    `,
    )
    .join("");
}

// ==================== REWARD CRUD ====================
function editReward(id) {
  const reward = MOCK_ADMIN.rewards.find((r) => r.RewardID === id);
  if (!reward) return;
  // TODO: เปิด form แก้ไข
  alert(`Edit reward: ${reward.Name} (Prototype)`);
}

function deleteReward(id) {
  const reward = MOCK_ADMIN.rewards.find((r) => r.RewardID === id);
  if (!reward) return;

  if (confirm(`Delete "${reward.Name}"?`)) {
    // TODO: call API DELETE /api/rewards/:id
    MOCK_ADMIN.rewards = MOCK_ADMIN.rewards.filter((r) => r.RewardID !== id);
    loadDashboard();
    alert("Reward deleted (Prototype)");
  }
}
