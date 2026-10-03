/* ============================================
   points.js - Points Page
   FEATURES:
   - แสดงแต้มสะสมทั้งหมด
   - แสดงประวัติการได้/ใช้แต้ม
   - TODO: เชื่อมกับ API /api/points/:memberId
   ============================================ */

const MOCK_POINTS = {
    total: 1250,
    history: [
        { Date: '2026-09-01', Earned: 300, Redeemed: 0 },
        { Date: '2026-09-05', Earned: 0, Redeemed: 200 },
        { Date: '2026-09-10', Earned: 500, Redeemed: 0 }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    // Total points
    const totalEl = document.getElementById('totalPoints');
    if (totalEl) totalEl.textContent = MOCK_POINTS.total;

    // History table
    const tbody = document.querySelector('#pointsTable tbody');
    if (tbody) {
        tbody.innerHTML = MOCK_POINTS.history.map(h => `
            <tr>
                <td>${h.Date}</td>
                <td>${h.Earned}</td>
                <td>${h.Redeemed}</td>
            </tr>
        `).join('');
    }
});