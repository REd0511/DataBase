/* ============================================
   admin.js - Admin Dashboard
   FEATURES:
   - แสดง Summary Cards (Members, Bookings, Revenue)
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
        { Title: 'Basic Yoga', Enrollments: 25, Revenue: 37500 },
        { Title: 'Women Boxing', Enrollments: 18, Revenue: 36000 },
        { Title: 'Pilates Intro', Enrollments: 15, Revenue: 18000 }
    ],
    memberPoints: [
        { Name: 'Member A', Earned: 1500, Redeemed: 500, Balance: 1000 },
        { Name: 'Member B', Earned: 800, Redeemed: 200, Balance: 600 },
        { Name: 'Member C', Earned: 2000, Redeemed: 1200, Balance: 800 }
    ],
    rewards: [
        { RewardID: 1, Name: 'Spa Voucher 500 THB', PointCost: 500, Category: 'Beauty' },
        { RewardID: 2, Name: 'Hair Treatment', PointCost: 300, Category: 'Beauty' },
        { RewardID: 3, Name: 'Yoga Mat', PointCost: 800, Category: 'Sports' }
    ],
    availableRooms: [
        { RoomID: 1, RoomName: 'Yoga Room A', Capacity: 20, SportType: 'Yoga' },
        { RoomID: 4, RoomName: 'Badminton Court D', Capacity: 4, SportType: 'Badminton' }
    ]
};

// ==================== CHECK ADMIN LOGIN ====================
window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        alert('Please login as Admin');
        window.location.href = 'login.html';
        return;
    }
    loadDashboard();
});

// ==================== LOAD DASHBOARD ====================
function loadDashboard() {
    // Summary cards
    document.getElementById('totalMembers').textContent = MOCK_ADMIN.totalMembers;
    document.getElementById('totalBookings').textContent = MOCK_ADMIN.totalBookings;
    document.getElementById('totalRevenue').textContent = '฿' + MOCK_ADMIN.totalRevenue.toLocaleString();
    document.getElementById('totalPointsRedeemed').textContent = MOCK_ADMIN.totalPointsRedeemed;

    // Report 3: Popular Courses
    const courseTable = document.querySelector('#popularCoursesTable tbody');
    courseTable.innerHTML = MOCK_ADMIN.popularCourses.map(c => `
        <tr>
            <td>${c.Title}</td>
            <td>${c.Enrollments}</td>
            <td>฿${c.Revenue.toLocaleString()}</td>
        </tr>
    `).join('');

    // Report 2: Member Points
    const pointsTable = document.querySelector('#memberPointsTable tbody');
    pointsTable.innerHTML = MOCK_ADMIN.memberPoints.map(m => `
        <tr>
            <td>${m.Name}</td>
            <td>${m.Earned}</td>
            <td>${m.Redeemed}</td>
            <td>${m.Balance}</td>
        </tr>
    `).join('');

    // Reward Catalog
    const rewardList = document.getElementById('adminRewardList');
    rewardList.innerHTML = MOCK_ADMIN.rewards.map(r => `
        <div class="reward-card">
            <h3>${r.Name}</h3>
            <p>Category: ${r.Category}</p>
            <p>Points: ${r.PointCost}</p>
            <button class="btn-primary" onclick="editReward(${r.RewardID})">Edit</button>
            <button class="btn-primary" style="background:#c00" onclick="deleteReward(${r.RewardID})">Delete</button>
        </div>
    `).join('');
}

// ==================== REPORT 1: AVAILABLE ROOMS ====================
function loadAvailableRooms() {
    const date = document.getElementById('adminDate').value;
    const start = document.getElementById('adminStart').value;
    const end = document.getElementById('adminEnd').value;

    if (!date || !start || !end) {
        alert('Please select date and time');
        return;
    }

    // TODO: call API /api/admin/available-rooms?date=...
    const container = document.getElementById('availableRoomsList');
    container.innerHTML = MOCK_ADMIN.availableRooms.map(r => `
        <div class="room-card">
            <h3>${r.RoomName}</h3>
            <p>Capacity: ${r.Capacity}</p>
            <p>Sport: ${r.SportType}</p>
        </div>
    `).join('');
}

// ==================== REWARD CRUD (Mock) ====================
function editReward(id) {
    alert(`Edit reward ${id} (mock)`);
    // TODO: open edit form
}

function deleteReward(id) {
    if (confirm(`Delete reward ${id}?`)) {
        alert(`Deleted reward ${id} (mock)`);
        // TODO: call API DELETE /api/rewards/:id
    }
}

// ==================== LOGOUT ====================
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}