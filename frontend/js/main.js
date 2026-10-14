/* ============================================
   main.js - Login + Auth
   FEATURES:
   - Login ผ่าน Hardcode
   - แปลง ID → MemberID (INT) สำหรับ API
   - Redirect ตาม Role
   ============================================ */

// ==================== MEMBER ID MAPPING ====================
// Map user.id (String) → MemberID (INT) ที่มีใน DB
const MEMBER_ID_MAP = {
  M001: 1,
  A001: 1,
  T001: 1,
  T002: 2,
  T003: 3,
  T004: 4,
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
      // ✅ เพิ่ม MemberID (INT) สำหรับ API
      const userWithId = {
        ...user,
        MemberID: MEMBER_ID_MAP[user.id] || 1,
      };

      localStorage.setItem("user", JSON.stringify(userWithId));
      alert(`Welcome, ${user.name}!`);

      // ==================== REDIRECT ตาม ROLE ====================
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