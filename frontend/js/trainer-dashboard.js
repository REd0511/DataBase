/* ============================================
   trainer-dashboard.js - Trainer Dashboard Logic
   FEATURES:
   - ตรวจสอบสิทธิ์ Trainer
   - แสดง Profile ของเทรนเนอร์
   - แสดง Upcoming Sessions (Mock)
   - แสดง My Courses (Mock)
   - แสดง My Students (Mock)
   - แสดง Dependents (Mock)
   ============================================ */

// ==================== MOCK DATA ====================
const MOCK_SESSIONS = [
    { Date: "2026-10-12", Time: "09:00 - 11:00", Room: "Yoga Room A", Sport: "Yoga", Member: "Member A" },
    { Date: "2026-10-12", Time: "14:00 - 16:00", Room: "Yoga Room E", Sport: "Yoga", Member: "Member B" },
    { Date: "2026-10-13", Time: "10:00 - 12:00", Room: "Yoga Room A", Sport: "Yoga", Member: "Member C" },
];

const MOCK_TRAINER_COURSES = [
    { CourseID: 1, Title: "Basic Yoga", Level: "Beginner", DurationHours: 10, StandardFee: 1500 },
    { CourseID: 2, Title: "Advanced Yoga", Level: "Advanced", DurationHours: 15, StandardFee: 2500 },
];

const MOCK_STUDENTS = [
    { Member: "Member A", Course: "Basic Yoga", EnrollmentDate: "2026-09-15", Status: "Paid" },
    { Member: "Member B", Course: "Basic Yoga", EnrollmentDate: "2026-09-20", Status: "Paid" },
    { Member: "Member C", Course: "Advanced Yoga", EnrollmentDate: "2026-10-01", Status: "Pending" },
];

const MOCK_DEPENDENTS = [
    { Name: "Yoga Mat Pro", Relationship: "Equipment", Age: "2 years" },
    { Name: "Assistant Kwan", Relationship: "Assistant", Age: "25" },
];

// ==================== CHECK TRAINER LOGIN ====================
window.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "trainer") {
        alert("Please login as Trainer");
        window.location.href = "/views/login.html";
        return;
    }

    loadTrainerDashboard(user);
});

// ==================== LOAD DASHBOARD ====================
function loadTrainerDashboard(user) {
    // ==================== PROFILE ====================
    const trainer = TRAINERS.find(t => t.TrainerID === user.trainerId);
    const studio = STUDIOS.find(s => s.StudioCode === user.studioCode);

    document.getElementById("profile-avatar").textContent = user.name.charAt(0);
    document.getElementById("trainer-name").textContent = user.name;
    document.getElementById("trainer-sport").textContent = `🏋️ ${trainer?.SportType || "-"}`;
    document.getElementById("trainer-studio").textContent = `📍 ${studio?.Name || "-"} (${studio?.Location || "-"})`;
    document.getElementById("trainer-qual").textContent = `🎓 ${trainer?.Qualification || "-"}`;

    // ==================== SUMMARY CARDS ====================
    document.getElementById("upcomingCount").textContent = MOCK_SESSIONS.length;
    document.getElementById("courseCount").textContent = MOCK_TRAINER_COURSES.length;
    document.getElementById("studentCount").textContent = MOCK_STUDENTS.length;
    document.getElementById("dependentCount").textContent = MOCK_DEPENDENTS.length;

    // ==================== UPCOMING SESSIONS ====================
    const sessionsTable = document.querySelector("#sessionsTable tbody");
    if (sessionsTable) {
        sessionsTable.innerHTML = MOCK_SESSIONS.map(s => `
      <tr>
        <td>${s.Date}</td>
        <td>${s.Time}</td>
        <td>${s.Room}</td>
        <td>${s.Sport}</td>
        <td>${s.Member}</td>
      </tr>
    `).join("");
    }

    // ==================== MY COURSES ====================
    const coursesContainer = document.getElementById("trainerCourses");
    if (coursesContainer) {
        coursesContainer.innerHTML = MOCK_TRAINER_COURSES.map(c => `
      <div class="course-card">
        <h3>${c.Title}</h3>
        <p>Level: ${c.Level}</p>
        <p>Duration: ${c.DurationHours} hours</p>
        <p class="fee">฿${c.StandardFee.toLocaleString()}</p>
      </div>
    `).join("");
    }

    // ==================== MY STUDENTS ====================
    const studentsTable = document.querySelector("#studentsTable tbody");
    if (studentsTable) {
        studentsTable.innerHTML = MOCK_STUDENTS.map(s => `
      <tr>
        <td>${s.Member}</td>
        <td>${s.Course}</td>
        <td>${s.EnrollmentDate}</td>
        <td class="${s.Status === "Paid" ? "earned" : "redeemed"}">${s.Status}</td>
      </tr>
    `).join("");
    }

    // ==================== DEPENDENTS ====================
    const dependentsContainer = document.getElementById("dependentsList");
    if (dependentsContainer) {
        dependentsContainer.innerHTML = MOCK_DEPENDENTS.map(d => `
      <div class="dependent-card">
        <div class="avatar">${d.Name.charAt(0)}</div>
        <h4>${d.Name}</h4>
        <p>${d.Relationship} • ${d.Age}</p>
      </div>
    `).join("");
    }
}