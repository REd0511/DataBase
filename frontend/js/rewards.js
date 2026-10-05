/* ============================================
   rewards.js - Rewards Page
   FEATURES:
   - แสดงรายการรางวัลจาก Mock Data
   - กรองตาม Category
   - ปุ่ม Redeem (ตรวจสอบแต้มเพียงพอ)
   - TODO: เชื่อมกับ API /api/rewards, /api/redemptions
   ============================================ */

let allRewards = [];

document.addEventListener("DOMContentLoaded", () => {
  allRewards = REWARDS;
  renderRewards(allRewards);
});

function renderRewards(rewards) {
  const container = document.getElementById("reward-list");
  if (!container) return;

  if (rewards.length === 0) {
    container.innerHTML =
      '<p style="text-align:center;grid-column:1/-1;color:var(--text-mid);">No rewards in this category.</p>';
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const userPoints = POINTS.total;

  container.innerHTML = rewards
    .map((r) => {
      const canAfford = userPoints >= r.PointCost;
      const iconSvg = getCategoryIcon(r.Category);

      return `
            <div class="reward-card">
                <span class="category" data-cat="${r.Category}">${r.Category}</span>
                <div class="reward-icon">${iconSvg}</div>
                <h3>${r.Name}</h3>
                <p class="points">${r.PointCost}</p>
                <button class="btn-primary"
                        ${!canAfford ? "disabled" : ""}
                        onclick="redeemReward(${r.RewardID})">
                    ${canAfford ? "Redeem" : "Not enough points"}
                </button>
            </div>
        `;
    })
    .join("");
}

function getCategoryIcon(category) {
  const icons = {
    Beauty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`,
    Sports: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M4.93 4.93l14.14 14.14"></path></svg>`,
    Discount: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`,
  };
  return icons[category] || icons.Beauty;
}

function filterRewards() {
  const cat = document.getElementById("categoryFilter").value;
  const filtered = cat
    ? allRewards.filter((r) => r.Category === cat)
    : allRewards;
  renderRewards(filtered);
}

function redeemReward(rewardId) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Please login first");
    window.location.href = "/views/login.html";
    return;
  }

  const reward = allRewards.find((r) => r.RewardID === rewardId);
  if (!reward) return;

  if (POINTS.total < reward.PointCost) {
    alert("You do not have enough points.");
    return;
  }

  if (confirm(`Redeem "${reward.Name}" for ${reward.PointCost} points?`)) {
    // TODO: call API /api/redemptions
    alert(
      `🎁 แลกรางวัล "${reward.Name}" สำเร็จ!\n(Prototype — ยังไม่เชื่อมต่อ Backend)`,
    );
  }
}
