/* ============================================
   trainer-dashboard.js - Trainer Dashboard
   FEATURES:
   - View Switcher (Dropdown) — สลับ Trainer ได้
   - Profile ของ Trainer ที่เลือก
   - Upcoming Sessions จาก localStorage.bookings
   - Fallback Mock ถ้าไม่มีข้อมูล
   ============================================ */

// ==================== MOCK DATA (Fallback) ====================
const MOCK_SESSIONS = [];
const MOCK_TRAINER_COURSES = [
  {
    CourseID: 1,
    Title: "Basic Yoga",
    Level: "Beginner",
    DurationHours: 10,
    StandardFee: 1500,
  },
  {
    CourseID: 2,
    Title: "Advanced Yoga",
    Level: "Advanced",
    DurationHours: 15,
    StandardFee: 2500,
  },
];
const MOCK_STUDENTS = [];
const MOCK_DEPENDENTS = [
  { Name: "Yoga Mat Pro", Relationship: "Equipment", Age: "2 years" },
  { Name: "Assistant Kwan", Relationship: "Assistant", Age: "25" },
];

// ==================== STATE ====================
let currentTrainerId = null;

// ==================== INIT ====================
window.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  // ตรวจสอบสิทธิ์: Admin หรือ Trainer
  if (!user || (user.role !== "trainer" && user.role !== "admin")) {
    alert("Please login as Trainer or Admin");
    window.location.href = "/views/login.html";
    return;
  }

  // สร้าง Dropdown สำหรับสลับ Trainer
  populateTrainerSwitcher();

  // ถ้า Login เป็น Trainer → ใช้ TrainerID ของตัวเอง
  // ถ้า Login เป็น Admin → ใช้ Trainer คนแรก
  if (user.role === "trainer") {
    currentTrainerId = user.trainerId;
  } else {
    currentTrainerId = TRAINERS[0].TrainerID;
  }

  // ตั้งค่า Dropdown
  document.getElementById("trainerSwitcher").value = currentTrainerId;

  // โหลด Dashboard
  loadTrainerDashboard(currentTrainerId);
});

// ==================== POPULATE SWITCHER ====================
function populateTrainerSwitcher() {
  const select = document.getElementById("trainerSwitcher");
  if (!select) return;

  select.innerHTML = TRAINERS.map((t) => {
    const sport = getSportName(t.SportTypeID);
    return `<option value="${t.TrainerID}">${t.Name} (${sport})</option>`;
  }).join("");
}

// ==================== SWITCH TRAINER ====================
function switchTrainer(trainerId) {
  currentTrainerId = parseInt(trainerId);
  loadTrainerDashboard(currentTrainerId);
}

// ==================== LOAD DASHBOARD ====================
function loadTrainerDashboard(trainerId) {
  const trainer = TRAINERS.find((t) => t.TrainerID === trainerId);
  if (!trainer) {
    alert("Trainer not found");
    return;
  }

  const studio = STUDIOS.find((s) => s.StudioCode === trainer.StudioCode);
  const sportName = getSportName(trainer.SportTypeID);

  // ==================== PROFILE ====================
  document.getElementById("profile-avatar").textContent =
    trainer.Name.charAt(0);
  document.getElementById("trainer-name").textContent = trainer.Name;
  document.getElementById("trainer-sport").textContent =
    `🏋️ ${sportName || "-"}`;
  document.getElementById("trainer-studio").textContent =
    `📍 ${studio?.Name || "-"} (${studio?.Location || "-"})`;
  document.getElementById("trainer-qual").textContent =
    `🎓 ${trainer.Qualification || "-"}`;

  // ==================== LOAD SESSIONS FROM localStorage ====================
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const trainerBookings = bookings.filter((b) => b.TrainerID === trainerId);

  // ==================== SUMMARY CARDS ====================
  document.getElementById("upcomingCount").textContent =
    trainerBookings.length || MOCK_SESSIONS.length;
  document.getElementById("courseCount").textContent =
    MOCK_TRAINER_COURSES.length;
  document.getElementById("studentCount").textContent =
    trainerBookings.length || MOCK_STUDENTS.length;
  document.getElementById("dependentCount").textContent =
    MOCK_DEPENDENTS.length;

  // ==================== UPCOMING SESSIONS ====================
  renderSessions(trainerBookings);

  // ==================== MY COURSES ====================
  renderCourses();

  // ==================== MY STUDENTS ====================
  renderStudents(trainerBookings);

  // ==================== DEPENDENTS ====================
  renderDependents();
}

// ==================== RENDER SESSIONS ====================
function renderSessions(trainerBookings) {
  const tbody = document.querySelector("#sessionsTable tbody");
  if (!tbody) return;

  if (trainerBookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-mid);">No sessions yet — waiting for bookings.</td></tr>`;
    return;
  }

  tbody.innerHTML = trainerBookings
    .map(
      (b) => `
    <tr>
      <td>${b.Date}</td>
      <td>${b.StartTime} - ${b.EndTime}</td>
      <td>${b.RoomName}</td>
      <td>${b.SportName}</td>
      <td>${b.MemberName}</td>
    </tr>
  `,
    )
    .join("");
}

// ==================== RENDER COURSES ====================
function renderCourses() {
  const container = document.getElementById("trainerCourses");
  if (!container) return;

  container.innerHTML = MOCK_TRAINER_COURSES.map(
    (c) => `
    <div class="course-card">
      <h3>${c.Title}</h3>
      <p>Level: ${c.Level}</p>
      <p>Duration: ${c.DurationHours} hours</p>
      <p class="fee">฿${c.StandardFee.toLocaleString()}</p>
    </div>
  `,
  ).join("");
}

// ==================== RENDER STUDENTS ====================
function renderStudents(trainerBookings) {
  const tbody = document.querySelector("#studentsTable tbody");
  if (!tbody) return;

  if (trainerBookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-mid);">No students yet — waiting for bookings.</td></tr>`;
    return;
  }

  tbody.innerHTML = trainerBookings
    .map(
      (b) => `
    <tr>
      <td>${b.MemberName}</td>
      <td>${b.SportName}</td>
      <td>${b.Date}</td>
      <td class="earned">${b.Status || "Confirmed"}</td>
    </tr>
  `,
    )
    .join("");
}

// ==================== RENDER DEPENDENTS ====================
function renderDependents() {
  const container = document.getElementById("dependentsList");
  if (!container) return;

  container.innerHTML = MOCK_DEPENDENTS.map(
    (d) => `
    <div class="dependent-card">
      <div class="avatar">${d.Name.charAt(0)}</div>
      <h4>${d.Name}</h4>
      <p>${d.Relationship} • ${d.Age}</p>
    </div>
  `,
  ).join("");
}
