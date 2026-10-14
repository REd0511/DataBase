/* ============================================
   room-modal.js - Room Modal + Time Slot + Confirm
   FEATURES:
   - Load booked slots from API
   - Check availability from DB
   - Capacity + Date + Time selection
   ============================================ */

let currentRoom = null;
let selectedDate = null;
let selectedTimeSlot = null;

// ==================== เปิด Modal ====================
async function openRoomModal(roomID) {
  const room = ROOMS.find((r) => r.RoomID === roomID);
  if (!room) return;

  currentRoom = room;
  selectedDate = null;
  selectedTimeSlot = null;

  // ตั้งค่ารูป
  const imageContainer = document.getElementById("modal-room-image");
  if (imageContainer) {
    if (room.ImageURL) {
      imageContainer.style.backgroundImage = `url('${room.ImageURL}')`;
      imageContainer.textContent = "";
    } else {
      imageContainer.style.backgroundImage = "none";
      imageContainer.textContent = "No Image";
    }
  }

  document.getElementById("modal-room-name").textContent = room.RoomName;

  // Reset Capacity
  const capEl = document.getElementById("modal-capacity");
  if (capEl) capEl.value = 1;

  // ✅ Load booked slots from API
  await loadBookedSlots(roomID);

  // Render วัน + เวลา
  renderDateSlots();
  renderTimeSlots();

  // ปิดปุ่ม Select
  document.getElementById("modal-select-btn").disabled = true;

  // เปิด Modal
  document.getElementById("room-modal").classList.add("active");
  document.body.classList.add("modal-open");
}

// ==================== LOAD BOOKED SLOTS FROM API ====================
async function loadBookedSlots(roomId) {
  try {
    const slots = await SheSparksAPI.get(`/bookings/room/${roomId}/booked-slots`);
    bookedSlotsCache = slots || [];
  } catch (error) {
    console.warn("Cannot load booked slots:", error.message);
    bookedSlotsCache = [];
  }
}

// ==================== ปิด Modal ====================
function closeRoomModal() {
  document.getElementById("room-modal").classList.remove("active");
  document.body.classList.remove("modal-open");
  currentRoom = null;
  selectedDate = null;
  selectedTimeSlot = null;
}

// ==================== Render Date Slots ====================
function renderDateSlots() {
  const container = document.getElementById("date-slots");
  if (!container) return;

  const today = new Date();
  const dates = [];

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }

  container.innerHTML = dates
    .map((d, i) => {
      const dateStr = d.toISOString().split("T")[0];
      const day = d.getDate();
      const month = d.toLocaleString("en-US", { month: "short" });
      const isToday = i === 0;

      return `
        <div class="date-slot ${isToday ? "today" : ""}" 
             onclick="selectDate('${dateStr}')" 
             data-date="${dateStr}">
          ${month.toUpperCase()} ${day}
          ${isToday ? '<span class="today-label">Today</span>' : ""}
        </div>
      `;
    })
    .join("");
}

// ==================== เลือกวัน ====================
function selectDate(dateStr) {
  selectedDate = dateStr;
  selectedTimeSlot = null;

  document.querySelectorAll(".date-slot").forEach((el) => {
    el.classList.toggle("selected", el.dataset.date === dateStr);
  });

  renderTimeSlots();
  document.getElementById("modal-select-btn").disabled = true;
}

// ==================== Render Time Slots ====================
function renderTimeSlots() {
  const container = document.getElementById("time-slots");
  if (!container) return;

  if (!selectedDate) {
    container.innerHTML =
      '<p style="color: var(--text-mid); font-size: 0.85rem;">Please select a date first.</p>';
    return;
  }

  const slots = [
    "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
    "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00",
    "16:00-17:00",
  ];

  container.innerHTML = slots
    .map((slot) => {
      const [start, end] = slot.split("-");
      const isBooked = isRoomBooked(currentRoom.RoomID, selectedDate, start, end);

      return `
        <div class="time-slot ${isBooked ? "disabled" : ""}"
             onclick="${isBooked ? "" : `selectTimeSlot('${slot}')`}"
             data-slot="${slot}">
          ${slot}
        </div>
      `;
    })
    .join("");
}

// ==================== เลือกเวลา ====================
function selectTimeSlot(slot) {
  selectedTimeSlot = slot;

  document.querySelectorAll(".time-slot").forEach((el) => {
    el.classList.toggle("selected", el.dataset.slot === slot);
  });

  document.getElementById("modal-select-btn").disabled = false;
}

// ==================== ยืนยันการเลือก ====================
function confirmRoomSelection() {
  if (!selectedDate || !selectedTimeSlot) {
    showModal({
      type: "warning",
      title: "Missing Information",
      message: "Please select both date and time slot.",
    });
    return;
  }

  const capacity = parseInt(document.getElementById("modal-capacity")?.value) || 1;

  if (capacity < 1 || capacity > 30) {
    showModal({
      type: "warning",
      title: "Invalid Capacity",
      message: "Number of people must be between 1 and 30.",
    });
    return;
  }

  if (capacity > currentRoom.Capacity) {
    showModal({
      type: "warning",
      title: "Room Capacity Exceeded",
      message: `This room can hold up to ${currentRoom.Capacity} people.`,
    });
    return;
  }

  const [startTime, endTime] = selectedTimeSlot.split("-");

  // ✅ Double check กับ API ก่อน (ป้องกัน Race Condition)
  const isBooked = isRoomBooked(currentRoom.RoomID, selectedDate, startTime, endTime);
  if (isBooked) {
    showModal({
      type: "warning",
      title: "Room Not Available",
      message: "ห้องนี้ถูกจองไปแล้วในช่วงเวลานี้",
    });
    return;
  }

  // บันทึกใน flow
  flow.room = currentRoom;
  flow.date = selectedDate;
  flow.startTime = startTime;
  flow.endTime = endTime;
  flow.capacity = capacity;

  saveFlow();

  // แสดง Modal ยืนยัน
  showConfirmBookingModal();
}

// ==================== Modal ยืนยัน ====================
function showConfirmBookingModal() {
  const [startTime, endTime] = selectedTimeSlot.split("-");
  const capacity = parseInt(document.getElementById("modal-capacity")?.value) || 1;

  const modalHTML = `
    <div class="custom-modal-overlay" id="confirm-booking-modal">
      <div class="custom-modal">
        <div class="custom-modal-icon warning" style="background: linear-gradient(135deg, #f4b8d0, #d6739a);">
          ?
        </div>
        <h3>Confirm Booking</h3>
        <p>Do you want to book this room?</p>

        <div style="text-align: left; background: var(--pink-bg); padding: 16px; border-radius: var(--radius-sm); margin-bottom: 24px; font-size: 0.9rem;">
          <p style="margin-bottom: 6px;"><strong>Room:</strong> ${currentRoom.RoomName}</p>
          <p style="margin-bottom: 6px;"><strong>Date:</strong> ${selectedDate}</p>
          <p style="margin-bottom: 6px;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
          <p style="margin-bottom: 0;"><strong>People:</strong> ${capacity}</p>
        </div>

        <div class="custom-modal-actions">
          <button class="btn-secondary" onclick="cancelBooking()">Cancel</button>
          <button class="btn-primary" onclick="proceedToSummary()">Confirm</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const modal = document.getElementById("confirm-booking-modal");
  setTimeout(() => modal.classList.add("active"), 10);
}

// ==================== Cancel ====================
function cancelBooking() {
  const modal = document.getElementById("confirm-booking-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  }
}

// ==================== Confirm → Summary ====================
function proceedToSummary() {
  const modal = document.getElementById("confirm-booking-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  }

  closeRoomModal();
  window.location.href = "/views/summary.html";
}

// ==================== ตรวจสอบการจอง (จาก API Cache) ====================
function isRoomBooked(roomID, date, startTime, endTime) {
  return bookedSlotsCache.some((b) => {
    const bDate = (b.BookingDate || '').toString().split('T')[0];
    return (
      Number(b.RoomID || roomID) === Number(roomID) &&
      bDate === date &&
      b.StartTime < endTime &&
      b.EndTime > startTime
    );
  });
}

// ==================== ปิด Modal เมื่อคลิกข้างนอก ====================
document.addEventListener("click", (e) => {
  const modal = document.getElementById("room-modal");
  if (modal && e.target === modal) {
    closeRoomModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeRoomModal();
  }
});