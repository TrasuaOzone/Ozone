/* =========================
   UI CHUNG
   ========================= */

export const locHelp = document.getElementById('locHelp');

/**
 * Cập nhật link "vị trí của bạn" trong form và hồ sơ
 */
export function updateInlineMapLinks(coords) {
  const link = document.getElementById('viewMapLink');
  if (link && coords) {
    const href = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
    link.href = href;
    link.setAttribute('aria-disabled', 'false');
  }
  const profileLink = document.getElementById('basicMap');
  if (profileLink && coords) {
    const href = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
    profileLink.href = href;
    profileLink.style.display = '';
  }
}

/**
 * Bật/tắt trạng thái nút "Lấy địa chỉ hiện tại"
 */
export function setGetLocationButtonState(hasCoords) {
  const btn = document.getElementById('getLocationBtn');
  if (!btn) return;
  btn.textContent = hasCoords ? '📍 Cập nhật lại địa chỉ' : '📍 Lấy địa chỉ hiện tại';
  btn.disabled = false;
}

/**
 * Render hồ sơ khách hàng dưới header
 */
export function renderBasicCustomerInfo({ name, phone, location, mapUrl }) {
  let box = document.getElementById('customerBasic');
  if (!box) {
    box = document.createElement('section');
    box.id = 'customerBasic';
    box.innerHTML = `
      <div class="session-banner" id="sessionBanner">
        <strong>Cảnh báo:</strong> <span id="sessionBannerMsg"></span>
      </div>
      <h2>Hồ sơ của bạn</h2>
      <div class="card">
        <p><strong>Tên:</strong> <span id="basicName"></span></p>
        <p><strong>SĐT:</strong> <span id="basicPhone"></span></p>
        <p><strong>Địa chỉ:</strong> 
          <span id="basicLoc"></span>
          <a id="basicMap" target="_blank" rel="noopener">vị trí của bạn</a>
        </p>
        <div class="location-actions" style="margin-top:8px;">
          <button type="button" id="btnLogout" class="btn-secondary">🚪 Đăng xuất</button>
        </div>
      </div>
    `;
    const main = document.getElementById('main-content');
    const afterHeader = document.querySelector('header').nextElementSibling;
    main.insertBefore(box, afterHeader || main.firstChild);
  }
  document.getElementById('basicName').textContent = name || '';
  document.getElementById('basicPhone').textContent = phone || '';
  document.getElementById('basicLoc').textContent = location || '';

  const map = document.getElementById('basicMap');
  if (mapUrl) {
    map.href = mapUrl;
    map.style.display = '';
  } else if (location) {
    map.href = `https://maps.google.com/?q=${encodeURIComponent(location)}`;
    map.style.display = '';
  } else {
    map.href = '#';
    map.style.display = 'none';
  }
}

/**
 * Xóa hồ sơ khách hàng khỏi UI
 */
export function removeBasicCustomerInfo() {
  const box = document.getElementById('customerBasic');
  if (box && box.parentNode) box.parentNode.removeChild(box);
}

/**
 * Hiển thị hoặc ẩn banner cảnh báo session
 */
export function showSessionBannerUI(message) {
  const banner = document.getElementById('sessionBanner');
  const msg = document.getElementById('sessionBannerMsg');
  if (!banner || !msg) return;
  if (!message) { banner.style.display = 'none'; msg.textContent = ''; return; }
  msg.textContent = message;
  banner.style.display = 'block';
}
