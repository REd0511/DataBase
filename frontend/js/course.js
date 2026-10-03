/* ============================================
   course.js - Course Page
   FEATURES:
   - แสดงรายการคอร์สจาก Mock Data
   - กรองตาม Level
   - ปุ่ม Enroll
   - TODO: เชื่อมกับ API /api/courses
   ============================================ */

let allCourses = [];

document.addEventListener("DOMContentLoaded", () => {
  allCourses = COURSES;
  renderCourses(allCourses);
});

function renderCourses(courses) {
  const container = document.getElementById("course-list");
  if (!container) return;

  if (courses.length === 0) {
    container.innerHTML =
      '<p style="text-align:center;grid-column:1/-1;color:var(--text-mid);">No courses match your filter.</p>';
    return;
  }

  container.innerHTML = courses
    .map(
      (c) => `
        <div class="course-card">
            <span class="level" data-level="${c.Level}">${c.Level}</span>
            <h3>${c.Title}</h3>
            <p class="duration">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${c.DurationHours} hours
            </p>
            <p class="fee">${c.StandardFee.toLocaleString()}</p>
            <button class="btn-primary" onclick="enrollCourse(${c.CourseID})">Enroll Now</button>
        </div>
    `,
    )
    .join("");
}

function filterCourses() {
  const level = document.getElementById("levelFilter").value;
  const filtered = level
    ? allCourses.filter((c) => c.Level === level)
    : allCourses;
  renderCourses(filtered);
}

function enrollCourse(courseId) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const course = allCourses.find((c) => c.CourseID === courseId);
  if (
    confirm(
      `Enroll in "${course.Title}" for ฿${course.StandardFee.toLocaleString()}?`,
    )
  ) {
    // TODO: call API /api/enrollments
    alert(
      `✅ สมัครคอร์ส "${course.Title}" สำเร็จ!\n(Prototype — ยังไม่เชื่อมต่อ Backend)`,
    );
  }
}
