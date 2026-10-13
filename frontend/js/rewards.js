/* ============================================
   rewards.js - Rewards Page
   FEATURES:
   - Load user points from localStorage
   - Redeem rewards (deduct points)
   - Show "Redeemed" state for redeemed items
   - Beautiful modal for confirm & success
   ============================================ */

let allRewards = [];
let userPoints = 0;
let userRedemptions = [];
let currentReward = null;

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
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

  // Load data
  userPoints = getUserTotalPoints(user);
  userRedemptions = getUserRedemptions(user);

  // Render Points Badge
  renderPointsBadge();

  allRewards = REWARDS;
  renderRewards(allRewards);
});

// ==================== GET USER POINTS ====================
function getUserTotalPoints(user) {
  if (!user || user.role !== "member") return 0;

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const redemptions = JSON.parse(localStorage.getItem("redemptions")) || [];

  const memberBookings = bookings.filter((b) => b.MemberID === user.id);
  const earned = memberBookings.reduce((sum, b) => sum + (b.Points || 0), 0);

  const userRedeems = redemptions.filter((r) => r.MemberID === user.id);
  const redeemed = userRedeems.reduce((sum, r) => sum + (r.PointsUsed || 0), 0);

  return earned - redeemed;
}

// ==================== GET USER REDEMPTIONS ====================
function getUserRedemptions(user) {
  const redemptions = JSON.parse(localStorage.getItem("redemptions")) || [];
  return redemptions.filter((r) => r.MemberID === user.id);
}

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
      '<p style="text-align:center;grid-column:1/-1;color:var(--text-mid);">No rewards in this category.</p>';
    return;
  }

  container.innerHTML = rewards
    .map((r) => {
      const canAfford = userPoints >= r.PointCost;
      const isRedeemed = userRedemptions.some(
        (red) => red.RewardID === r.RewardID,
      );

      // ==================== BUTTON STATE ====================
      let buttonHTML = "";

      if (isRedeemed) {
        // ✅ แลกแล้ว → ปุ่มเทา + "Redeemed"
        buttonHTML = `
          <button class="btn-primary redeemed" disabled>
            ✓ Redeemed
          </button>
        `;
      } else if (!canAfford) {
        // ไม่มีแต้มพอ
        buttonHTML = `
          <button class="btn-primary" disabled>
            Not enough points
          </button>
        `;
      } else {
        // พร้อมแลก
        buttonHTML = `
          <button class="btn-primary" onclick="openRedeemModal(${r.RewardID})">
            Redeem
          </button>
        `;
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
  const reward = allRewards.find((r) => r.RewardID === rewardId);
  if (!reward) return;

  currentReward = reward;

  // ตรวจสอบ Points อีกครั้ง
  if (userPoints < reward.PointCost) {
    showModal({
      type: "warning",
      title: "Not Enough Points",
      message: `You need ${reward.PointCost} points but you only have ${userPoints}.`,
    });
    return;
  }

  // สร้าง Modal ยืนยัน
  const modalHTML = `
    <div class="custom-modal-overlay" id="redeem-confirm-modal">
      <div class="custom-modal">
        <div class="custom-modal-icon warning">
          ?
        </div>
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

// ==================== CONFIRM REDEEM ====================
function confirmRedeem() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !currentReward) return;

  // ปิด Modal ยืนยัน
  closeRedeemModal();

  // ✅ บันทึกการแลก
  const redemption = {
    RedemptionID: Date.now(),
    MemberID: user.id,
    MemberName: user.name,
    RewardID: currentReward.RewardID,
    RewardName: currentReward.Name,
    PointsUsed: currentReward.PointCost,
    RedemptionDate: new Date().toISOString().split("T")[0],
    CreatedAt: new Date().toISOString(),
  };

  let redemptions = JSON.parse(localStorage.getItem("redemptions")) || [];
  redemptions.push(redemption);
  localStorage.setItem("redemptions", JSON.stringify(redemptions));

  // อัปเดต Points
  userPoints -= currentReward.PointCost;
  userRedemptions.push(redemption);

  // อัปเดต Points Badge
  renderPointsBadge();

  // แสดง Modal สำเร็จ
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

  // Re-render rewards (เพื่อแสดงสถานะ "Redeemed")
  renderRewards(allRewards);
}
