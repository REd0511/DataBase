/* ============================================
   global.js - Navbar, Profile Popover, Auth
   ============================================ */

// ==================== NAVBAR ====================
function renderNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const isLoginPage = window.location.pathname.includes("login.html");
  if (isLoginPage) {
    navbar.style.display = "none";
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user ? user.role : "guest";

  let navLinks = "";

  navLinks += `
    <a href="/views/index.html" class="home-icon ${isActive("index.html")}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </a>
  `;

  if (role === "guest" || role === "member") {
    navLinks += `
      <a href="/views/booking.html" class="${isActive("booking.html")}">Booking</a>
      <a href="/views/course.html" class="${isActive("course.html")}">Course</a>
      <a href="/views/points.html" class="${isActive("points.html")}">Points</a>
      <a href="/views/rewards.html" class="${isActive("rewards.html")}">Rewards</a>
    `;
  } else if (role === "admin") {
    navLinks += `<a href="/views/admin.html" class="${isActive("admin.html")}">Dashboard</a>`;
  } else if (role === "trainer") {
    navLinks += `<a href="/views/trainer-dashboard.html" class="${isActive("trainer-dashboard.html")}">Dashboard</a>`;
  } else if (role === "manager") {
    navLinks += `<a href="/views/manager-dashboard.html" class="${isActive("manager-dashboard.html")}">Dashboard</a>`;
  }

  let profileSection = "";

  if (user) {
    profileSection = `
      <div class="profile-wrapper">
        <div class="profile-btn" onclick="toggleProfilePopover(event)">
          ${user.name.charAt(0)}
        </div>
        <div class="profile-popover" id="profile-popover"></div>
      </div>
    `;
  } else {
    profileSection = `<a href="/views/login.html" class="btn-login">Login</a>`;
  }

  navbar.innerHTML = `
    <a href="/views/index.html" class="logo">
      <img src="/assets/logo.png" alt="SheSparks">
    </a>
    <nav>
      ${navLinks}
      ${profileSection}
    </nav>
  `;
}

function isActive(page) {
  return window.location.pathname.endsWith(page) ? "active" : "";
}

// ==================== PROFILE POPOVER ====================
function toggleProfilePopover(event) {
  event.stopPropagation();

  const popover = document.getElementById("profile-popover");
  if (!popover) return;

  const isOpen = popover.classList.contains("active");

  document
    .querySelectorAll(".profile-popover")
    .forEach((p) => p.classList.remove("active"));

  if (!isOpen) {
    renderProfilePopover();
    popover.classList.add("active");
  }
}

function renderProfilePopover() {
  const popover = document.getElementById("profile-popover");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !popover) return;

  const role = user.role;
  let popoverContent = "";

  if (role === "admin") {
    popoverContent = `
      <div class="popover-links">
        <a href="/views/admin.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Admin Dashboard
        </a>
      </div>
    `;
  } else if (role === "trainer") {
    popoverContent = `
      <div class="popover-links">
        <a href="/views/trainer-dashboard.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          My Dashboard
        </a>
      </div>
    `;
  } else if (role === "manager") {
    popoverContent = `
      <div class="popover-links">
        <a href="/views/manager-dashboard.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          My Dashboard
        </a>
      </div>
    `;
  } else {
    // ==================== Member ====================
    popoverContent = `
      <a href="/views/points.html" class="popover-points clickable">
        <span>Total Points</span>
        <span class="points-value" id="popoverPointsValue">…</span>
      </a>
      <div class="popover-links">
        <a href="/views/my-courses.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          My Courses
        </a>
        <a href="/views/rewards.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"></polyline>
            <rect x="2" y="7" width="20" height="5"></rect>
            <line x1="12" y1="22" x2="12" y2="7"></line>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
          </svg>
          My Rewards
        </a>
        <a href="/views/booking-history.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          My Bookings
        </a>
      </div>
    `;
  }

  popover.innerHTML = `
    <div class="popover-header">
      <div class="avatar-small">${user.name.charAt(0)}</div>
      <div class="user-info">
        <h4>${user.name}</h4>
        <p>${user.email}</p>
        <span class="role-badge">${getRoleLabel(role)}</span>
      </div>
    </div>
    ${popoverContent}
    <button class="btn-logout" onclick="logout()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
      Sign Out
    </button>
  `;

  // ถ้าเป็น member → ยิง API ดึงแต้มจริง
  if (role === "member") {
    fetchUserPointsFromAPI(user);
  }
}

async function fetchUserPointsFromAPI(user) {
  const el = document.getElementById("popoverPointsValue");
  if (!el) return;

  try {
    const api = window.SheSparksAPI;
    if (!api) {
      el.textContent = "0";
      return;
    }

    const memberId = user.MemberID || user.id;
    const data = await api.memberPoints(memberId);
    const balance = Number(data.Balance || 0);
    el.textContent = balance.toLocaleString();
  } catch (error) {
    console.warn("Cannot load points for popover:", error.message);
    el.textContent = "0";
  }
}

function getRoleLabel(role) {
  const labels = {
    member: "Member",
    admin: "Admin",
    trainer: "Trainer",
    manager: "Studio Manager",
  };
  return labels[role] || "User";
}

// ==================== CLOSE ON CLICK OUTSIDE ====================
document.addEventListener("click", (e) => {
  const wrapper = document.querySelector(".profile-wrapper");
  if (!wrapper) return;

  if (!wrapper.contains(e.target)) {
    document
      .querySelectorAll(".profile-popover")
      .forEach((p) => p.classList.remove("active"));
  }
});

// ==================== LOGOUT ====================
function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("bookingFlow");
  window.location.href = "/views/index.html";
}

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
  setupNavbarScroll();
});

// ==================== NAVBAR SCROLL ====================
function setupNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const isLoginPage = window.location.pathname.includes("login.html");
  if (isLoginPage) return;

  const isHomePage = document.body.classList.contains("home-page");

  if (isHomePage) {
    navbar.classList.add("transparent-start");

    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.remove("transparent-start");
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.add("transparent-start");
        navbar.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
  }
}