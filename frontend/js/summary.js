/* ============================================
   summary.js - Summary & Trainer Option
   FEATURES:
   - แสดงข้อมูลการจอง (Studio, Sport, Room, Date, Time, Capacity)
   - เลือกเพิ่ม Trainer หรือไม่
   - Confirm Booking
   ============================================ */

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

  // ✅ ตรวจสอบว่ามี trainer อยู่แล้วหรือไม่
  if (flow.trainer) {
    // มี Trainer → แสดง Confirm, ซ่อน Trainer Option
    showConfirmSection();
  } else if (flow.wantTrainer && !flow.trainer) {
    // กำลังเลือก Trainer อยู่ → แสดง Confirm, ซ่อน Trainer Option
    showConfirmSection();
  } else {
    // ยังไม่ได้เลือก → แสดง Trainer Option
    showTrainerOption();
  }
});

// ==================== RENDER SUMMARY ====================
function renderSummary(flow) {
  const card = document.getElementById("summary-card");
  if (!card) return;

  card.innerHTML = `
    <h3>Your Booking</h3>
    <p><strong>Studio:</strong> ${flow.studio.Name}</p>
    <p><strong>Sport:</strong> ${flow.sport.SportName}</p>
    <p><strong>Room:</strong> ${flow.room.RoomName}</p>
    <p><strong>Date:</strong> ${flow.date || "Not selected"}</p>
    <p><strong>Time:</strong> ${flow.startTime} - ${flow.endTime}</p>
    <p><strong>Capacity:</strong> ${flow.capacity} people</p>
    ${flow.trainer ? `<p><strong>Trainer:</strong> ${flow.trainer.Name}</p>` : ""}
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
    localStorage.setItem("bookingFlow", JSON.stringify(flow));
    showConfirmSection();
  }
}

// ==================== SHOW CONFIRM SECTION ====================
function showConfirmSection() {
  const trainerOption = document.querySelector(".trainer-option");
  const confirmSection = document.getElementById("confirm-section");

  if (trainerOption) trainerOption.classList.add("hidden");
  if (confirmSection) confirmSection.classList.remove("hidden");
}

// ==================== SHOW TRAINER OPTION ====================
function showTrainerOption() {
  const trainerOption = document.querySelector(".trainer-option");
  const confirmSection = document.getElementById("confirm-section");

  if (trainerOption) trainerOption.classList.remove("hidden");
  if (confirmSection) confirmSection.classList.add("hidden");
}

// ==================== CONFIRM BOOKING ====================
function confirmBooking() {
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

  // ✅ บันทึกการจองลงระบบจริง (ตอนนี้เท่านั้น!)
  const booking = {
    RoomID: flow.room.RoomID,
    RoomName: flow.room.RoomName,
    Date: flow.date,
    StartTime: flow.startTime,
    EndTime: flow.endTime,
    Capacity: flow.capacity,
    TrainerID: flow.trainer ? flow.trainer.TrainerID : null,
    MemberID: user.id,
    Points: calculateLoyaltyPoints(flow),
    CreatedAt: new Date().toISOString(),
  };

  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.push(booking);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  // คำนวณแต้ม
  const points = calculateLoyaltyPoints(flow);

  showModal({
    type: "success",
    title: "จองสำเร็จ!",
    message: `
      <strong>Studio:</strong> ${flow.studio.Name}<br>
      <strong>Sport:</strong> ${flow.sport.SportName}<br>
      <strong>Room:</strong> ${flow.room.RoomName}<br>
      <strong>Date:</strong> ${flow.date}<br>
      <strong>Time:</strong> ${flow.startTime} - ${flow.endTime}<br>
      <strong>Capacity:</strong> ${flow.capacity} people<br>
      ${flow.trainer ? `<strong>Trainer:</strong> ${flow.trainer.Name}<br>` : ""}
      <hr style="margin: 12px 0; border: none; border-top: 1px dashed var(--pink-main);">
      <strong style="color: var(--pink-deep);">🎉 ได้รับ ${points} แต้ม!</strong>
    `,
    buttonText: "ดูแต้มของฉัน",
    onClose: () => {
      localStorage.removeItem("bookingFlow");
      window.location.href = "/views/points.html";
    },
  });
}

// ==================== CALCULATE LOYALTY POINTS ====================
function calculateLoyaltyPoints(flow) {
  let points = 0;

  // คะแนนจาก Room (30 คะแนน/ชั่วโมง)
  const start = parseInt(flow.startTime.split(":")[0]);
  const end = parseInt(flow.endTime.split(":")[0]);
  const hours = end - start;
  points += hours * 30;

  // คะแนนจาก Trainer (50 คะแนน)
  if (flow.trainer) {
    points += 50;
  }

  // คะแนนจาก Capacity (2 คะแนน/คน)
  points += (flow.capacity || 1) * 2;

  return points;
}

// ==================== GO BACK ====================
function goBack() {
  window.location.href = "/views/room.html";
}