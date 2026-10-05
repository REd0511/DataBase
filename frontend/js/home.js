/* ============================================
   home.js - Recommendations Carousel
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  renderCarousel("studio-carousel", STUDIOS, (s) => ({
    title: s.Name,
    subtitle: s.Location,
  }));
  renderCarousel("sport-carousel", SPORT_TYPES, (s) => ({
    title: s.SportName,
    subtitle: `Intensity: ${s.IntensityLevel}`,
  }));
  renderCarousel("course-carousel", COURSES, (c) => ({
    title: c.Title,
    subtitle: `฿${c.StandardFee} • ${c.Level}`,
  }));
  renderCarousel("reward-carousel", REWARDS, (r) => ({
    title: r.Name,
    subtitle: `${r.PointCost} pts • ${r.Category}`,
  }));
});

function renderCarousel(id, data, mapper) {
  const container = document.getElementById(id);
  if (!container) return;

  container.innerHTML = data
    .map((item) => {
      const { title, subtitle } = mapper(item);
      return `
            <div class="carousel-card">
                <h4>${title}</h4>
                <p>${subtitle}</p>
            </div>
        `;
    })
    .join("");
}

// ==================== GET STARTED BUTTON LOGIC ====================
document.addEventListener("DOMContentLoaded", () => {
  const getStartedBtn = document.getElementById("getStartedBtn");

  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", (e) => {
      e.preventDefault(); // ป้องกันไม่ให้ลิงก์ทำงานเปลี่ยนหน้าทันที

      // เช็กว่ามีข้อมูล user ใน localStorage หรือไม่
      const user = localStorage.getItem("user");

      if (!user) {
        // ถ้ายังไม่ล็อกอิน ให้ไปที่หน้า Login
        window.location.href = "/views/login.html";
      } else {
        // ถ้าล็อกอินแล้ว ให้ไปหน้า Booking (หรือหน้าอื่นที่คุณต้องการ)
        window.location.href = "/views/booking.html";
      }
    });
  }
});
