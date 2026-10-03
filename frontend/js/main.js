/* ============================================
   main.js - Global functions
   FEATURES:
   - Login ด้วย Hardcode
   - Redirect ตาม Role (member/admin)
   - เก็บสถานะ login ใน localStorage
   - แสดง Trainer/Reward list (mock)
   ============================================ */

// ==================== HARDCODED USERS ====================
const USERS = [
    { id: 'M001', password: '1234', role: 'member', name: 'Member Demo' },
    { id: 'A001', password: 'admin', role: 'admin', name: 'Admin Demo' }
];

// ==================== LOGIN ====================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('memberId').value.trim();
        const pwd = document.getElementById('password').value.trim();

        const user = USERS.find(u => u.id === id && u.password === pwd);

        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            alert(`Welcome, ${user.name}!`);
            if (user.role === 'admin') {
                window.location.href = 'index.html'; // TODO: admin.html
            } else {
                window.location.href = 'booking.html';
            }
        } else {
            alert('ID หรือ Password ไม่ถูกต้อง');
        }
    });
}

// ==================== MOCK DATA ====================
const MOCK_TRAINERS = [
    { TrainerID: 1, Name: 'Coach Mali', SportType: 'Yoga', Phone: '081-111-1111' },
    { TrainerID: 2, Name: 'Coach Ploy', SportType: 'Pilates', Phone: '082-222-2222' },
    { TrainerID: 3, Name: 'Coach Fah', SportType: 'Boxing', Phone: '083-333-3333' }
];

const MOCK_REWARDS = [
    { RewardID: 1, Name: 'Spa Voucher 500 THB', PointCost: 500, Category: 'Beauty' },
    { RewardID: 2, Name: 'Hair Treatment', PointCost: 300, Category: 'Beauty' },
    { RewardID: 3, Name: 'Yoga Mat', PointCost: 800, Category: 'Sports' },
    { RewardID: 4, Name: '10% Discount', PointCost: 100, Category: 'Discount' }
];

// ==================== RENDER TRAINERS ====================
const trainerList = document.getElementById('trainer-list');
if (trainerList) {
    trainerList.innerHTML = MOCK_TRAINERS.map(t => `
        <div class="trainer-card">
            <h3>${t.Name}</h3>
            <p>Sport: ${t.SportType}</p>
            <p>Phone: ${t.Phone}</p>
            <button class="btn-primary" onclick="alert('จองเทรนเนอร์ ${t.Name} (mock)')">Book</button>
        </div>
    `).join('');
}

// ==================== RENDER REWARDS ====================
const rewardList = document.getElementById('reward-list');
if (rewardList) {
    rewardList.innerHTML = MOCK_REWARDS.map(r => `
        <div class="reward-card">
            <h3>${r.Name}</h3>
            <p>Category: ${r.Category}</p>
            <p>Points: ${r.PointCost}</p>
            <button class="btn-primary" onclick="alert('แลก ${r.Name} (mock)')">Redeem</button>
        </div>
    `).join('');
}

// ==================== LOGOUT (optional) ====================
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}