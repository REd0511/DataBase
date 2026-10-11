/* ============================================
   booking-history.js - Booking History
   FEATURES:
   - แสดงประวัติการจองของ Member
   - Admin/Manager เห็นทั้งหมด
   - Trainer เห็นเฉพาะของตัวเอง
   ============================================ */

let allBookings = [];
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  currentUser = JSON.parse(localStorage.getItem("user"));

  if (!currentUser) {
    showModal({
      type: "warning",
      title: "Please Login",
      message: "กรุณาเข้าสู่ระบบก่อนดูประวัติการจอง",
      buttonText: "ไปที่ Login",
      redirectTo: "/views/login.html",
    });
    return;
  }

  loadBookings();
  renderHistory();
});

// ==================== LOAD BOOKINGS ====================
function loadBookings() {
  const allBookingsRaw = JSON.parse(localStorage.getItem("bookings")) || [];

  if (currentUser.role === "admin" || currentUser.role === "manager") {
    allBookings = allBookingsRaw;
  } else if (currentUser.role === "trainer") {
    allBookings = allBookingsRaw.filter(b =>
      b.TrainerID === currentUser.trainerId
    );
  } else {
    allBookings = allBookingsRaw.filter(b =>
      b.MemberID === currentUser.id
    );
  }

  allBookings.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
}

// ==================== RENDER HISTORY ====================
function renderHistory(filteredBookings = null) {
  const bookings = filteredBookings || allBookings;

  // SUMMARY CARDS
  const totalBookings = bookings.length;
  const totalPoints = bookings.reduce((sum, b) => sum + (b.Points || 0), 0);
  const upcoming = bookings.filter(b => b.Status === "Confirmed").length;
  const completed = bookings.filter(b => b.Status === "Completed").length;

  const elTotal = document.getElementById("totalBookings");
  const elPoints = document.getElementById("totalPoints");
  const elUpcoming = document.getElementById("upcomingBookings");
  const elCompleted = document.getElementById("completedBookings");

  if (elTotal) elTotal.textContent = totalBookings;
  if (elPoints) elPoints.textContent = totalPoints;
  if (elUpcoming) elUpcoming.textContent = upcoming;
  if (elCompleted) elCompleted.textContent = completed;

  // TABLE
  const tbody = document.getElementById("bookingTableBody");
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <h3>No Bookings Yet</h3>
            <p>คุณยังไม่มีการจอง เริ่มจองเลย!</p>
            <a href="/views/booking.html" class="btn-primary">Book Now</a>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.Date || "-"}</td>
      <td>${b.StartTime} - ${b.EndTime}</td>
      <td>${b.StudioName || "-"}</td>
      <td>${b.SportName || "-"}</td>
      <td>${b.RoomName || "-"}</td>
      <td>${b.Capacity || "-"} people</td>
      <td>${b.TrainerName || "—"}</td>
      <td>${b.Equipments && b.Equipments.length > 0 ? b.Equipments.map(e => e.Name).join(", ") : "—"}</td>
      <td style="color: var(--pink-deep); font-weight: 600;">+${b.Points || 0}</td>
      <td>
        <span class="status-badge ${getStatusClass(b.Status)}">
          ${b.Status || "Confirmed"}
        </span>
      </td>
    </tr>
  `).join("");
}

// ==================== FILTER ====================
function filterBookings() {
  const status = document.getElementById("statusFilter")?.value;
  const date = document.getElementById("dateFilter")?.value;

  let filtered = [...allBookings];

  if (status) {
    filtered = filtered.filter(b => b.Status === status);
  }

  if (date) {
    filtered = filtered.filter(b => b.Date === date);
  }

  renderHistory(filtered);
}

function clearFilters() {
  const sf = document.getElementById("statusFilter");
  const df = document.getElementById("dateFilter");
  if (sf) sf.value = "";
  if (df) df.value = "";
  renderHistory();
}

// ==================== HELPERS ====================
function getStatusClass(status) {
  const map = {
    "Confirmed": "confirmed",
    "Completed": "completed",
    "Cancelled": "cancelled",
  };
  return map[status] || "confirmed";
}