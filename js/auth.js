/* =========================
   AUTHENTICATION MODULE
   Xử lý đăng nhập, đăng xuất,
   lưu và khôi phục session
   ========================= */

import { WEB_APP_MAIN, WEB_APP_INFO } from './config.js';
import { renderBasicCustomerInfo, removeBasicCustomerInfo, showSessionBannerUI } from './ui.js';

/**
 * Khởi tạo các sự kiện và hàm xử lý đăng nhập/đăng xuất
 */
export function initAuth() {
  // Lấy các phần tử trong form đăng nhập
  const customerForm = document.getElementById('customerForm');
  const cusName = document.getElementById('cusName');
  const cusPhone = document.getElementById('cusPhone');
  const cusLocation = document.getElementById('cusLocation');
  const consentCustomer = document.getElementById('consentCustomer');
  const consentCustomerErr = document.getElementById('consentCustomerErr');
  const customerLoginBtn = document.getElementById('customerLoginBtn');

  /**
   * Tạo deviceId nếu chưa có trong localStorage
   */
  function ensureDeviceId() {
    let id = localStorage.getItem('odcg_device_id');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : ('dev-' + Date.now() + '-' + Math.random()));
      localStorage.setItem('odcg_device_id', id);
    }
    return id;
  }

  /**
   * Hàm POST form với dữ liệu dạng x-www-form-urlencoded
   */
  async function postFormJSON(url, params) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params)
    });
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { ok: false, message: text }; }
  }

  /**
   * Gọi API đăng nhập
   */
  async function loginUser({ name, phone, location, deviceId }) {
    const res = await fetch(WEB_APP_MAIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'login_user', name, phone, location, deviceId })
    });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      if (json && json.ok && json.sessionId) {
        return { ok: true, sessionId: json.sessionId, customer: json.customer || null };
      }
    } catch {}
    if (/^Đăng nhập thành công/i.test(text)) {
      const m = text.match(/SESSION:([A-Za-z0-9\-]+)/);
      return { ok: true, sessionId: (m ? m[1] : null), customer: null };
    }
    return { ok: false, message: text || 'Đăng nhập thất bại' };
  }

  /**
   * Xử lý submit form đăng nhập
   */
  customerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = cusName.value.trim();
    const phone = cusPhone.value.trim().replace(/\s+/g, '');
    const loc = cusLocation.value.trim();

    // Validate cơ bản
    if (!name) { cusName.focus(); return; }
    if (!/^0[0-9]{9,10}$/.test(phone)) { cusPhone.focus(); return; }
    if (!loc) { cusLocation.focus(); return; }
    if (!consentCustomer.checked) { 
      consentCustomerErr.style.display = 'block'; 
      consentCustomer.focus(); 
      return; 
    }
    consentCustomerErr.style.display = 'none';

    const deviceId = ensureDeviceId();

    try {
      customerLoginBtn.disabled = true;
      customerLoginBtn.textContent = '⏳ Đang đăng nhập...';

      const result = await loginUser({ name, phone, location: loc, deviceId });
      if (!result.ok) {
        alert(result.message || 'Đăng nhập thất bại');
        return;
      }

      const customer = result.customer || { name, phone, location: loc, mapUrl: '' };
      // Lưu session vào localStorage
      localStorage.setItem('odcg_customer', JSON.stringify({
        name: customer.name, phone: customer.phone, location: customer.location,
        mapUrl: customer.mapUrl || '', sessionId: result.sessionId, deviceId, t: Date.now()
      }));

      // Render hồ sơ ngay
      renderBasicCustomerInfo(customer);

    } catch (err) {
      alert('Không thể đăng nhập: ' + err.message);
    } finally {
      customerLoginBtn.disabled = false;
      customerLoginBtn.textContent = 'Đăng nhập';
    }
  });

  /**
   * Đăng xuất
   */
  async function apiLogout() {
    const session = JSON.parse(localStorage.getItem('odcg_customer') || '{}');
    if (!session.phone || !session.deviceId || !session.sessionId) {
      localStorage.removeItem('odcg_customer'); 
      removeBasicCustomerInfo(); 
      return;
    }
    try {
      const res = await fetch(WEB_APP_MAIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'logout_user',
          phone: session.phone,
          deviceId: session.deviceId,
          sessionId: session.sessionId
        })
      });
      const text = await res.text();
      if (text) alert(text);
    } catch (e) {
      alert('Lỗi đăng xuất: ' + e.message);
    } finally {
      localStorage.removeItem('odcg_customer');
      removeBasicCustomerInfo();
    }
  }

  /**
   * Ping session để kiểm tra trạng thái
   */
  async function pingSession({ phone, deviceId, sessionId }) {
    return postFormJSON(WEB_APP_MAIN, { action: 'ping_session', phone, deviceId, sessionId });
  }

  /**
   * Khôi phục session nếu có
   */
  async function restoreSessionIfAnyMinimal() {
    const session = JSON.parse(localStorage.getItem('odcg_customer') || '{}');
    if (!session.phone || !session.sessionId || !session.deviceId) { 
      return; 
    }
    try {
      const pr = await pingSession({ phone: session.phone, deviceId: session.deviceId, sessionId: session.sessionId });
      if (pr.status === 'ACTIVE') {
        renderBasicCustomerInfo(pr.customer || session);
        showSessionBannerUI('');
      } else {
        localStorage.removeItem('odcg_customer');
        removeBasicCustomerInfo();
      }
    } catch {
      // Không làm gì nếu lỗi
    }
  }

  // Khôi phục session khi load trang
  window.addEventListener('load', restoreSessionIfAnyMinimal);

  // Xuất hàm logout để module khác dùng
  return { apiLogout };
}
