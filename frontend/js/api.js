/* ============================================
   API Helper - Central file for all API calls
   FEATURES:
   - เก็บ URL ของ Backend ไว้ที่เดียว
   - มีฟังก์ชันสำหรับเรียก API ทุก Entity
   - ใช้ Mock Data ก่อน จนกว่า Backend จะพร้อม
   TODO: เปลี่ยน USE_MOCK = false เมื่อ Backend พร้อม
   ============================================ */

const API_URL = 'http://localhost:3000/api';
const USE_MOCK = true; // ← เปลี่ยนเป็น false เมื่อเชื่อม Backend จริง

// ==================== MOCK DATA ====================
const MOCK = {
    rooms: [
        { RoomID: 1, RoomName: 'Yoga Room A', Capacity: 20, SportType: 'Yoga' },
        { RoomID: 2, RoomName: 'Pilates Room B', Capacity: 15, SportType: 'Pilates' },
        { RoomID: 3, RoomName: 'Boxing Room C', Capacity: 10, SportType: 'Boxing' },
        { RoomID: 4, RoomName: 'Badminton Court D', Capacity: 4, SportType: 'Badminton' }
    ],
    trainers: [
        { TrainerID: 1, Name: 'Coach Mali', SportType: 'Yoga', Phone: '081-111-1111' },
        { TrainerID: 2, Name: 'Coach Ploy', SportType: 'Pilates', Phone: '082-222-2222' },
        { TrainerID: 3, Name: 'Coach Fah', SportType: 'Boxing', Phone: '083-333-3333' }
    ],
    courses: [
        { CourseID: 1, Title: 'Basic Yoga', Level: 'Beginner', DurationHours: 10, StandardFee: 1500 },
        { CourseID: 2, Title: 'Advanced Yoga', Level: 'Advanced', DurationHours: 15, StandardFee: 2500 },
        { CourseID: 3, Title: 'Pilates Intro', Level: 'Beginner', DurationHours: 8, StandardFee: 1200 },
        { CourseID: 4, Title: 'Women Boxing', Level: 'Intermediate', DurationHours: 12, StandardFee: 2000 }
    ],
    rewards: [
        { RewardID: 1, Name: 'Spa Voucher 500 THB', PointCost: 500, Category: 'Beauty' },
        { RewardID: 2, Name: 'Hair Treatment', PointCost: 300, Category: 'Beauty' },
        { RewardID: 3, Name: 'Yoga Mat', PointCost: 800, Category: 'Sports' },
        { RewardID: 4, Name: '10% Discount', PointCost: 100, Category: 'Discount' }
    ],
    points: {
        total: 1250,
        history: [
            { Date: '2026-09-01', Earned: 300, Redeemed: 0 },
            { Date: '2026-09-05', Earned: 0, Redeemed: 200 },
            { Date: '2026-09-10', Earned: 500, Redeemed: 0 }
        ]
    }
};

// ==================== API FUNCTIONS ====================

export async function getRooms() {
    if (USE_MOCK) return MOCK.rooms;
    const res = await fetch(`${API_URL}/rooms`);
    return res.json();
}

export async function getTrainers() {
    if (USE_MOCK) return MOCK.trainers;
    const res = await fetch(`${API_URL}/trainers`);
    return res.json();
}

export async function getCourses() {
    if (USE_MOCK) return MOCK.courses;
    const res = await fetch(`${API_URL}/courses`);
    return res.json();
}

export async function getRewards() {
    if (USE_MOCK) return MOCK.rewards;
    const res = await fetch(`${API_URL}/rewards`);
    return res.json();
}

export async function getPoints(memberId) {
    if (USE_MOCK) return MOCK.points;
    const res = await fetch(`${API_URL}/points/${memberId}`);
    return res.json();
}

export async function createBooking(data) {
    if (USE_MOCK) {
        console.log('Mock booking:', data);
        return { success: true, message: 'Booking created (mock)' };
    }
    const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

export async function redeemReward(memberId, rewardId) {
    if (USE_MOCK) {
        console.log('Mock redeem:', memberId, rewardId);
        return { success: true, message: 'Reward redeemed (mock)' };
    }
    const res = await fetch(`${API_URL}/redemptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, rewardId })
    });
    return res.json();
}