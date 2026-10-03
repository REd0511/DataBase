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
