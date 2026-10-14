/* ============================================
   points.js - Points Page (API Only)
   FEATURES:
   - Load Points Summary from API
   - Load Redemptions from API
   - Load Bookings from API
   - Render History
   - Render Member Level
   ============================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "member") {
    renderEmptyPoints();
    return;
  }

  const memberId = user.MemberID || user.id;

  try {
    // ✅ Load Points Summary from API
    const pointsData = await SheSparksAPI.memberPoints(memberId);

    // ✅ Load Redemptions from API
    let redemptions = [];
    try {
      redemptions = await SheSparksAPI.get(`/rewards/member/${memberId}`);
      redemptions = redemptions || [];
    } catch (e) {
      redemptions = [];
    }

    // ✅ Load Bookings from API
    let bookings = [];
    try {
      bookings = await SheSparksAPI.memberBookings(memberId);
      bookings = bookings || [];
    } catch (e) {
      bookings = [];
    }

    // สร้าง History
    const history = [];

    bookings.forEach((b) => {
      const earned = Number(b.Points || b.PointsEarned || 0);
      if (earned > 0) {
        history.push({
          Date: b.BookingDate,
          Description: `Booking: ${b.RoomName || "-"}`,
          Earned: earned,
          Redeemed: 0,
        });
      }
    });

    redemptions.forEach((r) => {
      history.push({
        Date: r.RedemptionDate,
        Description: `Redeemed: ${r.RewardName || "-"}`,
        Earned: 0,
        Redeemed: Number(r.PointsUsed || 0),
      });
    });

    history.sort((a, b) => new Date(b.Date) - new Date(a.Date));

    renderPoints({
      total: Number(pointsData.Balance || pointsData.balance || 0),
      history,
    });

    renderMemberLevel(user);
  } catch (error) {
    console.error("Points error:", error);
    renderEmptyPoints(error.message);
  }
});

// ==================== RENDER POINTS ====================
function renderPoints(points) {
  const totalEl = document.getElementById("totalPoints");
  if (totalEl) totalEl.textContent = points.total.toLocaleString();

  const tbody = document.querySelector("#pointsTable tbody");
  if (!tbody) return;

  if (!points.history || points.history.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:40px;color:var(--text-mid);">
          <strong style="display:block;font-size:1rem;margin-bottom:8px;color:var(--pink-deep);">
            No Transaction History Yet
          </strong>
          Start booking to earn points!
        </td>
      </tr>
    `;
    return;
  }

  let balance = 0;
  tbody.innerHTML = points.history
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
}

// ==================== RENDER EMPTY ====================
function renderEmptyPoints(errorMsg) {
  const totalEl = document.getElementById("totalPoints");
  if (totalEl) totalEl.textContent = "0";

  const tbody = document.querySelector("#pointsTable tbody");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:40px;color:var(--text-mid);">
          ${errorMsg ? "Error: " + errorMsg : "Please login as member"}
        </td>
      </tr>
    `;
  }
}

// ==================== RENDER MEMBER LEVEL ====================
function renderMemberLevel(user) {
  if (!user) return;

  const level = user.memberLevel || "Silver";
  const info = getMemberLevelInfo(level);

  const badge = document.getElementById("memberLevelBadge");
  if (badge) badge.textContent = level;

  const badgeWrap = document.querySelector(".member-level-badge");
  if (badgeWrap) badgeWrap.setAttribute("data-level", level);

  const infoEl = document.getElementById("memberLevelInfo");
  if (infoEl) {
    infoEl.textContent = `Points ×${info.pointsMultiplier} • Discount ${info.discount}%`;
  }
}