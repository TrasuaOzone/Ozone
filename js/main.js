/* =========================
   MAIN ENTRY
   ========================= */

import { initPopup } from './popup.js';
import { initAuth } from './auth.js';
import { initMapIfNeeded, handleGetLocation, confirmMapLocation } from './map.js';
import { initAutocomplete } from './autocomplete.js';
import { renderServices } from './services.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Load partials
  await loadPartial('header-container', 'partials/header.html');
  await loadPartial('footer-container', 'partials/footer.html');
  await loadPartial('popup-container', 'partials/popup.html');
  await loadPartial('bottom-nav-container', 'partials/bottom-nav.html');

  // Render dịch vụ từ JSON
  await renderServices();

  // Khởi tạo popup
  const popupAPI = initPopup();

  // Khởi tạo auth
  const authAPI = initAuth();

  // Khởi tạo autocomplete
  initAutocomplete();

  // Gắn sự kiện bản đồ
  document.getElementById('getLocationBtn')?.addEventListener('click', handleGetLocation);
  document.getElementById('pickOnMapBtn')?.addEventListener('click', () => {
    popupAPI.showMapDialog();
    initMapIfNeeded();
    setTimeout(() => map && map.invalidateSize(), 50);
  });
  document.getElementById('mapConfirm')?.addEventListener('click', confirmMapLocation);

  // Gắn sự kiện logout
  document.getElementById('btnLogout')?.addEventListener('click', authAPI.apiLogout);
});

/**
 * Hàm load partial vào container
 */
async function loadPartial(containerId, url) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Không thể tải ${url}`);
    container.innerHTML = await res.text();
  } catch (err) {
    console.error(err);
  }
}
