 
/* ============================================
   booking.js - Booking Page
   FEATURES:
   - ดึงรายการห้องจาก Mock Data
   - แสดงผลด้วยการ์ด
   - TODO: เชื่อมกับ API /api/rooms
   ============================================ */

const MOCK_ROOMS = [
    { RoomID: 1, RoomName: 'Yoga Room A', Capacity: 20, SportType: 'Yoga' },
    { RoomID: 2, RoomName: 'Pilates Room B', Capacity: 15, SportType: 'Pilates' },
    { RoomID: 3, RoomName: 'Boxing Room C', Capacity: 10, SportType: 'Boxing' },
    { RoomID: 4, RoomName: 'Badminton Court D', Capacity: 4, SportType: 'Badminton' }
];

function renderRooms(rooms) {
    const container = document.getElementById('room-list');
    if (!container) return;

    if (rooms.length === 0) {
        container.innerHTML = '<p>No rooms available.</p>';
        return;
    }

    container.innerHTML = rooms.map(r => `
        <div class="room-card">
            <h3>${r.RoomName}</h3>
            <p>Capacity: ${r.Capacity} people</p>
            <p>Sport: ${r.SportType}</p>
            <button class="btn-primary" onclick="bookRoom(${r.RoomID})">Book</button>
        </div>
    `).join('');
}

function bookRoom(roomId) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    const date = document.getElementById('bookingDate')?.value;
    const start = document.getElementById('startTime')?.value;
    const end = document.getElementById('endTime')?.value;

    if (!date || !start || !end) {
        alert('Please select date and time');
        return;
    }

    // TODO: call API createBooking
    alert(`จองห้อง ${roomId} วันที่ ${date} เวลา ${start}-${end} (mock)`);
}

// Load rooms on page load
document.addEventListener('DOMContentLoaded', () => {
    renderRooms(MOCK_ROOMS);
});