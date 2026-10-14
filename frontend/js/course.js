/* ============================================
   course.js - Course Page
   FEATURES:
   - Load courses from API + Fallback to data.js
   - Filter by Level
   - Enroll with Modal
   - Show "Enrolled" status
   ============================================ */

let allCourses = [];
let userEnrollments = [];

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("course-list");
  container.innerHTML = "<p>Loading courses...</p>";

  // Load user enrollments from API
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user && user.role === "member") {
    await loadUserEnrollments(user);
  }

  try {
    if (!window.SheSparksAPI) throw new Error("API client is not loaded.");

    const apiCourses = await SheSparksAPI.courses();

    if (Array.isArray(apiCourses) && apiCourses.length > 0) {
      allCourses = apiCourses;
    } else {
      throw new Error("No courses from API");
    }
  } catch (error) {
    // ✅ FALLBACK: ใช้ COURSES จาก data.js
    // TODO: ลบ Fallback นี้เมื่อ Backend พร้อม
    console.warn("API unavailable, using mock data:", error.message);
    allCourses = typeof COURSES !== "undefined" ? COURSES : [];
  }

  renderCourses(allCourses);
});

// ==================== GET USER ENROLLMENTS ====================
function getUserEnrollments(memberId) {
  const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
  return enrollments.filter(
    (e) => e.MemberID === memberId || e.MemberID === Number(memberId),
  );
}

// ==================== RENDER COURSES ====================
function renderCourses(courses) {
  const container = document.getElementById("course-list");
  if (!container) return;

  if (!courses || courses.length === 0) {
    container.innerHTML =
      '<p style="text-align:center;grid-column:1/-1;color:var(--text-mid);">No courses available.</p>';
    return;
  }

  container.innerHTML = courses
    .map((c) => {
      const isEnrolled = userEnrollments.some(
        (e) => Number(e.CourseID) === Number(c.CourseID),
      );
      const prereq = getPrerequisite(c.CourseID);
      const prereqMet = checkPrerequisite(c.CourseID);

      // ✅ ปุ่มตามสถานะ
      let buttonHTML = "";
      if (isEnrolled) {
        buttonHTML = `<button class="btn-primary enrolled" disabled>✓ Enrolled</button>`;
      } else if (!prereqMet) {
        buttonHTML = `<button class="btn-primary locked" disabled>🔒 Prerequisite Required</button>`;
      } else {
        buttonHTML = `<button class="btn-primary" onclick="openEnrollModal(${Number(c.CourseID)})">Enroll Now</button>`;
      }

      // ✅ แสดง Prerequisite
      const prereqHTML = prereq
        ? `<p class="prerequisite ${prereqMet ? "met" : "not-met"}">
           ${prereqMet ? "✓" : "🔒"} Prerequisite: ${prereq.Title}
         </p>`
        : "";

      return `
      <div class="course-card ${isEnrolled ? "is-enrolled" : ""} ${!prereqMet && !isEnrolled ? "is-locked" : ""}">
        ${c.ImageURL ? `<img src="${c.ImageURL}" class="course-image" alt="${escapeHTML(c.Title)}" onerror="this.style.display='none'">` : ""}
        <span class="level" data-level="${escapeHTML(c.Level)}">${escapeHTML(c.Level)}</span>
        <h3>${escapeHTML(c.Title)}</h3>
        <p class="duration">⏱ ${escapeHTML(c.DurationHours)} hours</p>
        ${prereqHTML}
        <p class="fee">฿${Number(c.StandardFee || 0).toLocaleString()}</p>
        ${buttonHTML}
      </div>
    `;
    })
    .join("");
}

// ==================== PREREQUISITE ====================
function getPrerequisite(courseId) {
  // ✅ ใช้ API ก่อน (ถ้ามี)
  if (typeof COURSE_PREREQUISITE !== "undefined") {
    const link = COURSE_PREREQUISITE.find(
      (cp) => Number(cp.CourseID) === Number(courseId),
    );
    if (link) {
      const prereqCourse = allCourses.find(
        (c) => Number(c.CourseID) === Number(link.PrerequisiteCourseID),
      );
      return prereqCourse || null;
    }
  }
  return null;
}

function checkPrerequisite(courseId) {
  const prereq = getPrerequisite(courseId);
  if (!prereq) return true; // ไม่มี prerequisite → ผ่าน

  // ✅ ตรวจสอบว่า User ผ่าน Course นั้นหรือยัง
  const passed = userEnrollments.some(
    (e) =>
      Number(e.CourseID) === Number(prereq.CourseID) &&
      (e.Status === "Confirmed" || e.Status === "Passed"),
  );

  return passed;
}

// ==================== FILTER ====================
function filterCourses() {
  const level = document.getElementById("levelFilter").value;
  renderCourses(
    level ? allCourses.filter((c) => c.Level === level) : allCourses,
  );
}

// ==================== OPEN ENROLL MODAL ====================
function openEnrollModal(courseId) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    alert("Please login first");
    location.href = "/views/login.html";
    return;
  }

  const course = allCourses.find(
    (c) => Number(c.CourseID) === Number(courseId),
  );
  if (!course) return;

  // สร้าง Modal
  const modalHTML = `
    <div class="custom-modal-overlay" id="enroll-confirm-modal">
      <div class="custom-modal">
        <div class="custom-modal-icon warning">?</div>
        <h3>Confirm Enrollment</h3>
        <p>Do you want to enroll in this course?</p>

        <div class="enroll-summary">
          ${course.ImageURL ? `<img src="${course.ImageURL}" class="enroll-summary-image" alt="${course.Title}">` : ""}
          <p><strong>Course:</strong> ${course.Title}</p>
          <p><strong>Level:</strong> ${course.Level}</p>
          <p><strong>Duration:</strong> ${course.DurationHours} hours</p>
          <hr style="margin: 12px 0; border: none; border-top: 1px dashed var(--pink-main);">
          <p><strong>Fee:</strong> <span style="color: var(--pink-deep); font-weight: 700;">฿${Number(course.StandardFee || 0).toLocaleString()}</span></p>
        </div>

        <div class="custom-modal-actions">
          <button class="btn-secondary" onclick="closeEnrollModal()">Cancel</button>
          <button class="btn-primary" onclick="confirmEnroll(${course.CourseID})">Confirm Enroll</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const modal = document.getElementById("enroll-confirm-modal");
  setTimeout(() => modal.classList.add("active"), 10);
}

// ==================== CLOSE ENROLL MODAL ====================
function closeEnrollModal() {
  const modal = document.getElementById("enroll-confirm-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  }
}

// ==================== CONFIRM ENROLL ====================
// ==================== CONFIRM ENROLL ====================
async function confirmEnroll(courseId) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return;

  const course = allCourses.find(
    (c) => Number(c.CourseID) === Number(courseId),
  );
  if (!course) return;

  // ✅ ตรวจสอบ Prerequisite
  if (!checkPrerequisite(courseId)) {
    closeEnrollModal();
    const prereq = getPrerequisite(courseId);
    alert(
      `❌ Cannot enroll in "${course.Title}"\n\nPrerequisite: "${prereq.Title}"\nPlease complete it first.`,
    );
    return;
  }

  closeEnrollModal();

  // ✅ เรียก API
  try {
    const memberId = user.MemberID || user.id;

    await SheSparksAPI.post("/courses/enroll", {
      MemberID: Number(memberId),
      CourseID: Number(courseId),
      EnrollmentDate: new Date().toISOString().split("T")[0],
      PaymentStatus: "Pending",
    });

    // ✅ สำเร็จ
    await loadUserEnrollments(user);
    renderCourses(allCourses);
    showSuccessModal(course);
  } catch (error) {
    alert(`ลงทะเบียนไม่สำเร็จ: ${error.message}`);
  }
}

// ==================== LOAD USER ENROLLMENTS FROM API ====================
async function loadUserEnrollments(user) {
  try {
    const memberId = user.MemberID || user.id;
    const enrollments = await SheSparksAPI.get(`/courses/member/${memberId}`);
    userEnrollments = enrollments || [];
  } catch (error) {
    console.warn("Cannot load enrollments:", error.message);
    userEnrollments = [];
  }
}

// ==================== SUCCESS MODAL ====================
function showSuccessModal(course) {
  const modalHTML = `
    <div class="custom-modal-overlay" id="enroll-success-modal">
      <div class="custom-modal">
        <div class="custom-modal-icon success">✓</div>
        <h3>Enrolled Successfully!</h3>
        <p>You have enrolled in:</p>
        <div class="enroll-summary">
          <p><strong>Course:</strong> ${course.Title}</p>
          <p><strong>Level:</strong> ${course.Level}</p>
          <p><strong>Date:</strong> ${new Date().toISOString().split("T")[0]}</p>
        </div>
        <div class="custom-modal-actions">
          <button class="btn-primary" onclick="closeSuccessAndReload()">View My Courses</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const modal = document.getElementById("enroll-success-modal");
  setTimeout(() => modal.classList.add("active"), 10);
}

function closeSuccessAndReload() {
  const modal = document.getElementById("enroll-success-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.remove();
      // Re-render เพื่อแสดงสถานะ Enrolled
      renderCourses(allCourses);
    }, 300);
  }
}

// ==================== HELPERS ====================
function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}
