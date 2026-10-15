/* ============================================
   main.js - Login + Auth
   FEATURES:
   - Login ผ่าน Hardcode
   - แปลง ID → MemberID (INT) สำหรับ API
   - Redirect ตาม Role
   ============================================ */

// ==================== MOCK USERS ====================
const USERS = [
  { id: "M001", password: "1234", role: "member", name: "Member Demo", email: "member@shesparks.com", memberLevel: "Silver" },
  { id: "A001", password: "admin", role: "admin", name: "Admin Demo", email: "admin@shesparks.com" },

  // Trainers (ตรงกับ DB)
  { id: "T001", password: "trainer", role: "trainer", name: "Coach Mali", email: "mali@shesparks.com", trainerId: 1, sportTypeID: 1, studioCode: "ST001" },
  { id: "T002", password: "trainer", role: "trainer", name: "Coach Ploy", email: "ploy@shesparks.com", trainerId: 2, sportTypeID: 2, studioCode: "ST001" },
  { id: "T003", password: "trainer", role: "trainer", name: "Coach Fah", email: "fah@shesparks.com", trainerId: 3, sportTypeID: 3, studioCode: "ST002" },

  // ✅ Managers (แก้ชื่อให้ตรงกับ Studio ใน DB)
  { id: "S001", password: "manager", role: "manager", name: "Manager Nimman", email: "nimman@shesparks.com", studioCode: "ST001" },
  { id: "S002", password: "manager", role: "manager", name: "Manager Old City", email: "oldcity@shesparks.com", studioCode: "ST002" },
  { id: "S003", password: "manager", role: "manager", name: "Manager Riverside", email: "riverside@shesparks.com", studioCode: "ST003" },
];

// ==================== MEMBER ID MAPPING ====================
const MEMBER_ID_MAP = {
  M001: 1,
  A001: 1,
  T001: 1,
  T002: 2,
  T003: 3,
  S001: 1,
  S002: 2,
  S003: 3,
};

// ==================== LOGIN ====================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("memberId").value.trim();
    const pwd = document.getElementById("password").value.trim();

    const user = USERS.find((u) => u.id === id && u.password === pwd);

    if (user) {
      const userWithId = {
        ...user,
        MemberID: MEMBER_ID_MAP[user.id] || 1,
      };

      localStorage.setItem("user", JSON.stringify(userWithId));
      alert(`Welcome, ${user.name}!`);

      switch (user.role) {
        case "admin":
          window.location.href = "/views/admin.html";
          break;
        case "trainer":
          window.location.href = "/views/trainer-dashboard.html";
          break;
        case "manager":
          window.location.href = "/views/manager-dashboard.html";
          break;
        case "member":
        default:
          window.location.href = "/views/index.html";
          break;
      }
    } else {
      alert("ID หรือ Password ไม่ถูกต้อง");
    }
  });
}

// ==================== LOGOUT ====================
function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("bookingFlow");
  window.location.href = "/views/login.html";
}