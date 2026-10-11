/* ============================================
   trainer.js - Trainer Selection
   FEATURES:
   - แสดง Trainer เฉพาะ Sport ที่เลือก
   - เลือก Trainer → กลับ Summary
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  if (!flow || !flow.sport) {
    alert("Please complete the booking flow first");
    window.location.href = "/views/booking.html";
    return;
  }
  renderTrainers(flow.sport.SportTypeID);
});

function renderTrainers(sportTypeID) {
  const container = document.getElementById("trainer-list");
  if (!container) return;

  // กรอง Trainer ตาม SportTypeID
  const trainers = TRAINERS.filter(t => t.SportTypeID === sportTypeID);

  if (trainers.length === 0) {
    container.innerHTML = "<p>No trainers available for this sport.</p>";
    return;
  }

  container.innerHTML = trainers.map(t => `
    <div class="trainer-card">
      ${t.ImageURL ? `<img src="${t.ImageURL}" class="trainer-image" alt="${t.Name}" onerror="this.style.display='none'">` : ""}
      <div class="avatar">${t.Name.split(" ")[1]?.[0] || "T"}</div>
      <h3>${t.Name}</h3>
      <span class="specialty">${getSportName(t.SportTypeID)}</span>
      <p>${t.Phone}</p>
      <button class="btn-primary" onclick="selectTrainer(${t.TrainerID})">Select</button>
    </div>
  `).join("");
}

function selectTrainer(id) {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  flow.trainer = TRAINERS.find(t => t.TrainerID === id);
  localStorage.setItem("bookingFlow", JSON.stringify(flow));
  window.location.href = "/views/summary.html";
}

function goBack() {
  window.location.href = "/views/summary.html";
}