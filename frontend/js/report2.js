const esc2 = (s) =>
  String(s ?? "").replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
document.addEventListener("DOMContentLoaded", () => {
  const u = JSON.parse(localStorage.getItem("user") || "null");
  if (!u || u.role !== "admin") {
    alert("Please login as Admin");
    location.href = "/views/login.html";
    return;
  }
  document.getElementById("search").onclick = load;
  load();
});
async function load() {
  const id = document.getElementById("memberId").value;
  const box = document.getElementById("results");
  box.innerHTML = "Loading...";
  try {
    const r = await fetch(
      "/api/reports/member-points" + (id ? `?memberId=${id}` : ""),
    ).then((x) => x.json());
    if (r.error || r.message) throw new Error(r.error || r.message);
    box.innerHTML = `<table><thead><tr><th>Member</th><th>Level</th><th>Earned</th><th>Redeemed</th><th>Balance</th><th>Next Reward</th><th>Points Needed</th></tr></thead><tbody>${r.members.map((m) => `<tr><td>${esc2(m.Name)}</td><td>${m.MemberLevel}</td><td>${m.Earned}</td><td>${m.Redeemed}</td><td class="balance">${m.Balance}</td><td>${m.NextReward ? esc2(m.NextReward.Name) : "All rewards available"}</td><td>${m.PointsNeeded}</td></tr>`).join("")}</tbody></table><h3>Reward Catalog</h3><div class="reward-list">${r.rewards.map((x) => `<div class="reward-card"><span class="category">${esc2(x.Category)}</span><h3>${esc2(x.Name)}</h3><p class="points">${x.PointCost} pts</p></div>`).join("")}</div>`;
  } catch (e) {
    box.innerHTML = `<p class="api-error">${esc2(e.message)}</p>`;
  }
}
