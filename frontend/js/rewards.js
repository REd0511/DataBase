/* ============================================
   rewards.js - Rewards Page (API Only)
   FEATURES:
   - Load Points from API
   - Load Rewards from API
   - Redeem via API
   - Show "Redeemed" state
   ============================================ */

let allRewards = [];
let userPoints = 0;
let userRedemptions = [];
let currentReward = null;

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    showModal({
      type: "warning",
      title: "Please Login",
      message: "Please login to view rewards",
      buttonText: "Go to Login",
      redirectTo: "/views/login.html",
    });
    return;
  }

  const memberId = user.MemberID || user.id;

  // ✅ Load Points from API
  try {
    const pointsData = await SheSparksAPI.memberPoints(memberId);
    userPoints = Number(pointsData.Balance || pointsData.balance || 0);
  } catch (error) {
    console.warn("Cannot load points:", error.message);
    userPoints = 0;
  }

  // ✅ Load Rewards from API
  try {
    const apiRewards = await SheSparksAPI.rewards();
    allRewards = apiRewards || [];
  } catch (error) {
    console.warn("Cannot load rewards:", error.message);
    allRewards = [];
  }

  // ✅ Load Redemptions from API
  try {
    userRedemptions = await SheSparksAPI.get(`/rewards/member/${memberId}`);
    userRedemptions = userRedemptions || [];
  } catch (error) {
    userRedemptions = [];
  }

  renderPointsBadge();
  renderRewards(allRewards);
});

// ==================== RENDER POINTS BADGE ====================
function renderPointsBadge() {
  const badge = document.getElementById("userPointsBadge");
  if (badge) {
    badge.textContent = userPoints.toLocaleString();
  }
}

// ==================== RENDER REWARDS ====================
function renderRewards(rewards) {
  const container = document.getElementById("reward-list");
  if (!container) return;

  if (rewards.length === 0) {
    container.innerHTML =
      '<p style="text-align:center;grid-column:1/-1;color:var(--text-mid);">No rewards available.</p>';
    return;
  }

  container.innerHTML = rewards
    .map((r) => {
      const canAfford = userPoints >= r.PointCost;
      const isRedeemed = userRedemptions.some(
        (red) => Number(red.RewardID) === Number(r.RewardID),
      );

      let buttonHTML = "";
      if (isRedeemed) {
        buttonHTML = `<button class="btn-primary redeemed" disabled>✓ Redeemed</button>`;
      } else if (!canAfford) {
        buttonHTML = `<button class="btn-primary" disabled>Not enough points</button>`;
      } else {
        buttonHTML = `<button class="btn-primary" onclick="openRedeemModal(${r.RewardID})">Redeem</button>`;
      }

      return `
        <div class="reward-card ${isRedeemed ? "is-redeemed" : ""}">
          <span class="category" data-cat="${r.Category}">${r.Category}</span>
          ${
            r.ImageURL
              ? `<img src="${r.ImageURL}" class="reward-image" alt="${r.Name}" onerror="this.style.display='none'">`
              : ""
          }
          <h3>${r.Name}</h3>
          <p class="points">${r.PointCost}</p>
          ${buttonHTML}
        </div>
      `;
    })
    .join("");
}

// ==================== FILTER ====================
function filterRewards() {
  const cat = document.getElementById("categoryFilter").value;
  const filtered = cat
    ? allRewards.filter((r) => r.Category === cat)
    : allRewards;
  renderRewards(filtered);
}

// ==================== OPEN REDEEM MODAL ====================
function openRedeemModal(rewardId) {
  const reward = allRewards.find((r) => Number(r.RewardID) === Number(rewardId));
  if (!reward) return;

  currentReward = reward;

  if (userPoints < reward.PointCost) {
    showModal({
      type: "warning",
      title: "Not Enough Points",
      message: `You need ${reward.PointCost} points but you only have ${userPoints}.`,
    });
    return;
  }

  const modalHTML = `
    <div class="custom-modal-overlay" id="redeem-confirm-modal">
      <div class="custom-modal">
        <div class="custom-modal-icon warning">?</div>
        <h3>Confirm Redemption</h3>
        <p>Do you want to redeem this reward?</p>

        <div class="redeem-summary">
          ${reward.ImageURL ? `<img src="${reward.ImageURL}" alt="${reward.Name}" class="redeem-summary-image">` : ""}
          <p><strong>Reward:</strong> ${reward.Name}</p>
          <p><strong>Category:</strong> ${reward.Category}</p>
          <p><strong>Cost:</strong> ${reward.PointCost} pts</p>
          <hr style="margin: 12px 0; border: none; border-top: 1px dashed var(--pink-main);">
          <p><strong>Your Points:</strong> ${userPoints} pts</p>
          <p><strong>After Redeem:</strong> <span style="color: var(--pink-deep); font-weight: 700;">${userPoints - reward.PointCost} pts</span></p>
        </div>

        <div class="custom-modal-actions">
          <button class="btn-secondary" onclick="closeRedeemModal()">Cancel</button>
          <button class="btn-primary" onclick="confirmRedeem()">Confirm Redeem</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const modal = document.getElementById("redeem-confirm-modal");
  setTimeout(() => modal.classList.add("active"), 10);
}

// ==================== CLOSE REDEEM MODAL ====================
function closeRedeemModal() {
  const modal = document.getElementById("redeem-confirm-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  }
  currentReward = null;
}

// ==================== CONFIRM REDEEM (API) ====================
async function confirmRedeem() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !currentReward) return;

  closeRedeemModal();

  const memberId = user.MemberID || user.id;

  try {
    // ✅ เรียก API
    await SheSparksAPI.post("/rewards/redeem", {
      MemberID: Number(memberId),
      RewardID: Number(currentReward.RewardID),
      RedemptionDate: new Date().toISOString().split("T")[0],
      PointsUsed: currentReward.PointCost,
    });

    // ✅ อัปเดต state
    userPoints -= currentReward.PointCost;
    userRedemptions.push({
      RewardID: currentReward.RewardID,
      RedemptionDate: new Date().toISOString().split("T")[0],
    });

    renderPointsBadge();
    renderRewards(allRewards);

    showModal({
      type: "success",
      title: "Redeemed Successfully!",
      message: `
        <strong>Reward:</strong> ${currentReward.Name}<br>
        <strong>Points Used:</strong> ${currentReward.PointCost}<br>
        <strong>Remaining Points:</strong> ${userPoints}
      `,
      buttonText: "View Points History",
      onClose: () => {
        window.location.href = "/views/points.html";
      },
    });
  } catch (error) {
    showModal({
      type: "error",
      title: "Redeem Failed",
      message: error.message || "ไม่สามารถแลกรางวัลได้",
    });
  }
}