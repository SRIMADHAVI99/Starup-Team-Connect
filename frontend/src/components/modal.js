/**
 * CustomModal Component (Vanilla JS)
 * Replaces native browser alert() with an accessible, high-contrast modal dialog.
 */
let currentModalCallback = null;

export function showModal(title, message, type = 'info', confirmText = 'OK', onConfirm = null) {
  let modalOverlay = document.getElementById('custom-modal-overlay');

  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'custom-modal-overlay';
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;
    document.body.appendChild(modalOverlay);

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.style.display !== 'none') {
        closeModal();
      }
    });
  }

  currentModalCallback = onConfirm;

  const iconMap = {
    warning: '⚠️',
    error: '❌',
    success: '✓',
    info: 'ℹ️'
  };

  const colorMap = {
    warning: '#F59E0B',
    error: '#DC2626',
    success: '#16A34A',
    info: '#2563EB'
  };

  modalOverlay.innerHTML = `
    <div 
      class="custom-modal-content"
      style="
        background: #FFFFFF;
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        max-width: 440px;
        width: 100%;
        padding: 28px;
        text-align: center;
        animation: fadeInUp 0.2s ease-out;
      "
    >
      <div style="font-size: 2.5rem; margin-bottom: 12px; color: ${colorMap[type] || colorMap.info}">
        ${iconMap[type] || 'ℹ️'}
      </div>
      <h3 style="font-size: 1.25rem; font-weight: 800; color: #1E1B4B; margin-bottom: 8px;">
        ${title}
      </h3>
      <p style="font-size: 0.95rem; color: #64748B; line-height: 1.5; margin-bottom: 24px;">
        ${message}
      </p>
      <button 
        id="modal-confirm-btn"
        class="btn btn-primary btn-full"
        style="padding: 10px 20px; font-weight: 600; font-size: 0.95rem;"
      >
        ${confirmText}
      </button>
    </div>
  `;

  modalOverlay.style.display = 'flex';

  const confirmBtn = document.getElementById('modal-confirm-btn');
  if (confirmBtn) {
    confirmBtn.focus();
    confirmBtn.onclick = () => {
      closeModal();
      if (typeof currentModalCallback === 'function') {
        currentModalCallback();
      }
    };
  }
}

export function closeModal() {
  const modalOverlay = document.getElementById('custom-modal-overlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'none';
    modalOverlay.innerHTML = '';
  }
  currentModalCallback = null;
}
