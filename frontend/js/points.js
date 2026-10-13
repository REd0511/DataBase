/* ============================================
   points.js - Points Page
   FEATURES:
   - Load points + redemptions from localStorage
   - Show combined transaction history
   - Fallback to 0 if no data
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const points = calculateMemberPoints(user);
  renderPoints(points);
});

// ==================== CALCULATE POINTS ====================
function calculateMemberPoints(user) {
  if (!user || user.role !== "member") {
    return { total: 0, history: [], isMock: true };
  }

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const redemptions = JSON.parse(localStorage.getItem("redemptions")) || [];

  // กรองของ Member
  const memberBookings = bookings.filter((b) => b.MemberID === user.id);
  const memberRedemptions = redemptions.filter((r) => r.MemberID === user.id);

  if (memberBookings.length === 0 && memberRedemptions.length === 0) {
    return { total: 0, history: [], isMock: true };
  }

  const history = [];
  let earned = 0;
  let redeemed = 0;

  // ✅ เพิ่ม Earned จาก Bookings
  memberBookings.forEach((booking) => {
    const points = booking.Points || 0;
    if (points > 0) {
      history.push({
        Date: booking.Date,
        Earned: points,
        Redeemed: 0,
        Description: `Booking: ${booking.RoomName || "-"}`,
      });
      earned += points;
    }
  });

  // ✅ เพิ่ม Redeemed จาก Redemptions
  memberRedemptions.forEach((redemption) => {
    history.push({
      Date: redemption.RedemptionDate,
      Earned: 0,
      Redeemed: redemption.PointsUsed || 0,
      Description: `Redeemed: ${redemption.RewardName || "-"}`,
    });
    redeemed += redemption.PointsUsed || 0;
  });

  // เรียงตามวันที่ (ใหม่ → เก่า)
  history.sort((a, b) => new Date(b.Date) - new Date(a.Date));

  return {
    total: earned - redeemed,
    history,
    isMock: false,
  };
}

// ==================== RENDER POINTS ====================
function renderPoints(points) {
  // Total Points
  const totalEl = document.getElementById("totalPoints");
  if (totalEl) {
    totalEl.textContent = points.total.toLocaleString();
  }

  // History Table
  const tbody = document.querySelector("#pointsTable tbody");
  if (!tbody) return;

  if (!points.history || points.history.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-mid);">
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
          <td>${h.Description || "—"}</td>
          <td class="earned">${h.Earned > 0 ? "+" + h.Earned : "—"}</td>
          <td class="redeemed">${h.Redeemed > 0 ? "-" + h.Redeemed : "—"}</td>
          <td class="balance">${balance.toLocaleString()}</td>
        </tr>
      `;
    })
    .join("");

  tbody.innerHTML = rows;
}
