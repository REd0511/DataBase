/* ============================================
   booking.js - Booking Flow Logic
   FEATURES:
   - เลือก Studio → Sport → Room → Date/Time
   - แสดง Step Indicator
   - แสดงข้อมูลตามที่เลือก
   - TODO: เชื่อมกับ API /api/studios, /api/rooms, /api/bookings
   ============================================ */

let selectedStudio = null;
let selectedSport = null;
let selectedRoom = null;

// ==================== STEP 1: RENDER STUDIOS ====================
function renderStudios() {
    const container = document.getElementById('studio-list');
    if (!container) return;

    container.innerHTML = STUDIOS.map(s => `
        <div class="studio-card" onclick="selectStudio('${s.StudioCode}')">
            <h3>${s.Name}</h3>
            <p>${s.Location}</p>
            <span class="sports-tag">${s.SportTypes.join(' • ')}</span>
        </div>
    `).join('');
}

function selectStudio(studioCode) {
    selectedStudio = STUDIOS.find(s => s.StudioCode === studioCode);

    // Highlight
    document.querySelectorAll('.studio-card').forEach(c => c.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    // Update Step Indicator
    document.getElementById('step1-indicator').classList.add('done');
    document.getElementById('step2-indicator').classList.add('active');

    // Move to Step 2
    showStep(2);
    renderSports();
}

// ==================== STEP 2: RENDER SPORTS ====================
function renderSports() {
    const container = document.getElementById('sport-list');
    if (!container || !selectedStudio) return;

    const sports = SPORT_TYPES.filter(st =>
        selectedStudio.SportTypes.includes(st.SportName)
    );

    container.innerHTML = sports.map(s => `
        <div class="sport-card" onclick="selectSport('${s.SportName}')">
            <h3>${s.SportName}</h3>
            <p>Intensity: ${s.IntensityLevel}</p>
            <span class="intensity-tag">${s.IntensityLevel}</span>
        </div>
    `).join('');
}

function selectSport(sportName) {
    selectedSport = SPORT_TYPES.find(s => s.SportName === sportName);

    document.querySelectorAll('.sport-card').forEach(c => c.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    document.getElementById('step2-indicator').classList.add('done');
    document.getElementById('step3-indicator').classList.add('active');

    showStep(3);
    renderRooms();
}

// ==================== STEP 3: RENDER ROOMS ====================
function renderRooms() {
    const container = document.getElementById('room-list');
    if (!container || !selectedStudio || !selectedSport) return;

    const rooms = ROOMS.filter(r =>
        r.StudioCode === selectedStudio.StudioCode &&
        r.SportType === selectedSport.SportName
    );

    if (rooms.length === 0) {
        container.innerHTML = '<p>No rooms available for this selection.</p>';
        return;
    }

    container.innerHTML = rooms.map(r => `
        <div class="room-card" onclick="selectRoom(${r.RoomID})">
            <h3>${r.RoomName}</h3>
            <p>Capacity: ${r.Capacity} people</p>
            <p>Sport: ${r.SportType}</p>
            <button class="btn-primary">Select</button>
        </div>
    `).join('');
}

function selectRoom(roomId) {
    selectedRoom = ROOMS.find(r => r.RoomID === roomId);

    document.querySelectorAll('.room-card').forEach(c => c.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    document.getElementById('step3-indicator').classList.add('done');
    document.getElementById('step4-indicator').classList.add('active');

    showStep(4);
    renderSummary();
}

// ==================== STEP 4: SUMMARY + CONFIRM ====================
function renderSummary() {
    const summary = document.getElementById('booking-summary');
    if (!summary) return;

    summary.innerHTML = `
        <h4>Booking Summary</h4>
        <p>Studio: <span>${selectedStudio.Name}</span></p>
        <p>Sport: <span>${selectedSport.SportName}</span></p>
        <p>Room: <span>${selectedRoom.RoomName}</span></p>
        <p>Capacity: <span>${selectedRoom.Capacity} people</span></p>
    `;
}

// ==================== CONFIRM BOOKING ====================
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

    // ✅ เรียก API
    try {
        const memberId = user.MemberID || user.id;

        // เตรียมข้อมูลส่ง API
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
                ? [{ TrainerID: flow.trainer.TrainerID, TrainerRole: "Main", HourlyRate: 500 }]
                : [],
        };

        const result = await SheSparksAPI.post("/bookings", bookingData);

        // ✅ สำเร็จ
        showModal({
            type: "success",
            title: "จองสำเร็จ!",
            message: `
        <strong>Booking ID:</strong> ${result.BookingID}<br>
        <strong>Studio:</strong> ${flow.studio.Name}<br>
        <strong>Room:</strong> ${flow.room.RoomName}<br>
        <strong>Date:</strong> ${flow.date}<br>
        <strong>Time:</strong> ${flow.startTime} - ${flow.endTime}<br>
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

// ==================== HELPERS ====================
function showStep(stepNumber) {
    for (let i = 1; i <= 4; i++) {
        const section = document.getElementById(`step${i}`);
        if (section) {
            section.classList.toggle('hidden', i !== stepNumber);
        }
    }
}

function resetFlow() {
    selectedStudio = null;
    selectedSport = null;
    selectedRoom = null;

    document.querySelectorAll('.step').forEach(s => s.classList.remove('active', 'done'));
    document.getElementById('step1-indicator').classList.add('active');

    showStep(1);
    renderStudios();
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    showStep(1);
    renderStudios();
});