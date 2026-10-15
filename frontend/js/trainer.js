/* ============================================
   trainer.js - Trainer Selection (API Connected)
   ============================================ */

let dbAvailableTrainers = [];

document.addEventListener("DOMContentLoaded", async () => {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  if (!flow || !flow.sport || !flow.date) {
    alert("Please complete the booking flow first");
    window.location.href = "/views/booking.html";
    return;
  }

  const container = document.getElementById("trainer-list");
  if (container) container.innerHTML = "<p style='text-align:center; width:100%; color:var(--text-mid);'>กำลังค้นหาเทรนเนอร์ที่ว่าง...</p>";

  try {
    dbAvailableTrainers = await SheSparksAPI.availableTrainers(flow.date, flow.startTime, flow.endTime);
    renderTrainers(flow.sport.SportTypeID, flow.studio.StudioCode);
  } catch (error) {
    console.error("Failed to load trainers:", error);
    if (container) container.innerHTML = `<p style="color:var(--danger); text-align:center;">ระบบขัดข้อง: ไม่สามารถโหลดข้อมูลเทรนเนอร์ได้</p>`;
  }
});

function renderTrainers(sportTypeID, studioCode) {
  const container = document.getElementById("trainer-list");
  if (!container) return;

  const trainers = dbAvailableTrainers.filter(t => t.SportTypeID == sportTypeID && t.StudioCode == studioCode);

  // === กรณีไม่มีเทรนเนอร์ว่าง (Empty State) ===
  if (trainers.length === 0) {
    container.style.gridTemplateColumns = "1fr"; // บังคับให้แสดงคอลัมน์เดียวตรงกลาง
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius-md); border: 1px dashed var(--pink-main);">
        <h3 style="color: var(--pink-deep); margin-bottom: 12px; font-size: 1.4rem;">ไม่มีเทรนเนอร์ว่าง 😢</h3>
        <p style="color: var(--text-mid); margin-bottom: 24px;">
          ขออภัยค่ะ ไม่มีเทรนเนอร์คิวว่างสำหรับกีฬานี้ในช่วงเวลาที่คุณเลือก<br>
          คุณสามารถดำเนินการจองต่อโดยไม่ต้องใช้เทรนเนอร์ได้ค่ะ
        </p>
        <button class="btn-primary" onclick="goBack()">กลับไปหน้า Summary</button>
      </div>
    `;
    return;
  }

  // === กรณีมีเทรนเนอร์ ===
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(260px, 1fr))";
  container.innerHTML = trainers.map(t => `
    <div class="trainer-card">
      ${t.ImageURL ? `<img src="${t.ImageURL}" class="trainer-image" alt="${t.Name}" onerror="this.style.display='none'">` : ""}
      <div class="avatar">${t.Name.split(" ")[1]?.[0] || "T"}</div>
      <h3>${t.Name}</h3>
      <span class="specialty">${t.SportName || "Trainer"}</span>
      <p>${t.Phone}</p>
      <button class="btn-primary" style="width:100%; margin-top:12px;" onclick="selectTrainer(${t.TrainerID})">Select</button>
    </div>
  `).join("");
}

function selectTrainer(id) {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  flow.trainer = dbAvailableTrainers.find(t => t.TrainerID == id);
  localStorage.setItem("bookingFlow", JSON.stringify(flow));
  window.location.href = "/views/summary.html";
}

function goBack() {
  const flow = JSON.parse(localStorage.getItem("bookingFlow"));
  if (flow) {
    flow.wantTrainer = null; // เคลียร์สถานะเพื่อให้ระบบถามใหม่
    localStorage.setItem("bookingFlow", JSON.stringify(flow));
  }
  window.location.href = "/views/summary.html";
}