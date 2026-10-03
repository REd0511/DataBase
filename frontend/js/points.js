/* ============================================
   points.js - Points Page
   FEATURES:
   - แสดงแต้มสะสมทั้งหมด
   - แสดงประวัติการได้/ใช้แต้ม พร้อม Balance
   - TODO: เชื่อมกับ API /api/points/:memberId
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  renderPoints();
});

function renderPoints() {
  const user = JSON.parse(localStorage.getItem("user"));

  // Total Points
  const totalEl = document.getElementById("totalPoints");
  if (totalEl) {
    totalEl.textContent =
      user && user.role === "admin" ? POINTS.total : POINTS.total;
  }

  // History Table with running balance
  const tbody = document.querySelector("#pointsTable tbody");
  if (!tbody) return;

  let balance = 0;
  const rows = POINTS.history
    .map((h) => {
      balance += h.Earned - h.Redeemed;
      return `
            <tr>
                <td>${h.Date}</td>
                <td class="earned">${h.Earned > 0 ? "+" + h.Earned : "—"}</td>
                <td class="redeemed">${h.Redeemed > 0 ? "-" + h.Redeemed : "—"}</td>
                <td class="balance">${balance}</td>
            </tr>
        `;
    })
    .join("");

  tbody.innerHTML = rows;
}
