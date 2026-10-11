/* ============================================
   modal.js - Custom Modal Helper
   ============================================ */

function showModal(options) {
  const {
    type = "success",
    title = "Success",
    message = "",
    buttonText = "OK",
    onClose = null,
    redirectTo = null,
    autoClose = null,
  } = options;

  // ลบ Modal เก่า
  const existing = document.getElementById("custom-modal");
  if (existing) existing.remove();

  // Icon
  const icons = {
    success: "✓",
    error: "✕",
    warning: "!",
  };

  // สร้าง Modal
  const modalHTML = `
    <div class="custom-modal-overlay" id="custom-modal">
      <div class="custom-modal">
        <div class="custom-modal-icon ${type}">${icons[type] || "✓"}</div>
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="custom-modal-actions">
          <button class="btn-primary" id="custom-modal-btn">${buttonText}</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const modal = document.getElementById("custom-modal");
  const btn = document.getElementById("custom-modal-btn");

  // เปิด Modal
  setTimeout(() => modal.classList.add("active"), 10);

  // ปุ่ม OK
  const closeModal = () => {
    modal.classList.remove("active");
    setTimeout(() => {
      modal.remove();
      if (onClose) onClose();
      if (redirectTo) window.location.href = redirectTo;
    }, 300);
  };

  btn.addEventListener("click", closeModal);

  // Auto Close
  if (autoClose) {
    setTimeout(closeModal, autoClose);
  }
}