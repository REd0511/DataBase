/* ============================================
  Summary + Trainer + Equipment + Real Payment
   ============================================ */

let selectedEquipments = [];
let dbAvailableEquipments = [];
let currentPrice = { Amount: 0, PointsEarned: 0, Hours: 0, HourlyRate: 0, TrainerRate: 0 };

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", async () => {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));

  if (!flow || !flow.room) {
    showModal({
      type: "warning",
      title: "Booking data not found",
      message: "Please start a new booking",
      buttonText: "Go to Booking",
      redirectTo: "/views/booking.html",
    });
    return;
  }

  await renderSummary(flow);
  decideNextStep(flow);
});

// ==================== FETCH PRICE FROM BACKEND ====================
async function fetchPriceFromBackend(flow) {
  try {
    const trainerCount = flow.trainer ? 1 : 0;
    const params = new URLSearchParams({
      RoomID: flow.room.RoomID,
      StartTime: flow.startTime,
      EndTime: flow.endTime,
      TrainerCount: trainerCount,
    });
    const data = await SheSparksAPI.get(`/bookings/preview?${params.toString()}`);
    currentPrice = {
      Amount: Number(data.Amount || 0),
      PointsEarned: Number(data.PointsEarned || 0),
      Hours: Number(data.Hours || 0),
      HourlyRate: Number(data.HourlyRate || 0),
      TrainerRate: Number(data.TrainerRate || 0),
    };
    return currentPrice;
  } catch (error) {
    console.warn("Cannot fetch price:", error.message);
    currentPrice = { Amount: 0, PointsEarned: 0, Hours: 0, HourlyRate: 0, TrainerRate: 0 };
    return currentPrice;
  }
}

// ==================== DECIDE NEXT STEP ====================
function decideNextStep(flow) {
  if (flow.wantTrainer === true && !flow.trainer) {
    showTrainerOption();
    return;
  }

  if (flow.trainer || flow.wantTrainer === false) {
    if (flow.wantEquipment === true) {
      loadAndRenderEquipment(flow);
      showEquipmentListSection();
    } else if (flow.wantEquipment === false) {
      showConfirmSection();
    } else {
      showEquipmentOption();
    }
    return;
  }

  showTrainerOption();
}

// ==================== RENDER SUMMARY ====================
async function renderSummary(flow) {
  const card = document.getElementById("summary-card");
  if (!card) return;

  card.innerHTML = `<p style="text-align:center;color:var(--text-mid);">Calculating price...</p>`;

  await fetchPriceFromBackend(flow);

  const amount = currentPrice.Amount;
  const points = currentPrice.PointsEarned;

  card.innerHTML = `
    <h3>Your Booking</h3>
    <p><strong>Studio:</strong> ${flow.studio.Name}</p>
    <p><strong>Sport:</strong> ${flow.sport.SportName}</p>
    <p><strong>Room:</strong> ${flow.room.RoomName}</p>
    <p><strong>Date:</strong> ${flow.date || "Not selected"}</p>
    <p><strong>Time:</strong> ${flow.startTime} - ${flow.endTime} (${currentPrice.Hours} hr)</p>
    <p><strong>Capacity:</strong> ${flow.capacity} people</p>
    ${flow.trainer ? `<p><strong>Trainer:</strong> ${flow.trainer.Name}</p>` : ""}
    ${flow.equipments && flow.equipments.length > 0
      ? `<p><strong>Equipment:</strong> ${flow.equipments.map((e) => e.Name).join(", ")}</p>`
      : ""
    }
    <hr style="margin: 16px 0; border: none; border-top: 1px dashed var(--pink-main);">

    <div class="price-breakdown">
      <h4>💰 Price Breakdown</h4>
      <p><span>Room Rate:</span> <span>฿${currentPrice.HourlyRate.toLocaleString()} × ${currentPrice.Hours} hr</span></p>
      ${flow.trainer ? `<p><span>Trainer Rate:</span> <span>฿${currentPrice.TrainerRate.toLocaleString()} × ${currentPrice.Hours} hr</span></p>` : ""}
      <p class="total"><span>Total:</span> <span>฿${amount.toLocaleString()}</span></p>
    </div>

    <p style="color: var(--pink-deep); font-weight: 700; font-size: 1.1rem; text-align:center; margin-top: 12px;">
      🎉 You will earn ${points.toLocaleString()} points
    </p>
  `;
}

// ==================== ADD TRAINER ====================
function addTrainer(wantTrainer) {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));

  if (wantTrainer) {
    flow.wantTrainer = true;
    localStorage.setItem("bookingFlow", JSON.stringify(flow));
    window.location.href = "/views/trainer.html";
  } else {
    flow.trainer = null;
    flow.wantTrainer = false;
    flow.wantEquipment = null;
    localStorage.setItem("bookingFlow", JSON.stringify(flow));
    showEquipmentOption();
    renderSummary(flow);
  }
}

// ==================== SHOW SECTIONS ====================
function showConfirmSection() {
  hideElement(".trainer-option");
  hideElement(".equipment-option");
  hideElement(".equipment-list-section");
  showElement("#confirm-section");
}

function showTrainerOption() {
  showElement(".trainer-option");
  hideElement(".equipment-option");
  hideElement(".equipment-list-section");
  hideElement("#confirm-section");
}

function showEquipmentOption() {
  hideElement(".trainer-option");
  showElement(".equipment-option");
  hideElement(".equipment-list-section");
  hideElement("#confirm-section");
}

function showEquipmentListSection() {
  hideElement(".trainer-option");
  hideElement(".equipment-option");
  showElement(".equipment-list-section");
  hideElement("#confirm-section");
}

// ==================== EQUIPMENT ====================
function showEquipmentList(wantEquipment) {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));

  if (wantEquipment) {
    flow.wantEquipment = true;
    localStorage.setItem("bookingFlow", JSON.stringify(flow));
    loadAndRenderEquipment(flow);
    showEquipmentListSection();
  } else {
    flow.wantEquipment = false;
    flow.equipments = [];
    localStorage.setItem("bookingFlow", JSON.stringify(flow));
    showConfirmSection();
    renderSummary(flow);
  }
}

async function loadAndRenderEquipment(flow) {
  const container = document.getElementById("equipment-grid");
  if (!container) return;

  container.innerHTML = "<p style='text-align:center; width:100%;'>Loading equipment...</p>";

  try {
    const allAvailableEq = await SheSparksAPI.get(
      `/equipments/available?date=${flow.date}&startTime=${flow.startTime}&endTime=${flow.endTime}`
    );

    dbAvailableEquipments = allAvailableEq.filter(
      (e) => e.StudioCode === flow.studio.StudioCode && e.SportTypeID === flow.sport.SportTypeID
    );

    selectedEquipments = flow.equipments || [];
    renderEquipmentHTML(flow.capacity);
  } catch (error) {
    console.error("Equipment API error:", error);
    container.innerHTML = "<p style='color:var(--danger)'>Error loading equipment</p>";
  }
}

function renderEquipmentHTML(maxCapacity) {
  const container = document.getElementById("equipment-grid");
  if (!container) return;

  if (dbAvailableEquipments.length === 0) {
    container.style.gridTemplateColumns = "1fr";
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <h3 style="color: var(--pink-deep); margin-bottom: 8px;">Out of Stock 😢</h3>
        <p style="color: var(--text-mid); margin-bottom: 20px;">All sports equipment is borrowed during this time</p>
        <button class="btn-primary" onclick="showEquipmentList(false)">Continue without equipment</button>
      </div>
    `;
    const confirmBtn = container.nextElementSibling;
    if (confirmBtn && confirmBtn.tagName === "BUTTON") confirmBtn.style.display = "none";
    return;
  }

  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(180px, 1fr))";

  const confirmBtn = container.nextElementSibling;
  if (confirmBtn && confirmBtn.tagName === "BUTTON") confirmBtn.style.display = "inline-flex";

  container.innerHTML = dbAvailableEquipments.map((e) => {
    const selEq = selectedEquipments.find((sel) => sel.EquipmentID === e.EquipmentID);
    const isSelected = !!selEq;
    const qty = selEq ? selEq.Quantity || 1 : 1;

    return `
      <div class="equipment-card ${isSelected ? "selected" : ""}" data-id="${e.EquipmentID}">
        <div onclick="toggleEquipment(${e.EquipmentID})" style="cursor:pointer; position:relative;">
          ${e.ImageURL ? `<img src="${e.ImageURL}" alt="${e.Name}" onerror="this.style.display='none'">` : ""}
          <h4>${e.Name}</h4>
          <p>Condition: ${e.ConditionStatus || e.Condition || "Good"}</p>
          <p>Late Fee: ฿${e.LateFee}</p>
          <p style="color: var(--pink-deep); font-weight: 600;">Free rental</p>
        </div>
        ${isSelected ? `
          <div style="margin-top: 12px; display:flex; align-items:center; justify-content:center; gap:8px;" onclick="event.stopPropagation()">
            <label style="font-size:0.85rem; color:var(--text-dark); font-weight:600;">Qty:</label>
            <input type="number" min="1" max="${maxCapacity || 10}" value="${qty}" onchange="updateEquipmentQty(${e.EquipmentID}, this.value)"
                   style="width: 70px; padding: 6px; text-align: center; border: 1.5px solid var(--pink-main); border-radius: 6px; font-family:'Poppins';">
          </div>
        ` : ""}
      </div>
    `;
  }).join("");
}

function toggleEquipment(equipmentID) {
  const index = selectedEquipments.findIndex((e) => e.EquipmentID === equipmentID);
  if (index >= 0) {
    selectedEquipments.splice(index, 1);
  } else {
    const equipment = dbAvailableEquipments.find((e) => e.EquipmentID === equipmentID);
    selectedEquipments.push({ ...equipment, Quantity: 1 });
  }

  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  renderEquipmentHTML(flow.capacity);
}

function updateEquipmentQty(equipmentID, newQty) {
  const equipment = selectedEquipments.find((e) => e.EquipmentID === equipmentID);
  if (equipment) {
    equipment.Quantity = parseInt(newQty) || 1;
  }
}

function confirmEquipment() {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  flow.equipments = selectedEquipments;
  flow.wantEquipment = true;
  localStorage.setItem("bookingFlow", JSON.stringify(flow));

  renderSummary(flow);
  showConfirmSection();
}

// ==================== CONFIRM BOOKING ====================
async function confirmBooking() {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    showModal({
      type: "warning",
      title: "Please Login",
      message: "Please login before booking",
      buttonText: "Go to Login",
      redirectTo: "/views/login.html",
    });
    return;
  }

  const memberId = user.MemberID || user.id;

  // Send only necessary data — Backend will calculate price and points itself
  const bookingData = {
    BookingDate: flow.date,
    StartTime: flow.startTime,
    EndTime: flow.endTime,
    MemberID: Number(memberId),
    RoomID: Number(flow.room.RoomID),
    EquipmentIDs: (flow.equipments || []).map((e) => ({
      EquipmentID: e.EquipmentID,
      Quantity: parseInt(e.Quantity) || 1,
    })),
    TrainerIDs: flow.trainer
      ? [{ TrainerID: flow.trainer.TrainerID, TrainerRole: "Main Trainer" }]
      : [],
  };

  try {
    const result = await SheSparksAPI.post("/bookings", bookingData);

    showModal({
      type: "success",
      title: "Booking successful!",
      message: `
        <strong>Booking ID:</strong> ${result.BookingID}<br>
        <strong>Studio:</strong> ${flow.studio.Name}<br>
        <strong>Sport:</strong> ${flow.sport.SportName}<br>
        <strong>Room:</strong> ${flow.room.RoomName}<br>
        <strong>Date:</strong> ${flow.date}<br>
        <strong>Time:</strong> ${flow.startTime} - ${flow.endTime} (${result.Hours} hr)<br>
        <strong>Capacity:</strong> ${flow.capacity} people<br>
        ${flow.trainer ? `<strong>Trainer:</strong> ${flow.trainer.Name}<br>` : ""}
        ${flow.equipments && flow.equipments.length > 0 ? `<strong>Equipment:</strong> ${flow.equipments.map((e) => e.Name).join(", ")}<br>` : ""}
        <hr style="margin: 12px 0; border: none; border-top: 1px dashed var(--pink-main);">
        <strong>Total Paid:</strong> ฿${Number(result.Amount).toLocaleString()}<br>
        <strong>Points Earned:</strong> +${result.PointsEarned} points
      `,
      buttonText: "View Booking History",
      onClose: () => {
        localStorage.removeItem("bookingFlow");
        window.location.href = "/views/booking-history.html";
      },
    });
  } catch (error) {
    showModal({
      type: "error",
      title: "Booking failed",
      message: error.message || "An error occurred",
    });
  }
}

// ==================== HELPERS ====================
function hideElement(selector) {
  const el = document.querySelector(selector);
  if (el) el.classList.add("hidden");
}

function showElement(selector) {
  const el = document.querySelector(selector);
  if (el) el.classList.remove("hidden");
}

function goBack() {
  window.location.href = "/views/room.html";
}