const esc = (s) =>
  String(s ?? "").replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
document.addEventListener("DOMContentLoaded", () => {
  const u = JSON.parse(localStorage.getItem("user") || "null");
  if (!u || u.role !== "admin") {
    alert("Please login as Admin");
    location.href = "/views/login.html";
    return;
  }
  document.getElementById("date").value = new Date().toISOString().slice(0, 10);
  document.getElementById("search").onclick = search;
  search();
});
async function search() {
  const date = document.getElementById("date").value,
    start = document.getElementById("start").value,
    end = document.getElementById("end").value;
  if (end <= start) {
    alert("End time must be after Start time");
    return;
  }
  const box = document.getElementById("results");
  box.innerHTML = "<p>Loading...</p>";
  try {
    const r = await fetch(
      `/api/reports/availability?date=${date}&start=${start}&end=${end}`,
    ).then((x) => x.json());
    if (r.error || r.message) throw new Error(r.error || r.message);
    box.innerHTML = `<h3>Rooms (${r.rooms.length})</h3><div class="room-list">${r.rooms.map((x) => `<div class="room-card"><h3>${esc(x.RoomName)}</h3><p>Capacity: ${x.Capacity}</p><p>Studio: ${esc(x.Location)}</p><p>Sport: ${esc(x.SportTypes || "-")}</p></div>`).join("") || "<p>No rooms available.</p>"}</div><h3>Equipment (${r.equipment.length})</h3><div class="room-list">${r.equipment.map((x) => `<div class="room-card"><h3>${esc(x.Name)}</h3><p>Condition: ${esc(x.Condition)}</p><p>Sport: ${esc(x.SportName || "-")}</p></div>`).join("") || "<p>No equipment available.</p>"}</div><h3>Trainers (${r.trainers.length})</h3><div class="room-list">${r.trainers.map((x) => `<div class="room-card"><h3>${esc(x.Name)}</h3><p>Sport: ${esc(x.SportName)}</p><p>Studio: ${esc(x.Location)}</p></div>`).join("") || "<p>No trainers available.</p>"}</div>`;
  } catch (e) {
    box.innerHTML = `<p class="api-error">${esc(e.message)}</p>`;
  }
}
