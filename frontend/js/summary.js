/* ============================================
   summary.js - Summary + Trainer + Equipment + Loyalty Points (API Connected)
   ============================================ */

let selectedEquipments = [];
let dbAvailableEquipments = []; // เก็บข้อมูลอุปกรณ์จาก API

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
  // 1. ถ้าเคยกด Yes แต่กดย้อนกลับมา (ไม่มี trainer ติดมาด้วย) ให้โชว์คำถามใหม่
  if (flow.wantTrainer === true && !flow.trainer) {
    showTrainerOption();
    return;
  }

  // 2. ถ้ามีเทรนเนอร์แล้ว หรือกด No ข้ามเทรนเนอร์มา -> ไปสเตปถาม Equipment
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

  // 3. เริ่มต้นปกติ (ยังไม่ได้เลือกอะไรเลย)
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
    ${flow.equipments && flow.equipments.length > 0
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

// ==================== EQUIPMENT (API) ====================
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
  }
}

async function loadAndRenderEquipment(flow) {
  const container = document.getElementById("equipment-grid");
  if (!container) return;

  container.innerHTML = "<p style='text-align:center; width:100%;'>กำลังโหลดข้อมูลอุปกรณ์...</p>";

  try {
    const allAvailableEq = await SheSparksAPI.get(`/equipments/available?date=${flow.date}&startTime=${flow.startTime}&endTime=${flow.endTime}`);

    dbAvailableEquipments = allAvailableEq.filter(
      (e) => e.StudioCode === flow.studio.StudioCode && e.SportTypeID === flow.sport.SportTypeID
    );

    selectedEquipments = flow.equipments || [];
    renderEquipmentHTML(flow.capacity); // ส่งจำนวนคนในห้องไปเป็น Max limit

  } catch (error) {
    console.error("Equipment API error:", error);
    container.innerHTML = "<p style='color:var(--danger)'>เกิดข้อผิดพลาดในการโหลดอุปกรณ์</p>";
  }
}

function renderEquipmentHTML(maxCapacity) {
  const container = document.getElementById("equipment-grid");
  if (!container) return;

  // === กรณีไม่มีอุปกรณ์เหลือเลย (Empty State) ===
  if (dbAvailableEquipments.length === 0) {
    container.style.gridTemplateColumns = "1fr";
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <h3 style="color: var(--pink-deep); margin-bottom: 8px;">Out of Stock 😢</h3>
        <p style="color: var(--text-mid); margin-bottom: 20px;">อุปกรณ์กีฬาทั้งหมดถูกยืมไปแล้วในช่วงเวลานี้</p>
        <button class="btn-primary" onclick="showEquipmentList(false)">ดำเนินการต่อโดยไม่รับอุปกรณ์</button>
      </div>
    `;
    // ซ่อนปุ่ม Confirm Equipment ด้านล่างออกไป
    const confirmBtn = container.nextElementSibling;
    if (confirmBtn && confirmBtn.tagName === 'BUTTON') confirmBtn.style.display = 'none';
    return;
  }

  // === กรณีมีอุปกรณ์ ===
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(180px, 1fr))";

  // โชว์ปุ่ม Confirm กลับมาเผื่อโดนซ่อนไว้
  const confirmBtn = container.nextElementSibling;
  if (confirmBtn && confirmBtn.tagName === 'BUTTON') confirmBtn.style.display = 'inline-flex';

  container.innerHTML = dbAvailableEquipments.map((e) => {
    // เช็กว่าไอเทมนี้ถูกเลือกไว้ใน selectedEquipments ไหม
    const selEq = selectedEquipments.find((sel) => sel.EquipmentID === e.EquipmentID);
    const isSelected = !!selEq;
    const qty = selEq ? (selEq.Quantity || 1) : 1;

    return `
      <div class="equipment-card ${isSelected ? "selected" : ""}" data-id="${e.EquipmentID}">
        <!-- พื้นที่กดเลือกอุปกรณ์ -->
        <div onclick="toggleEquipment(${e.EquipmentID})" style="cursor:pointer; position:relative;">
          ${e.ImageURL ? `<img src="${e.ImageURL}" alt="${e.Name}" onerror="this.style.display='none'">` : ""}
          <h4>${e.Name}</h4>
          <p>Condition: ${e.ConditionStatus || e.Condition || "Good"}</p>
          <p>Late Fee: ฿${e.LateFee}</p>
          <p style="color: var(--pink-deep); font-weight: 600;">+20 pts/item</p>
        </div>
        
        <!-- กล่องใส่จำนวน (จะโผล่มาเมื่อถูกเลือกเท่านั้น) -->
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

// คลิกเพื่อเลือก / ยกเลิกการเลือก
function toggleEquipment(equipmentID) {
  const index = selectedEquipments.findIndex((e) => e.EquipmentID === equipmentID);
  if (index >= 0) {
    selectedEquipments.splice(index, 1); // เอาออก
  } else {
    const equipment = dbAvailableEquipments.find((e) => e.EquipmentID === equipmentID);
    selectedEquipments.push({ ...equipment, Quantity: 1 }); // เลือกพร้อมตั้งค่าดีฟอลต์ = 1
  }

  // Re-render UI เพื่อโชว์/ซ่อนกล่อง Quantity
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  renderEquipmentHTML(flow.capacity);
}

// อัปเดตตัวเลขจำนวนเมื่อผู้ใช้พิมพ์หรือกดปุ่มขึ้นลง
function updateEquipmentQty(equipmentID, newQty) {
  const equipment = selectedEquipments.find((e) => e.EquipmentID === equipmentID);
  if (equipment) {
    const qty = parseInt(newQty) || 1;
    equipment.Quantity = qty;
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
      Quantity: parseInt(e.Quantity) || 1,
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