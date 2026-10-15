/* ============================================
   my-courses.js - My Courses Page (API Connected)
   ============================================ */

let allEnrollments = [];
let currentUser = null;

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", async () => {
  currentUser = JSON.parse(localStorage.getItem("user"));

  if (!currentUser) {
    showModal({
      type: "warning",
      title: "Please Login",
      message: "กรุณาเข้าสู่ระบบก่อนดูคอร์สเรียนของคุณ",
      buttonText: "ไปที่ Login",
      redirectTo: "/views/login.html",
    });
    return;
  }

  await loadEnrollments();
  renderEnrollments();
});

// ==================== LOAD ENROLLMENTS ====================
async function loadEnrollments() {
  const container = document.getElementById("my-courses-list");
  if (container) {
    container.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:var(--text-mid);">กำลังโหลดข้อมูลคอร์ส...</p>';
  }

  try {
    const memberId = currentUser.MemberID || currentUser.id;
    const enrollments = await SheSparksAPI.get(`/courses/member/${memberId}`);
    allEnrollments = Array.isArray(enrollments) ? enrollments : [];
  } catch (error) {
    console.error("Load enrollments error:", error);
    allEnrollments = [];

    if (container) {
      container.innerHTML = `
        <div class="empty-state-my-courses" style="border-color:var(--danger);">
          <h3 style="color:var(--danger);">โหลดข้อมูลไม่สำเร็จ</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }
}

// ==================== RENDER ENROLLMENTS ====================
function renderEnrollments(filtered = null) {
  const enrollments = filtered || allEnrollments;
  const container = document.getElementById("my-courses-list");
  if (!container) return;

  // Summary Cards
  const totalCourses = enrollments.length;
  const totalPaid = enrollments
    .filter((e) => e.PaymentStatus === "PAID")
    .reduce((sum, e) => sum + Number(e.StandardFee || 0), 0);
  const totalPointsEarned = enrollments
    .filter((e) => e.PaymentStatus === "PAID")
    .reduce((sum, e) => sum + Math.floor(Number(e.StandardFee || 0)), 0);

  document.getElementById("totalCourses").textContent = totalCourses;
  document.getElementById("totalPaid").textContent = "฿" + totalPaid.toLocaleString();
  document.getElementById("totalPointsEarned").textContent = totalPointsEarned.toLocaleString();

  // Empty State
  if (enrollments.length === 0) {
    container.innerHTML = `
      <div class="empty-state-my-courses">
        <h3>No Courses Yet</h3>
        <p>คุณยังไม่ได้ลงทะเบียนคอร์สเรียนใดๆ เริ่มเลือกคอร์สที่ชอบเลย!</p>
        <a href="/views/course.html" class="btn-primary">Browse Courses</a>
      </div>
    `;
    return;
  }

  // Render Cards
  container.innerHTML = enrollments
    .map((e) => {
      const date = formatDate(e.EnrollmentDate);
      const status = e.PaymentStatus || "UNPAID";
      const statusClass = status.toLowerCase();
      const pointsEarned = Math.floor(Number(e.StandardFee || 0));

      return `
        <div class="my-course-card">
          ${e.ImageURL
            ? `<img src="${e.ImageURL}" class="course-image" alt="${e.Title}" onerror="this.style.display='none'">`
            : ""}
          <span class="level" data-level="${escapeHtml(e.Level)}">${escapeHtml(e.Level)}</span>
          <h3>${escapeHtml(e.Title)}</h3>

          <div class="info-row">
            <span>Enrolled:</span>
            <strong>${date}</strong>
          </div>

          <div class="info-row">
            <span>Duration:</span>
            <strong>${e.DurationHours || "-"} hours</strong>
          </div>

          <div class="fee">฿${Number(e.StandardFee || 0).toLocaleString()}</div>

          <span class="status-badge ${statusClass}">${status}</span>

          ${status === "PAID" ? `
            <div class="points-earned">
              🎉 +${pointsEarned.toLocaleString()} points earned
            </div>
          ` : ""}
        </div>
      `;
    })
    .join("");
}

// ==================== FILTER ====================
function filterEnrollments() {
  const status = document.getElementById("statusFilter")?.value;

  let filtered = [...allEnrollments];

  if (status) {
    filtered = filtered.filter((e) => (e.PaymentStatus || "UNPAID") === status);
  }

  renderEnrollments(filtered);
}

function clearFilters() {
  const sf = document.getElementById("statusFilter");
  if (sf) sf.value = "";
  renderEnrollments();
}

// ==================== HELPERS ====================
function formatDate(rawDate) {
  if (!rawDate) return "-";
  const str = String(rawDate);
  if (str.includes("T")) {
    const d = new Date(str);
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }
  if (str.includes(" ")) {
    return str.split(" ")[0];
  }
  return str;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}