/* ============================================
   points.js - Points Page (API Connected)
   ============================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "member") {
    renderEmptyPoints("กรุณาเข้าสู่ระบบในฐานะสมาชิก (Member)");
    return;
  }

  const memberId = user.MemberID || user.id;

  try {
    const api = window.SheSparksAPI;

    // โหลดข้อมูลแบบขนาน (Parallel) เพื่อความรวดเร็ว
    const [pointsData, redemptionsData, bookingsData] = await Promise.allSettled([
      api.memberPoints(memberId),
      api.get(`/rewards/member/${memberId}`),
      api.memberBookings(memberId)
    ]);

    const totalPoints = pointsData.status === "fulfilled" ? Number(pointsData.value.Balance || 0) : 0;
    const redemptions = redemptionsData.status === "fulfilled" && Array.isArray(redemptionsData.value) ? redemptionsData.value : [];
    const bookings = bookingsData.status === "fulfilled" && Array.isArray(bookingsData.value) ? bookingsData.value : [];

    // สร้าง Transaction History (ประวัติการได้แต้มและใช้แต้ม)
    const history = [];

    // เพิ่มประวัติการได้แต้มจากการจอง
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

    // เพิ่มประวัติการใช้แต้มแลกของรางวัล
    redemptions.forEach((r) => {
      history.push({
        Date: r.RedemptionDate,
        Description: `Redeemed: ${r.RewardName || "-"}`,
        Earned: 0,
        Redeemed: Number(r.PointsUsed || 0),
      });
    });

    // เรียงประวัติตามวันที่ (ใหม่สุดขึ้นก่อน)
    history.sort((a, b) => new Date(b.Date) - new Date(a.Date));

    // แสดงผลข้อมูลลงหน้าเว็บ
    renderPoints({ total: totalPoints, history });
    renderMemberLevel(user);

  } catch (error) {
    console.error("Points Load Error:", error);
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

  let runningBalance = points.total; // เริ่มต้นจากแต้มปัจจุบัน
  
  // สร้างแถวข้อมูลประวัติ
  const rowsHtml = points.history.map((h, index) => {
    // 1. แปลงรูปแบบวันที่ให้อ่านง่ายและตัด Timezone
    const rawDate = h.Date || "-";
    let dateDisplay = rawDate;
    if (rawDate !== "-" && String(rawDate).includes("T")) {
      const d = new Date(rawDate);
      dateDisplay = d.getFullYear() + "-" + 
                    String(d.getMonth() + 1).padStart(2, '0') + "-" + 
                    String(d.getDate()).padStart(2, '0');
    }

    // 2. คำนวณ Balance ย้อนหลัง
    const currentBalance = runningBalance;
    runningBalance = runningBalance - (h.Earned || 0) + (h.Redeemed || 0);

    return `
      <tr>
        <td>${dateDisplay}</td>
        <td>${h.Description || "—"}</td>
        <td class="earned">${h.Earned > 0 ? "+" + h.Earned.toLocaleString() : "—"}</td>
        <td class="redeemed">${h.Redeemed > 0 ? "-" + h.Redeemed.toLocaleString() : "—"}</td>
        <td class="balance">${currentBalance.toLocaleString()}</td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = rowsHtml;
}

// ==================== RENDER EMPTY STATE ====================
function renderEmptyPoints(errorMsg) {
  const totalEl = document.getElementById("totalPoints");
  if (totalEl) totalEl.textContent = "0";

  const tbody = document.querySelector("#pointsTable tbody");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:40px;color:var(--danger);">
          ${errorMsg || "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
        </td>
      </tr>
    `;
  }
}

// ==================== RENDER MEMBER LEVEL ====================
function renderMemberLevel(user) {
  if (!user) return;

  const level = user.memberLevel || user.MemberLevel || "Silver";
  
  // ตั้งค่าข้อมูลระดับสมาชิก
  const MEMBER_LEVELS = {
    Silver: { pointsMultiplier: 1, discount: 0 },
    Gold: { pointsMultiplier: 1.5, discount: 5 },
    Platinum: { pointsMultiplier: 2, discount: 10 },
  };
  
  const info = MEMBER_LEVELS[level] || MEMBER_LEVELS.Silver;

  const badge = document.getElementById("memberLevelBadge");
  if (badge) badge.textContent = level;

  const badgeWrap = document.querySelector(".member-level-badge");
  if (badgeWrap) badgeWrap.setAttribute("data-level", level);

  const infoEl = document.getElementById("memberLevelInfo");
  if (infoEl) {
    infoEl.textContent = `Points ×${info.pointsMultiplier} • Discount ${info.discount}%`;
  }
}