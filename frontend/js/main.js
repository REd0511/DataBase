/* ============================================
   main.js - Global functions
   FEATURES:
   - Login ด้วย Hardcode
   - Redirect ตาม Role (member / admin / trainer / manager)
   - เก็บสถานะ login ใน localStorage
   ============================================ */

// ==================== LOGIN ====================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("memberId").value.trim();
    const pwd = document.getElementById("password").value.trim();

    const user = USERS.find((u) => u.id === id && u.password === pwd);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
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