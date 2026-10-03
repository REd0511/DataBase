/* ============================================
   course.js - Course Page
   FEATURES:
   - ดึงรายการคอร์สจาก Mock Data
   - แสดงผลด้วยการ์ด
   - TODO: เชื่อมกับ API /api/courses
   ============================================ */

const MOCK_COURSES = [
    { CourseID: 1, Title: 'Basic Yoga', Level: 'Beginner', DurationHours: 10, StandardFee: 1500 },
    { CourseID: 2, Title: 'Advanced Yoga', Level: 'Advanced', DurationHours: 15, StandardFee: 2500 },
    { CourseID: 3, Title: 'Pilates Intro', Level: 'Beginner', DurationHours: 8, StandardFee: 1200 },
    { CourseID: 4, Title: 'Women Boxing', Level: 'Intermediate', DurationHours: 12, StandardFee: 2000 }
];

function renderCourses(courses) {
    const container = document.getElementById('course-list');
    if (!container) return;

    container.innerHTML = courses.map(c => `
        <div class="course-card">
            <h3>${c.Title}</h3>
            <p>Level: ${c.Level}</p>
            <p>Duration: ${c.DurationHours} hours</p>
            <p>Fee: ฿${c.StandardFee}</p>
            <button class="btn-primary" onclick="enrollCourse(${c.CourseID})">Enroll</button>
        </div>
    `).join('');
}

function enrollCourse(courseId) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }
    alert(`สมัครคอร์ส ${courseId} สำเร็จ (mock)`);
    // TODO: call API /api/enrollments
}

document.addEventListener('DOMContentLoaded', () => {
    renderCourses(MOCK_COURSES);
});