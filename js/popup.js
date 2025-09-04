/* =========================
   POPUP & OVERLAY
   ========================= */

export function initPopup() {
  const overlay = document.getElementById('overlay');
  const loginBtn = document.getElementById('loginBtn');
  const closeRole = document.getElementById('closeRole');
  const closeCustomer = document.getElementById('closeCustomer');
  const closeMap = document.getElementById('closeMap');

  const roleBox = document.getElementById('roleBox');
  const customerBox = document.getElementById('customerBox');
  const mapBox = document.getElementById('mapBox');

  const roleCustomerBtn = document.getElementById('roleCustomer');
  const roleExpertBtn = document.getElementById('roleExpert');

  // Mở overlay
  function openOverlay() {
    overlay.classList.add('active');
    document.body.classList.add('popup-active');
    loginBtn.setAttribute('aria-expanded', 'true');
    showRoleDialog();
    document.addEventListener('keydown', handleKeydown);
  }

  // Đóng overlay
  function closeOverlay() {
    overlay.classList.remove('active');
    document.body.classList.remove('popup-active');
    loginBtn.setAttribute('aria-expanded', 'false');
    loginBtn.focus();
    document.removeEventListener('keydown', handleKeydown);
    roleBox.hidden = true;
    customerBox.hidden = true;
    mapBox.hidden = true;
  }

  // Trap focus trong dialog
  function handleKeydown(e) {
    if (e.key === 'Escape') { closeOverlay(); return; }
    if (e.key !== 'Tab') return;
    const scope = !roleBox.hidden ? roleBox : (!customerBox.hidden ? customerBox : mapBox);
    const selectors = 'a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(scope.querySelectorAll(selectors)).filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  // Hiển thị từng dialog
  function showRoleDialog() {
    roleBox.hidden = false; customerBox.hidden = true; mapBox.hidden = true;
    setTimeout(() => roleCustomerBtn.focus(), 0);
  }
  function showCustomerDialog() {
    roleBox.hidden = true; customerBox.hidden = false; mapBox.hidden = true;
    setTimeout(() => document.getElementById('cusName').focus(), 0);
  }
  function showMapDialog() {
    roleBox.hidden = true; customerBox.hidden = true; mapBox.hidden = false;
    setTimeout(() => document.getElementById('mapTitle').focus?.(), 0);
  }

  // Gán sự kiện
  loginBtn.addEventListener('click', openOverlay);
  closeRole.addEventListener('click', closeOverlay);
  closeCustomer.addEventListener('click', closeOverlay);
  closeMap.addEventListener('click', () => { showCustomerDialog(); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });

  roleCustomerBtn.addEventListener('click', showCustomerDialog);
  roleExpertBtn.addEventListener('click', () => { window.location.href = 'dang-nhap.html'; });

  // Xuất hàm để module khác có thể dùng
  return { openOverlay, closeOverlay, showCustomerDialog, showMapDialog };
}
