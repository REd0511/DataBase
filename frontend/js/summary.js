/* ============================================
   summary.js - Summary + Trainer + Equipment + Loyalty Points
   FEATURES:
   - Summary → ถาม Trainer
   - No Trainer → ถาม Equipment
   - Yes Trainer → ไปเลือก Trainer → กลับมา → ถาม Equipment
   - Equipment → Confirm → API
   ============================================ */

let selectedEquipments = [];

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));

  if (!flow || !flow.room) {
    showModal({
      type: "warning",
      title: "ไม่พบข้อมูลการจอง",
      message: "กรุณาเริ่มการจองใหม่",
      buttonText: "ไปที่ Booking",
      redirectTo: "/views/booking.html",
    });
    return;
  }

  renderSummary(flow);
  decideNextStep(flow);
});

// ==================== DECIDE NEXT STEP ====================
function decideNextStep(flow) {
  if (flow.trainer) {
    if (flow.wantEquipment === true) {
      renderEquipmentList(flow);
      showEquipmentListSection();
    } else if (flow.wantEquipment === false) {
      showConfirmSection();
    } else {
      showEquipmentOption();
    }
    return;
  }

  if (flow.wantTrainer === true && !flow.trainer) {
    showConfirmSection();
    return;
  }

  showTrainerOption();
}

// ==================== RENDER SUMMARY ====================
function renderSummary(flow) {
  const card = document.getElementById("summary-card");
  if (!card) return;

  const points = calculateLoyaltyPoints(flow);

  card.innerHTML = `
    <h3>Your Booking</h3>
    <p><strong>Studio:</strong> ${flow.studio.Name}</p>
    <p><strong>Sport:</strong> ${flow.sport.SportName}</p>
    <p><strong>Room:</strong> ${flow.room.RoomName}</p>
    <p><strong>Date:</strong> ${flow.date || "Not selected"}</p>
    <p><strong>Time:</strong> ${flow.startTime} - ${flow.endTime}</p>
    <p><strong>Capacity:</strong> ${flow.capacity} people</p>
    ${flow.trainer ? `<p><strong>Trainer:</strong> ${flow.trainer.Name}</p>` : ""}
    ${
      flow.equipments && flow.equipments.length > 0
        ? `<p><strong>Equipment:</strong> ${flow.equipments.map((e) => e.Name).join(", ")}</p>`
        : ""
    }
    <hr style="margin: 16px 0; border: none; border-top: 1px dashed var(--pink-main);">
    <p style="color: var(--pink-deep); font-weight: 700;">
      🎉 Loyalty Points: ${points} pts
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
    renderEquipmentList(flow);
    showEquipmentListSection();
  } else {
    flow.wantEquipment = false;
    flow.equipments = [];
    localStorage.setItem("bookingFlow", JSON.stringify(flow));
    showConfirmSection();
  }
}

function renderEquipmentList(flow) {
  const container = document.getElementById("equipment-grid");
  if (!container) return;

  const equipments = EQUIPMENTS.filter(
    (e) =>
      e.StudioCode === flow.studio.StudioCode &&
      e.SportTypeID === flow.sport.SportTypeID,
  );

  if (equipments.length === 0) {
    container.innerHTML = "<p>No equipment available.</p>";
    return;
  }

  selectedEquipments = flow.equipments || [];

  container.innerHTML = equipments
    .map((e) => {
      const isSelected = selectedEquipments.some(
        (sel) => sel.EquipmentID === e.EquipmentID,
      );
      return `
        <div class="equipment-card ${isSelected ? "selected" : ""}" onclick="toggleEquipment(${e.EquipmentID})" data-id="${e.EquipmentID}">
          ${e.ImageURL ? `<img src="${e.ImageURL}" alt="${e.Name}" onerror="this.style.display='none'">` : ""}
          <h4>${e.Name}</h4>
          <p>Condition: ${e.Condition}</p>
          <p>Late Fee: ฿${e.LateFee}</p>
          <p style="color: var(--pink-deep); font-weight: 600;">+20 pts</p>
        </div>
      `;
    })
    .join("");
}

function toggleEquipment(equipmentID) {
  const card = document.querySelector(
    `.equipment-card[data-id="${equipmentID}"]`,
  );
  if (!card) return;

  const equipment = EQUIPMENTS.find((e) => e.EquipmentID === equipmentID);
  if (!equipment) return;

  const index = selectedEquipments.findIndex(
    (e) => e.EquipmentID === equipmentID,
  );

  if (index >= 0) {
    selectedEquipments.splice(index, 1);
    card.classList.remove("selected");
  } else {
    selectedEquipments.push(equipment);
    card.classList.add("selected");
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

// ==================== CONFIRM BOOKING (API) ====================
async function confirmBooking() {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    showModal({
      type: "warning",
      title: "Please Login",
      message: "กรุณาเข้าสู่ระบบก่อนทำการจอง",
      buttonText: "ไปที่ Login",
      redirectTo: "/views/login.html",
    });
    return;
  }

  // ✅ เตรียมข้อมูลส่ง API
  const memberId = user.MemberID || user.id;

  const bookingData = {
    BookingDate: flow.date,
    StartTime: flow.startTime,
    EndTime: flow.endTime,
    MemberID: Number(memberId),
    RoomID: Number(flow.room.RoomID),
    EquipmentIDs: (flow.equipments || []).map((e) => ({
      EquipmentID: e.EquipmentID,
      Quantity: 1,
    })),
    TrainerIDs: flow.trainer
      ? [
          {
            TrainerID: flow.trainer.TrainerID,
            TrainerRole: "Main Trainer",
            HourlyRate: 500,
          },
        ]
      : [],
  };

  try {
    // ✅ เรียก API
    const result = await SheSparksAPI.post("/bookings", bookingData);

    // ✅ สำเร็จ
    showModal({
      type: "success",
      title: "จองสำเร็จ!",
      message: `
        <strong>Booking ID:</strong> ${result.BookingID}<br>
        <strong>Studio:</strong> ${flow.studio.Name}<br>
        <strong>Sport:</strong> ${flow.sport.SportName}<br>
        <strong>Room:</strong> ${flow.room.RoomName}<br>
        <strong>Date:</strong> ${flow.date}<br>
        <strong>Time:</strong> ${flow.startTime} - ${flow.endTime}<br>
        <strong>Capacity:</strong> ${flow.capacity} people<br>
        ${flow.trainer ? `<strong>Trainer:</strong> ${flow.trainer.Name}<br>` : ""}
        ${flow.equipments && flow.equipments.length > 0 ? `<strong>Equipment:</strong> ${flow.equipments.map((e) => e.Name).join(", ")}<br>` : ""}
      `,
      buttonText: "ดูประวัติการจอง",
      onClose: () => {
        localStorage.removeItem("bookingFlow");
        window.location.href = "/views/booking-history.html";
      },
    });
  } catch (error) {
    // ❌ Error
    showModal({
      type: "error",
      title: "จองไม่สำเร็จ",
      message: error.message || "เกิดข้อผิดพลาด",
    });
  }
}

// ==================== CALCULATE LOYALTY POINTS ====================
function calculateLoyaltyPoints(flow) {
  const rules = JSON.parse(localStorage.getItem("loyaltyRules")) || {
    pointsPerHour: 30,
    pointsPerTrainer: 50,
    pointsPerEquipment: 20,
    pointsPerCapacity: 2,
  };

  let points = 0;

  const start = parseInt(flow.startTime.split(":")[0]);
  const end = parseInt(flow.endTime.split(":")[0]);
  const hours = end - start;
  points += hours * rules.pointsPerHour;

  if (flow.trainer) {
    points += rules.pointsPerTrainer;
  }

  if (flow.equipments && flow.equipments.length > 0) {
    points += flow.equipments.length * rules.pointsPerEquipment;
  }

  points += (flow.capacity || 1) * rules.pointsPerCapacity;

  return points;
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