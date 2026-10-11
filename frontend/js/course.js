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
    container.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:var(--text-mid);">No courses match your filter.</p>';
    return;
  }

  container.innerHTML = courses.map(c => `
    <div class="course-card">
      ${c.ImageURL ? `<img src="${c.ImageURL}" class="card-image" alt="${c.Title}" onerror="this.style.display='none'">` : ""}
      <span class="level" data-level="${c.Level}">${c.Level}</span>
      <h3>${c.Title}</h3>
      <p class="duration">⏱ ${c.DurationHours} hours</p>
      <p>📍 ${getStudioName(c.StudioCode)}</p>
      <p>👤 ${getTrainerName(c.TrainerID)}</p>
      <p class="fee">฿${c.StandardFee.toLocaleString()}</p>
      <button class="btn-primary" onclick="enrollCourse(${c.CourseID})">Enroll Now</button>
    </div>
  `).join("");
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
    window.location.href = "/views/login.html";
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
