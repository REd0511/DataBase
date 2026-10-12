/* Course page connected to the live Backend API (no mock data). */
let allCourses = [];

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('course-list');
  container.innerHTML = '<p>Loading courses from database...</p>';
  try {
    if (!window.SheSparksAPI) throw new Error('API client is not loaded.');
    allCourses = await SheSparksAPI.courses();
    renderCourses(allCourses);
  } catch (error) {
    container.innerHTML = `<p class="api-error">โหลดคอร์สไม่สำเร็จ: ${escapeHTML(error.message)}<br>ตรวจว่า Backend และ MySQL ทำงานอยู่</p>`;
  }
});

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderCourses(courses) {
  const container = document.getElementById('course-list');
  if (!container) return;
  if (!courses.length) {
    container.innerHTML = '<p>No courses found in the database.</p>';
    return;
  }
  container.innerHTML = courses.map(c => `
    <div class="course-card">
      <span class="level" data-level="${escapeHTML(c.Level)}">${escapeHTML(c.Level)}</span>
      <h3>${escapeHTML(c.Title)}</h3>
      <p>Sport: ${escapeHTML(c.SportName || '-')}</p>
      <p class="duration">⏱ ${escapeHTML(c.DurationHours)} hours</p>
      <p class="fee">฿${Number(c.StandardFee || 0).toLocaleString()}</p>
      <button class="btn-primary" onclick="enrollCourse(${Number(c.CourseID)})">Enroll Now</button>
    </div>`).join('');
}

function filterCourses() {
  const level = document.getElementById('levelFilter').value;
  renderCourses(level ? allCourses.filter(c => c.Level === level) : allCourses);
}

async function enrollCourse(courseId) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) {
    alert('Please login first');
    location.href = '/views/login.html';
    return;
  }
  const memberId = user.MemberID || user.memberId || user.id;
  if (!memberId || user.role !== 'member') {
    alert('กรุณาเข้าสู่ระบบด้วยบัญชีสมาชิกที่มี MemberID จากฐานข้อมูลก่อนลงทะเบียน');
    return;
  }
  const course = allCourses.find(c => Number(c.CourseID) === Number(courseId));
  if (!course || !confirm(`Enroll in "${course.Title}" for ฿${Number(course.StandardFee || 0).toLocaleString()}?`)) return;
  try {
    const result = await SheSparksAPI.enrollCourse({
      MemberID: Number(memberId),
      CourseID: Number(courseId),
      EnrollmentDate: new Date().toISOString().slice(0, 10),
      PaymentStatus: 'Pending'
    });
    alert(result.message || 'ลงทะเบียนสำเร็จ');
  } catch (error) {
    alert(`ลงทะเบียนไม่สำเร็จ: ${error.message}`);
  }
}
