/* ============================================
   points.js - Points Page (API Connected)
   ✅ แก้: ใช้ /members/:id/transactions โดยตรง
   ============================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || (user.role !== "member" && user.role !== "admin")) {
    renderEmptyPoints("กรุณาเข้าสู่ระบบในฐานะสมาชิก (Member)");
    return;
  }

  const memberId = user.MemberID || user.id;

  try {
    const api = window.SheSparksAPI;

    // ✅ เรียก 2 API: Points Summary + Transactions (จาก POINT_TRANSACTION โดยตรง)
    const [pointsData, transactionsData] = await Promise.allSettled([
      api.memberPoints(memberId),
      api.get(`/members/${memberId}/transactions`)
    ]);

    const apiBalance = pointsData.status === "fulfilled"
      ? Number(pointsData.value.Balance || 0)
      : 0;

    const transactions = transactionsData.status === "fulfilled" && Array.isArray(transactionsData.value)
      ? transactionsData.value
      : [];

    // ✅ สร้าง History โดยตรงจาก Transactions
    // (Backend ส่ง TransactionDate ที่มีเวลาจริงมาแล้ว)
    const history = transactions.map((t) => {
      const pointsChange = Number(t.PointsChange || 0);

      // สร้าง Description จาก Reason
      let description = "—";
      if (t.Reason === "EARN_FROM_BOOKING") {
        description = `Booking (฿${Number(t.Amount || 0).toLocaleString()})`;
      } else if (t.Reason === "EARN_FROM_COURSE") {
        description = `Course Enrollment (฿${Number(t.Amount || 0).toLocaleString()})`;
      } else if (t.Reason === "REDEEM_REWARD") {
        description = `Redeemed Reward`;
      } else if (t.Reason === "EARN_FROM_PAYMENT") {
        description = `Payment (฿${Number(t.Amount || 0).toLocaleString()})`;
      } else {
        description = t.Reason || "—";
      }

      return {
        Date: t.TransactionDate || t.Date,       // ✅ วันที่จริงจาก POINT_TRANSACTION
        TransactionID: t.TransactionID,          // ✅ ID จริง
        Description: description,
        Earned: pointsChange > 0 ? pointsChange : 0,
        Redeemed: pointsChange < 0 ? Math.abs(pointsChange) : 0,
      };
    });

    // ✅ Sort: ใหม่สุดก่อน (ใช้ TransactionID เป็น tie-breaker)
    history.sort((a, b) => {
      const dateA = new Date(a.Date).getTime() || 0;
      const dateB = new Date(b.Date).getTime() || 0;

      if (dateB !== dateA) return dateB - dateA;

      // วัน+เวลาเดียวกัน → TransactionID มาก = ใหม่กว่า
      return (b.TransactionID || 0) - (a.TransactionID || 0);
    });

    // คำนวณ Balance ย้อนหลัง
    let runningBalance = apiBalance;
    const withBalance = history.map((h) => {
      const currentBalance = runningBalance;
      runningBalance = runningBalance - (h.Earned || 0) + (h.Redeemed || 0);
      return { ...h, BalanceAfter: currentBalance };
    });

    renderPoints({ total: apiBalance, history: withBalance });
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

  const rowsHtml = points.history.map((h) => {
    const rawDate = h.Date || "-";
    let dateDisplay = rawDate;
    if (rawDate !== "-" && String(rawDate).includes("T")) {
      const d = new Date(rawDate);
      dateDisplay = d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, '0') + "-" +
        String(d.getDate()).padStart(2, '0');
    } else if (rawDate !== "-" && String(rawDate).includes(" ")) {
      dateDisplay = String(rawDate).split(" ")[0];
    }

    const earned = Number(h.Earned || 0);
    const redeemed = Number(h.Redeemed || 0);
    const balance = Number(h.BalanceAfter || 0);

    return `
      <tr>
        <td>${dateDisplay}</td>
        <td>${h.Description || "—"}</td>
        <td class="earned">${earned > 0 ? "+" + earned.toLocaleString() : "—"}</td>
        <td class="redeemed">${redeemed > 0 ? "-" + redeemed.toLocaleString() : "—"}</td>
        <td class="balance">${balance.toLocaleString()}</td>
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