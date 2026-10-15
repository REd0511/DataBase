/* ============================================
   course.js - Course Page (API Connected)
   ============================================ */

let allCourses = [];
let userEnrollments = [];

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("course-list");
  if(container) container.innerHTML = "<p style='text-align:center; width:100%; color:var(--text-mid);'>กำลังโหลดข้อมูลคอร์สเรียน...</p>";

  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user && user.role === "member") {
    await loadUserEnrollments(user);
  }

  try {
    const apiCourses = await SheSparksAPI.courses();
    allCourses = apiCourses || [];
    renderCourses(allCourses);
  } catch (error) {
    console.error("Course API error:", error);
    if(container) container.innerHTML = `<p style="color:var(--danger); text-align:center; width:100%;">ไม่สามารถโหลดข้อมูลคอร์สได้: ${error.message}</p>`;
  }
});

function renderCourses(courses) {
  const container = document.getElementById("course-list");
  if (!container) return;

  if (!courses || courses.length === 0) {
    container.innerHTML = '<p style="text-align:center;grid-column:1/-1;color:var(--text-mid);">ไม่มีคอร์สเรียนเปิดสอนในขณะนี้</p>';
    return;
  }

  container.innerHTML = courses.map((c) => {
    const isEnrolled = userEnrollments.some((e) => Number(e.CourseID) === Number(c.CourseID));
    const prereq = getPrerequisite(c.PrerequisiteCourseID);
    const prereqMet = checkPrerequisite(c.PrerequisiteCourseID);

    let buttonHTML = "";
    if (isEnrolled) {
      buttonHTML = `<button class="btn-primary enrolled" disabled>✓ Enrolled</button>`;
    } else if (!prereqMet) {
      buttonHTML = `<button class="btn-primary locked" style="background:var(--border); color:var(--text-mid); cursor:not-allowed;" disabled>🔒 Prerequisite Required</button>`;
    } else {
      buttonHTML = `<button class="btn-primary" onclick="openEnrollModal(${Number(c.CourseID)})">Enroll Now</button>`;
    }

    const prereqHTML = prereq
      ? `<p class="prerequisite ${prereqMet ? "met" : "not-met"}" style="font-size:0.8rem; padding:6px 10px; border-radius:8px; display:inline-block; margin-bottom:12px; ${prereqMet ? 'background:#e8f5e9; color:#4caf50;' : 'background:#ffebee; color:#f44336;'}">
         ${prereqMet ? "✓" : "🔒"} Prerequisite: ${escapeHTML(prereq.Title)}
       </p>`
      : "";

    return `
      <div class="course-card ${isEnrolled ? "is-enrolled" : ""} ${!prereqMet && !isEnrolled ? "is-locked" : ""}">
        ${c.ImageURL ? `<img src="${c.ImageURL}" class="course-image" alt="${escapeHTML(c.Title)}" onerror="this.style.display='none'">` : ""}
        <span class="level" data-level="${escapeHTML(c.Level)}">${escapeHTML(c.Level)}</span>
        <h3>${escapeHTML(c.Title)}</h3>
        <p class="duration">⏱ ${escapeHTML(c.DurationHours)} hours</p>
        ${prereqHTML}
        <p class="fee" style="margin-top:auto;">฿${Number(c.StandardFee || 0).toLocaleString()}</p>
        ${buttonHTML}
      </div>
    `;
  }).join("");
}

function getPrerequisite(prerequisiteCourseID) {
  if (!prerequisiteCourseID) return null;
  return allCourses.find((c) => Number(c.CourseID) === Number(prerequisiteCourseID)) || null;
}

function checkPrerequisite(prerequisiteCourseID) {
  if (!prerequisiteCourseID) return true;
  return userEnrollments.some((e) => Number(e.CourseID) === Number(prerequisiteCourseID));
}

function filterCourses() {
  const level = document.getElementById("levelFilter").value;
  renderCourses(level ? allCourses.filter((c) => c.Level === level) : allCourses);
}

function openEnrollModal(courseId) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    alert("Please login first");
    location.href = "/views/login.html";
    return;
  }

  const course = allCourses.find((c) => Number(c.CourseID) === Number(courseId));
  if (!course) return;

  const pointsPreview = Math.floor(Number(course.StandardFee || 0));

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
          <p style="color: var(--pink-deep); font-weight: 600;">🎉 You will earn ${pointsPreview} points</p>
        </div>
        <div class="custom-modal-actions">
          <button class="btn-secondary" onclick="closeEnrollModal()">Cancel</button>
          <button class="btn-primary" onclick="confirmEnroll(${course.CourseID})">Confirm & Pay</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const modal = document.getElementById("enroll-confirm-modal");
  setTimeout(() => modal.classList.add("active"), 10);
}

function closeEnrollModal() {
  const modal = document.getElementById("enroll-confirm-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  }
}

async function confirmEnroll(courseId) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return;

  closeEnrollModal();

  try {
    const memberId = user.MemberID || user.id;
    const result = await SheSparksAPI.post("/courses/enroll", {
      MemberID: Number(memberId),
      CourseID: Number(courseId),
      EnrollmentDate: new Date().toISOString().split("T")[0],
      PaymentStatus: "PAID",   // ✅ จ่ายเงินทันที → ได้แต้ม
    });

    await loadUserEnrollments(user);
    renderCourses(allCourses);
    showSuccessModal(result.PointsEarned || 0);
  } catch (error) {
    alert(`ลงทะเบียนไม่สำเร็จ: ${error.message}`);
  }
}

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

function showSuccessModal(pointsEarned) {
  const modalHTML = `
    <div class="custom-modal-overlay" id="enroll-success-modal">
      <div class="custom-modal">
        <div class="custom-modal-icon success">✓</div>
        <h3>Enrolled Successfully!</h3>
        <p>You have successfully enrolled in the course.</p>
        ${pointsEarned > 0 ? `
          <p style="color: var(--pink-deep); font-weight: 700; font-size: 1.15rem; margin-top: 12px;">
            🎉 +${pointsEarned} points earned!
          </p>
        ` : ""}
        <div class="custom-modal-actions">
          <button class="btn-primary" onclick="closeSuccessAndReload()">OK</button>
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
      renderCourses(allCourses);
    }, 300);
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g,(c) =>({"&": "&amp;","<": "&lt;",">": "&gt;",'"': "&quot;","'": "&#39;"})[c]);
}