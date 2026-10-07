const esc3 = (s) =>
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
  load();
});
async function load() {
  try {
    const r = await fetch("/api/reports/course-performance").then((x) =>
      x.json(),
    );
    if (r.error || r.message) throw new Error(r.error || r.message);
    document.querySelector("#courses tbody").innerHTML = r.courses
      .map(
        (c, i) =>
          `<tr><td>${i + 1}</td><td>${esc3(c.Title)}</td><td>${esc3(c.Level)}</td><td>${c.Enrollments}</td><td>฿${Number(c.Revenue || 0).toLocaleString()}</td></tr>`,
      )
      .join("");
    new Chart(document.getElementById("courseRevenueChart"), {
      type: "bar",
      data: {
        labels: r.monthly.map((x) => x.Month),
        datasets: [
          {
            label: "Course Revenue (THB)",
            data: r.monthly.map((x) => Number(x.Revenue)),
          },
        ],
      },
      options: { responsive: true },
    });
  } catch (e) {
    document
      .querySelector("main")
      .insertAdjacentHTML(
        "beforeend",
        `<p class="api-error">${esc3(e.message)}</p>`,
      );
  }
}
