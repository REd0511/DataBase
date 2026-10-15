/* ============================================
   booking-history.js - Booking History (API)
   ============================================ */

let allBookings = [];
let currentUser = null;

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", async () => {
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

  await loadBookings();
  renderHistory();
});

// ==================== LOAD BOOKINGS FROM API ====================
async function loadBookings() {
  try {
    let bookings = [];

    if (currentUser.role === "admin" || currentUser.role === "manager") {
      bookings = await SheSparksAPI.bookings();
    } else if (currentUser.role === "trainer") {
      const trainerId = currentUser.trainerId || 1;
      bookings = await SheSparksAPI.get(`/trainers/${trainerId}/bookings`);
    } else {
      const memberId = currentUser.MemberID || currentUser.id;
      bookings = await SheSparksAPI.memberBookings(memberId);
    }

    allBookings = bookings || [];

    allBookings.sort((a, b) => {
      const dateA = new Date(a.BookingDate || a.CreatedAt || 0);
      const dateB = new Date(b.BookingDate || b.CreatedAt || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Load bookings error:", error);
    allBookings = [];

    const tbody = document.getElementById("bookingTableBody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center;padding:40px;color:var(--danger);">
            โหลดประวัติการจองไม่สำเร็จ: ${error.message}
          </td>
        </tr>
      `;
    }
  }
}

// ==================== RENDER HISTORY ====================
function renderHistory(filteredBookings = null) {
  const bookings = filteredBookings || allBookings;

  const totalBookings = bookings.length;
  const totalPoints = bookings.reduce((sum, b) => sum + Number(b.Points || 0), 0);
  const upcoming = bookings.filter((b) => b.Status === "Confirmed" || b.Status === "Pending" || !b.Status).length;
  const completed = bookings.filter((b) => b.Status === "Completed").length;

  const elTotal = document.getElementById("totalBookings");
  const elPoints = document.getElementById("totalPoints");
  const elUpcoming = document.getElementById("upcomingBookings");
  const elCompleted = document.getElementById("completedBookings");

  if (elTotal) elTotal.textContent = totalBookings;
  if (elPoints) elPoints.textContent = totalPoints;
  if (elUpcoming) elUpcoming.textContent = upcoming;
  if (elCompleted) elCompleted.textContent = completed;

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

  tbody.innerHTML = bookings
    .map((b) => {
      const rawDate = b.BookingDate || b.Date || "-";
      let date = rawDate;
      if (rawDate !== "-" && rawDate.includes("T")) {
        const d = new Date(rawDate);
        date = d.getFullYear() + "-" + 
               String(d.getMonth() + 1).padStart(2, '0') + "-" + 
               String(d.getDate()).padStart(2, '0');
      }
      const startTime = (b.StartTime || "-").substring(0, 5);
      const endTime = (b.EndTime || "-").substring(0, 5);
      const studio = b.Location || b.StudioName || b.StudioLocation || "-";
      const sport = b.SportName || "-";
      const room = b.RoomName || "-";
      const capacity = b.Capacity || "-";
      const trainer = b.TrainerName || b.TrainerID || "—";
      const equipment = b.Equipments && b.Equipments.length > 0
          ? b.Equipments.map((e) => e.Name || e).join(", ")
          : "—";
      const points = b.Points || 0;
      const amount = Number(b.Amount || 0);
      const status = b.Status || "Confirmed";

      const isCancelable = status !== "Cancelled" && status !== "Completed";

      return `
        <tr>
          <td>${date}</td>
          <td>${startTime} - ${endTime}</td>
          <td>${studio}</td>
          <td>${sport}</td>
          <td>${room}</td>
          <td>${capacity} people</td>
          <td>${trainer}</td>
          <td>${equipment}</td>
          <td style="color: var(--gold); font-weight: 600;">฿${amount.toLocaleString()}</td>
          <td style="color: var(--pink-deep); font-weight: 600;">+${points}</td>
          <td>
            <span class="status-badge ${getStatusClass(status)}">
              ${status}
            </span>
            ${isCancelable ? `<br><button onclick="cancelMyBooking(${b.BookingID})" style="margin-top:8px; padding:4px 10px; font-size:0.75rem; background:var(--white); color:var(--danger); border:1px solid var(--danger); border-radius:50px; cursor:pointer; transition:all 0.2s;">Cancel</button>` : ''}
          </td>
        </tr>
      `;
    })
    .join("");
}

// ==================== CANCEL BOOKING ====================
async function cancelMyBooking(bookingId) {
  if (!confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้?")) return;

  try {
    await SheSparksAPI.delete(`/bookings/${bookingId}`);
    
    showModal({
      type: "success",
      title: "Cancelled",
      message: "ยกเลิกการจองสำเร็จ",
      onClose: async () => {
        await loadBookings();
        renderHistory();
      }
    });
  } catch (error) {
    showModal({
      type: "error",
      title: "Error",
      message: "ไม่สามารถยกเลิกการจองได้: " + error.message
    });
  }
}

// ==================== FILTER ====================
function filterBookings() {
  const status = document.getElementById("statusFilter")?.value;
  const date = document.getElementById("dateFilter")?.value;

  let filtered = [...allBookings];

  if (status) {
    filtered = filtered.filter((b) => (b.Status || "Confirmed") === status);
  }

  if (date) {
    filtered = filtered.filter((b) => {
        const rawDate = b.BookingDate || b.Date || "-";
        let dStr = rawDate;
        if (rawDate !== "-" && rawDate.includes("T")) {
          const d = new Date(rawDate);
          dStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
        }
        return dStr === date;
    });
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
    Confirmed: "confirmed",
    Pending: "confirmed",
    Completed: "completed",
    Cancelled: "cancelled",
  };
  return map[status] || "confirmed";
}