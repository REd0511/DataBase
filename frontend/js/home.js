/* ============================================
   home.js - Home Page Logic
   FEATURES:
   - Get Started Button (ตรวจสอบ Login)
   - CTA Button
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ==================== GET STARTED BUTTON ====================
  const getStartedBtn = document.getElementById("getStartedBtn");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const user = localStorage.getItem("user");
      if (!user) {
        window.location.href = "/views/login.html";
      } else {
        window.location.href = "/views/booking.html";
      }
    });
  }

  // ==================== CTA BUTTON ====================
  const ctaBtn = document.getElementById("ctaBtn");
  if (ctaBtn) {
    ctaBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const user = localStorage.getItem("user");
      if (!user) {
        window.location.href = "/views/login.html";
      } else {
        window.location.href = "/views/booking.html";
      }
    });
  }
});