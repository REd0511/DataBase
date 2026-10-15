/* ============================================
   trainer-dashboard.js - Trainer Dashboard (API Connected)
   ============================================ */

let currentTrainerId = null;

let dbTrainers = [];
let dbStudios = [];
let dbCourses = [];
let dbBookings = [];

window.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  // ตรวจสอบสิทธิ์
  if (!user || (user.role !== "trainer" && user.role !== "admin")) {
    alert("Please login as Trainer or Admin");
    window.location.href = "/views/login.html";
    return;
  }

  try {
    const api = window.SheSparksAPI;

    // โหลดข้อมูลจาก API รวดเดียว
    [dbTrainers, dbStudios, dbCourses, dbBookings] = await Promise.all([
      api.trainers(),
      api.studios(),
      api.courses(),
      api.bookings()
    ]);

    populateTrainerSwitcher();

    if (user.role === "trainer") {
      currentTrainerId = user.trainerId || dbTrainers[0]?.TrainerID;
    } else {
      currentTrainerId = dbTrainers[0]?.TrainerID;
    }

    document.getElementById("trainerSwitcher").value = currentTrainerId;
    loadTrainerDashboard(currentTrainerId);

  } catch (error) {
    console.error("Failed to load trainer dashboard:", error);
    alert("ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่");
  }
});

function populateTrainerSwitcher() {
  const select = document.getElementById("trainerSwitcher");
  if (!select) return;
  select.innerHTML = dbTrainers.map((t) => `<option value="${t.TrainerID}">${t.Name} (${t.SportName || "Trainer"})</option>`).join("");
}

function switchTrainer(trainerId) {
  currentTrainerId = parseInt(trainerId);
  loadTrainerDashboard(currentTrainerId);
}

function loadTrainerDashboard(trainerId) {
  const trainer = dbTrainers.find((t) => Number(t.TrainerID) === Number(trainerId));
  if (!trainer) return;

  const studio = dbStudios.find((s) => s.StudioCode === trainer.StudioCode);

  // ==================== PROFILE ====================
  document.getElementById("profile-avatar").textContent = trainer.Name.split(" ")[1]?.[0] || trainer.Name.charAt(0);
  document.getElementById("trainer-name").textContent = trainer.Name;
  document.getElementById("trainer-sport").textContent = `🏋️ ${trainer.SportName || "-"}`;
  document.getElementById("trainer-studio").textContent = `📍 ${studio?.Name || "-"} (${studio?.Location || "-"})`;
  document.getElementById("trainer-qual").textContent = `🎓 ${trainer.Qualification || "Certified Trainer"}`;

  // ==================== FILTER BOOKINGS ====================
  // ค้นหา Booking ที่มีชื่อเทรนเนอร์คนนี้
  const trainerBookings = dbBookings.filter(b => b.TrainerName && b.TrainerName.includes(trainer.Name));
  const trainerCourses = dbCourses.filter(c => Number(c.TrainerID) === Number(trainerId));

  // คัดเฉพาะตารางสอนที่เป็นของวันนี้หรืออนาคต
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingSessions = trainerBookings.filter(b => {
    const d = new Date(b.BookingDate);
    const bDate = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
    return bDate >= todayStr && b.Status !== "Cancelled";
  });

  // ==================== SUMMARY CARDS ====================
  document.getElementById("upcomingCount").textContent = upcomingSessions.length;
  document.getElementById("courseCount").textContent = trainerCourses.length;
  document.getElementById("studentCount").textContent = upcomingSessions.length;

  renderSessions(upcomingSessions);
  renderCourses(trainerCourses);
  renderStudents(upcomingSessions);
}

// ==================== RENDERERS ====================
function renderSessions(sessions) {
  const tbody = document.querySelector("#sessionsTable tbody");
  if (!tbody) return;
  if (sessions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-mid);">No upcoming sessions.</td></tr>`;
    return;
  }
  tbody.innerHTML = sessions.map(b => {
    const d = new Date(b.BookingDate);
    const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
    const start = (b.StartTime || "").substring(0, 5);
    const end = (b.EndTime || "").substring(0, 5);
    return `
    <tr>
      <td>${dateStr}</td>
      <td>${start} - ${end}</td>
      <td>${b.RoomName || "-"}</td>
      <td>${b.SportName || "-"}</td>
      <td>${b.MemberName || "-"}</td>
    </tr>
  `}).join("");
}

function renderCourses(courses) {
  const container = document.getElementById("trainerCourses");
  if (!container) return;
  if (courses.length === 0) {
    container.innerHTML = `<p style="color:var(--text-mid);">No courses assigned.</p>`;
    return;
  }
  container.innerHTML = courses.map(c => `
    <div class="course-card">
      <h3>${c.Title}</h3>
      <p>Level: ${c.Level}</p>
      <p>Duration: ${c.DurationHours} hours</p>
      <p class="fee">฿${Number(c.StandardFee).toLocaleString()}</p>
    </div>
  `).join("");
}

function renderStudents(sessions) {
  const tbody = document.querySelector("#studentsTable tbody");
  if (!tbody) return;
  if (sessions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--text-mid);">No students.</td></tr>`;
    return;
  }
  tbody.innerHTML = sessions.map(b => {
    const d = new Date(b.BookingDate);
    const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
    return `
    <tr>
      <td>${b.MemberName || "-"}</td>
      <td>${b.SportName || "-"}</td>
      <td>${dateStr}</td>
      <td><span class="condition-badge ${b.Status === "Cancelled" ? "cancelled" : "confirmed"}">${b.Status || "Confirmed"}</span></td>
    </tr>
  `}).join("");
}