/* ============================================
   points.js - Points Page
   FEATURES:
   - Load points from localStorage.bookings (real data)
   - Fallback to 0 if no data
   - Show transaction history with running balance
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  // Load points from localStorage.bookings
  const points = calculateMemberPoints(user);

  renderPoints(points);
});

// ==================== CALCULATE POINTS FROM BOOKINGS ====================
function calculateMemberPoints(user) {
  if (!user || user.role !== "member") {
    // FALLBACK: 0 if not a member
    return {
      total: 0,
      history: [],
      isMock: true,
    };
  }

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  // Filter bookings of this member only
  const memberBookings = bookings.filter((b) => b.MemberID === user.id);

  if (memberBookings.length === 0) {
    // FALLBACK: 0 if no bookings
    return {
      total: 0,
      history: [],
      isMock: true,
    };
  }

  // Calculate points
  let total = 0;
  const history = [];

  memberBookings.forEach((booking) => {
    const earned = booking.Points || 0;

    if (earned > 0) {
      history.push({
        Date: booking.Date,
        Earned: earned,
        Redeemed: 0,
        Description: `Booking: ${booking.RoomName || "-"}`,
      });
      total += earned;
    }
  });

  // Sort by date (newest first)
  history.sort((a, b) => new Date(b.Date) - new Date(a.Date));

  return {
    total,
    history,
    isMock: false,
  };
}

// ==================== RENDER POINTS ====================
function renderPoints(points) {
  // ==================== TOTAL POINTS ====================
  const totalEl = document.getElementById("totalPoints");
  if (totalEl) {
    totalEl.textContent = points.total.toLocaleString();
  }

  // ==================== HISTORY TABLE ====================
  const tbody = document.querySelector("#pointsTable tbody");
  if (!tbody) return;

  if (!points.history || points.history.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 40px; color: var(--text-mid);">
          <strong style="display: block; font-size: 1rem; margin-bottom: 8px; color: var(--pink-deep);">
            No Transaction History Yet
          </strong>
          Start booking to earn points!
        </td>
      </tr>
    `;
    return;
  }

  let balance = 0;
  const rows = points.history
    .map((h) => {
      balance += (h.Earned || 0) - (h.Redeemed || 0);
      return `
      <tr>
        <td>${h.Date}</td>
        <td class="earned">${h.Earned > 0 ? "+" + h.Earned : "—"}</td>
        <td class="redeemed">${h.Redeemed > 0 ? "-" + h.Redeemed : "—"}</td>
        <td class="balance">${balance.toLocaleString()}</td>
      </tr>
    `;
    })
    .join("");

  tbody.innerHTML = rows;
}
