/* ============================================
   trainer.js - Trainer Selection
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  if (!flow || !flow.sport) {
    alert("Please complete the booking flow first");
    window.location.href = "booking.html";
    return;
  }
  renderTrainers(flow.sport.SportName);
});

function renderTrainers(sportName) {
  const container = document.getElementById("trainer-list");
  const trainers = TRAINERS.filter((t) => t.SportType === sportName);

  if (trainers.length === 0) {
    container.innerHTML = "<p>No trainers available for this sport.</p>";
    return;
  }

  container.innerHTML = trainers
    .map(
      (t) => `
        <div class="trainer-card">
            <div class="avatar">${t.Name.split(" ")[1]?.[0] || "T"}</div>
            <h3>${t.Name}</h3>
            <span class="specialty">${t.SportType}</span>
            <p>${t.Phone}</p>
            <button class="btn-primary" onclick="selectTrainer(${t.TrainerID})">Select</button>
        </div>
    `,
    )
    .join("");
}

function selectTrainer(id) {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  flow.trainer = TRAINERS.find((t) => t.TrainerID === id);
  localStorage.setItem("bookingFlow", JSON.stringify(flow));
  window.location.href = "summary.html";
}

/* ============================================
                    GO BACK 
   ============================================ */
function goBack() {
  window.location.href = "summary.html";
}
