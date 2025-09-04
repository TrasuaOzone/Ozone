/* =========================
   MAP MODULE (LEAFLET)
   ========================= */

import { WEB_APP_MAIN } from './config.js';
import { updateInlineMapLinks, setGetLocationButtonState, locHelp } from './ui.js';

let lastCoords = null;
let map, marker;

/**
 * Reverse geocode: chuyển tọa độ thành địa chỉ chữ
 */
export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=16&addressdetails=1`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'O-Day-Co-Gi/1.0 (contact: support@example.com)'
    }
  });
  if (!res.ok) throw new Error('reverse geocode failed');
  const data = await res.json();
  return data.display_name || '';
}

/**
 * Khởi tạo bản đồ Leaflet nếu chưa có
 */
export function initMapIfNeeded(defaultCenter = { lat: 10.775, lng: 106.7 }) {
  if (map) {
    map.invalidateSize();
    return;
  }
  map = L.map('pickMap').setView([defaultCenter.lat, defaultCenter.lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  marker = L.marker(map.getCenter(), { draggable: true }).addTo(map);

  marker.on('dragend', () => {
    const { lat, lng } = marker.getLatLng();
    document.getElementById('mapHelp').textContent = `Toạ độ tạm: ${lat.toFixed(6)}, ${lng.toFixed(6)} — bấm Xác nhận để dùng.`;
  });

  if (lastCoords) {
    marker.setLatLng([lastCoords.latitude, lastCoords.longitude]);
    map.setView([lastCoords.latitude, lastCoords.longitude], 15);
  }
}

/**
 * Lấy vị trí hiện tại bằng GPS
 */
export async function handleGetLocation() {
  if (!('geolocation' in navigator)) {
    alert('Thiết bị không hỗ trợ định vị.');
    return;
  }
  try {
    locHelp.textContent = 'Đang lấy vị trí, vui lòng chờ...';
    const coords = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve(pos.coords),
        err => reject(err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });

    lastCoords = { latitude: coords.latitude, longitude: coords.longitude };
    updateInlineMapLinks(lastCoords);

    try {
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      if (address) {
        document.getElementById('cusLocation').value = address;
        locHelp.textContent = 'Đã tự động điền địa chỉ của bạn.';
      }
    } catch {
      locHelp.textContent = 'Không thể chuyển toạ độ thành địa chỉ.';
    }

    setGetLocationButtonState(true);

    // Gửi cập nhật vị trí im lặng
    try {
      const session = JSON.parse(localStorage.getItem('odcg_customer') || '{}');
      if (session.phone && session.deviceId) {
        await fetch(WEB_APP_MAIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            action: 'update_location',
            phone: session.phone,
            location: document.getElementById('cusLocation').value.trim(),
            deviceId: session.deviceId
          })
        });
      }
    } catch {}
  } catch (err) {
    alert('Không thể lấy vị trí: ' + err.message);
  }
}

/**
 * Xác nhận vị trí trên bản đồ
 */
export async function confirmMapLocation() {
  const { lat, lng } = marker.getLatLng();
  lastCoords = { latitude: lat, longitude: lng };
  updateInlineMapLinks(lastCoords);
  try {
    const address = await reverseGeocode(lat, lng);
    document.getElementById('cusLocation').value = address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    locHelp.textContent = 'Đã cập nhật địa chỉ từ bản đồ.';
  } catch {
    document.getElementById('cusLocation').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    locHelp.textContent = 'Không thể chuyển toạ độ thành địa chỉ.';
  }
  setGetLocationButtonState(true);
}
