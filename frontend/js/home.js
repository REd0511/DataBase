/* ============================================
   home.js - Recommendations Carousel + Recommend Settings
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  const settings = JSON.parse(localStorage.getItem("recommendSettings")) || {
    studios: true,
    sports: true,
    courses: true,
    rewards: true,
  };

  // ==================== RENDER CAROUSELS ตาม SETTINGS ====================
  if (settings.studios) {
    renderCarousel("studio-carousel", STUDIOS, (s) => ({
      title: s.Name,
      subtitle: s.Location,
      image: s.ImageURL,
    }));
  } else {
    hideSection("studio-carousel");
  }

  if (settings.sports) {
    renderCarousel("sport-carousel", SPORT_TYPES, (s) => ({
      title: s.SportName,
      subtitle: `Intensity: ${s.IntensityLevel}`,
      image: s.ImageURL,
    }));
  } else {
    hideSection("sport-carousel");
  }

  if (settings.courses) {
    renderCarousel("course-carousel", COURSES, (c) => ({
      title: c.Title,
      subtitle: `฿${c.StandardFee} • ${c.Level}`,
      image: c.ImageURL,
    }));
  } else {
    hideSection("course-carousel");
  }

  if (settings.rewards) {
    renderCarousel("reward-carousel", REWARDS, (r) => ({
      title: r.Name,
      subtitle: `${r.PointCost} pts • ${r.Category}`,
      image: r.ImageURL,
    }));
  } else {
    hideSection("reward-carousel");
  }
});

// ==================== RENDER CAROUSEL ====================
function renderCarousel(id, data, mapper) {
  const container = document.getElementById(id);
  if (!container) return;

  container.innerHTML = data
    .map((item) => {
      const { title, subtitle, image } = mapper(item);
      return `
        <div class="carousel-card">
          ${image ? `<img src="${image}" alt="${title}" class="carousel-image" onerror="this.style.display='none'">` : ""}
          <h4>${title}</h4>
          <p>${subtitle}</p>
        </div>
      `;
    })
    .join("");
}

// ==================== HIDE SECTION ====================
function hideSection(carouselId) {
  const container = document.getElementById(carouselId);
  if (!container) return;
  const section = container.closest(".carousel-section");
  if (section) section.style.display = "none";
}

// ==================== GET STARTED BUTTON ====================
document.addEventListener("DOMContentLoaded", () => {
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
});