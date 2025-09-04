/* =========================
   AUTOCOMPLETE ĐỊA CHỈ
   ========================= */

import { WEB_APP_MAIN } from './config.js';
import { updateInlineMapLinks, setGetLocationButtonState, locHelp } from './ui.js';

export function initAutocomplete() {
  const locSearch = document.getElementById('locSearch');
  const locSuggest = document.getElementById('locSuggest');
  const locList = document.getElementById('locList');

  let suggestTimer = null;

  locSearch.addEventListener('input', () => {
    const q = locSearch.value.trim();
    clearTimeout(suggestTimer);
    if (q.length < 3) {
      locSuggest.style.display = 'none';
      locList.innerHTML = '';
      return;
    }
    suggestTimer = setTimeout(() => fetchSuggest(q), 300);
  });

  async function fetchSuggest(query) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=vn&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'O-Day-Co-Gi/1.0 (contact: support@example.com)'
        }
      });
      if (!res.ok) throw new Error('suggest failed');
      const data = await res.json();
      renderSuggest(data);
    } catch {
      locSuggest.style.display = 'none';
      locList.innerHTML = '';
    }
  }

  function renderSuggest(items) {
    locList.innerHTML = '';
    if (!items || !items.length) {
      locSuggest.style.display = 'none';
      return;
    }
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.display_name;
      li.style.padding = '8px 10px';
      li.style.cursor = 'pointer';
      li.style.borderRadius = '8px';
      li.addEventListener('click', async () => {
        document.getElementById('cusLocation').value = item.display_name || '';
        updateInlineMapLinks({ latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) });
        setGetLocationButtonState(true);
        locSuggest.style.display = 'none';
        locList.innerHTML = '';
        locHelp.textContent = 'Đã chọn địa chỉ từ gợi ý.';
      });
      li.addEventListener('mouseenter', () => li.style.background = '#FFF7F8');
      li.addEventListener('mouseleave', () => li.style.background = 'transparent');
      locList.appendChild(li);
    });
    locSuggest.style.display = 'block';
  }

  // Ẩn gợi ý khi click ra ngoài
  document.addEventListener('click', (e) => {
    if (!locSuggest.contains(e.target) && e.target !== locSearch) {
      locSuggest.style.display = 'none';
    }
  });
}
