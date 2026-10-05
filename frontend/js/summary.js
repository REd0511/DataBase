/* ============================================
   summary.js - Summary & Trainer Option
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  if (!flow || !flow.room) {
    alert("Please complete the booking flow first");
    window.location.href = "/views/booking.html";
    return;
  }
  renderSummary(flow);
});

function renderSummary(flow) {
  const card = document.getElementById("summary-card");
  card.innerHTML = `
        <h3>Your Booking</h3>
        <p><strong>Studio:</strong> ${flow.studio.Name}</p>
        <p><strong>Sport:</strong> ${flow.sport.SportName}</p>
        <p><strong>Room:</strong> ${flow.room.RoomName}</p>
        <p><strong>Capacity:</strong> ${flow.room.Capacity} people</p>
        <p><strong>Date:</strong> ${flow.date || "Not selected"}</p>
        <p><strong>Time:</strong> ${flow.time || "Not selected"}</p>
    `;
}

function addTrainer(wantTrainer) {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  if (wantTrainer) {
    flow.wantTrainer = true;
    localStorage.setItem("bookingFlow", JSON.stringify(flow));
    window.location.href = "/views/trainer.html";
  } else {
    flow.trainer = null;
    localStorage.setItem("bookingFlow", JSON.stringify(flow));
    document.getElementById("confirm-section").classList.remove("hidden");
  }
}

function confirmBooking() {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please login first");
    window.location.href = "/views/login.html";
    return;
  }

  console.log("Final Booking:", { ...flow, memberId: user.id });
  alert(
    `✅ จองสำเร็จ!\nStudio: ${flow.studio.Name}\nRoom: ${flow.room.RoomName}\nDate: ${flow.date || "-"}\nTime: ${flow.time || "-"}\nTrainer: ${flow.trainer ? flow.trainer.Name : "None"}`,
  );

  localStorage.removeItem("bookingFlow");
  window.location.href = "/views/points.html";
}
