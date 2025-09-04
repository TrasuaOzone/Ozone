 <script>
    // URLs
    const WEB_APP_MAIN = 'https://script.google.com/macros/s/AKfycbwfeWkWWGllDaAD0ZhARdJ1UvOYwDalBF1rYUKWeD3178lqEB5g5qTv0aIBFu3RqW4Z/exec'; // app chính
    const WEB_APP_INFO = 'https://script.google.com/macros/s/AKfycbz89ganqrguJnrd9rbJQawgkhfGNQMuP3R1mE1Y774_J3_30c-QGGkDfYqWhR90lLoW/exec'; // app thông tin KH (fetch_by_phone)

    // Elements
    const bottomNav = document.getElementById('bottomNav');
    const overlay = document.getElementById('overlay');
    const roleBox = document.getElementById('roleBox');
    const customerBox = document.getElementById('customerBox');
    const mapBox = document.getElementById('mapBox');

    const loginBtn = document.getElementById('loginBtn');
    const signupLink = document.getElementById('signupLink');
    const closeRole = document.getElementById('closeRole');
    const closeCustomer = document.getElementById('closeCustomer');
    const closeMap = document.getElementById('closeMap');

    const roleCustomerBtn = document.getElementById('roleCustomer');
    const roleExpertBtn = document.getElementById('roleExpert');

    const customerForm = document.getElementById('customerForm');
    const cusName = document.getElementById('cusName');
    const cusPhone = document.getElementById('cusPhone');
    const cusLocation = document.getElementById('cusLocation');
    const locHelp = document.getElementById('locHelp');

    const getLocationBtn = document.getElementById('getLocationBtn');
    const pickOnMapBtn = document.getElementById('pickOnMapBtn');
    const viewMapLink = document.getElementById('viewMapLink');

    const locSearch = document.getElementById('locSearch');
    const locSuggest = document.getElementById('locSuggest');
    const locList = document.getElementById('locList');

    const consentCustomer = document.getElementById('consentCustomer');
    const consentCustomerErr = document.getElementById('consentCustomerErr');
    const customerLoginBtn = document.getElementById('customerLoginBtn');

    // Anti-cache for signup
    if (signupLink) {
      signupLink.addEventListener('click', function(){
        const url = new URL(this.href, location.origin);
        url.searchParams.set('v', Date.now().toString());
        this.href = url.toString();
      });
    }

    // Overlay open/close
    function openOverlay(){
      overlay.classList.add('active');
      document.body.classList.add('popup-active');
      loginBtn.setAttribute('aria-expanded','true');
      showRoleDialog();
      document.addEventListener('keydown', handleKeydown);
    }
    function closeOverlay(){
      overlay.classList.remove('active');
      document.body.classList.remove('popup-active');
      loginBtn.setAttribute('aria-expanded','false');
      loginBtn.focus();
      document.removeEventListener('keydown', handleKeydown);
      roleBox.hidden = true; customerBox.hidden = true; mapBox.hidden = true;
    }

    // Show dialogs
    function showRoleDialog(){
      roleBox.hidden = false; customerBox.hidden = true; mapBox.hidden = true;
      setTimeout(()=>roleCustomerBtn.focus(),0);
    }
    function showCustomerDialog(){
      roleBox.hidden = true; customerBox.hidden = false; mapBox.hidden = true;
      setTimeout(()=>cusName.focus(),0);
    }
    function showMapDialog(){
      roleBox.hidden = true; customerBox.hidden = true; mapBox.hidden = false;
      setTimeout(()=>document.getElementById('mapTitle').focus?.(), 0);
    }

    // Focus trap
    function handleKeydown(e){
      if(e.key === 'Escape'){ closeOverlay(); return; }
      if(e.key !== 'Tab') return;
      const scope = !roleBox.hidden ? roleBox : (!customerBox.hidden ? customerBox : mapBox);
      const selectors = 'a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
      const focusables = Array.from(scope.querySelectorAll(selectors)).filter(el => el.offsetParent !== null);
      if(!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length-1];
      if(e.shiftKey && document.activeElement === first){ last.focus(); e.preventDefault(); }
      else if(!e.shiftKey && document.activeElement === last){ first.focus(); e.preventDefault(); }
    }

    // Bind overlay/dialog
    loginBtn.addEventListener('click', openOverlay);
    closeRole.addEventListener('click', closeOverlay);
    closeCustomer.addEventListener('click', closeOverlay);
    closeMap.addEventListener('click', () => { showCustomerDialog(); });
    overlay.addEventListener('click', (e)=>{ if(e.target === overlay) closeOverlay(); });

    roleCustomerBtn.addEventListener('click', showCustomerDialog);
    roleExpertBtn.addEventListener('click', ()=>{ window.location.href = 'dang-nhap.html'; });

    // Consent hide error
    consentCustomer.addEventListener('change', ()=>{
      if(consentCustomer.checked) consentCustomerErr.style.display = 'none';
    });

    // Utils
    function ensureDeviceId(){
      let id = localStorage.getItem('odcg_device_id');
      if(!id){
        id = (crypto.randomUUID ? crypto.randomUUID() : ('dev-' + Date.now() + '-' + Math.random()));
        localStorage.setItem('odcg_device_id', id);
      }
      return id;
    }
    async function postFormJSON(url, params){
      const res = await fetch(url, {
        method:'POST',
        headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params)
      });
      const text = await res.text();
      try { return JSON.parse(text); } catch { return { ok:false, message:text }; }
    }

    // Render profile block right under header and toggle auth buttons
    function insertProfileSection(element) {
      const main = document.getElementById('main-content');
      const afterHeader = document.querySelector('header').nextElementSibling;
      main.insertBefore(element, afterHeader || main.firstChild);
    }
    function setAuthButtonsVisibility(isLoggedIn) {
      const login = document.getElementById('loginBtn');
      const signup = document.getElementById('signupLink');
      if (login) login.style.display = isLoggedIn ? 'none' : '';
      if (signup) signup.style.display = '';
    }
    function showSessionBannerUI(message) {
      const banner = document.getElementById('sessionBanner');
      const msg = document.getElementById('sessionBannerMsg');
      if (!banner || !msg) return;
      if (!message) { banner.style.display = 'none'; msg.textContent = ''; return; }
      msg.textContent = message;
      banner.style.display = 'block';
    }

    // Render 3 trường + link "vị trí của bạn" (ưu tiên mapUrl) + Logout
    function renderBasicCustomerInfo({ name, phone, location, mapUrl }) {
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
        insertProfileSection(box);
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

      const btnLogout = document.getElementById('btnLogout');
      if (btnLogout) btnLogout.onclick = apiLogout;

      setAuthButtonsVisibility(true);
    }
    function removeBasicCustomerInfo() {
      const box = document.getElementById('customerBasic');
      if (box && box.parentNode) box.parentNode.removeChild(box);
      setAuthButtonsVisibility(false);
    }

    // WEB APP INFO: lấy 3 trường theo SĐT (trả { ok, customer: {name, phone, location, mapUrl} })
    async function fetchCustomerInfoByPhone(phone) {
      return postFormJSON(WEB_APP_INFO, { action:'fetch_by_phone', phone });
    }

    // LOGIN: chấp nhận JSON hoặc TEXT, đóng popup ngay và render UI (ưu tiên mapUrl)
    async function loginUser({ name, phone, location, deviceId }) {
      const res = await fetch(WEB_APP_MAIN, {
        method:'POST',
        headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ action:'login_user', name, phone, location, deviceId })
      });
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (json && json.ok && json.sessionId) return { ok:true, sessionId: json.sessionId, customer: json.customer || null };
      } catch {}
      if (/^Đăng nhập thành công/i.test(text)) {
        const m = text.match(/SESSION:([A-Za-z0-9\-]+)/);
        return { ok:true, sessionId:(m ? m[1] : null), customer:null };
      }
      return { ok:false, message: text || 'Đăng nhập thất bại' };
    }

    // Submit
    customerForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name = cusName.value.trim();
      const phone = cusPhone.value.trim().replace(/\s+/g,'');
      const loc = cusLocation.value.trim();
      if(!name){ cusName.focus(); return; }
      if(!/^0[0-9]{9,10}$/.test(phone)){ cusPhone.focus(); return; }
      if(!loc){ cusLocation.focus(); return; }
      if(!consentCustomer.checked){ consentCustomerErr.style.display='block'; consentCustomer.focus(); return; }
      consentCustomerErr.style.display='none';

      const deviceId = ensureDeviceId();

      try{
        customerLoginBtn.disabled = true;
        customerLoginBtn.textContent = '⏳ Đang đăng nhập...';

        const result = await loginUser({ name, phone, location: loc, deviceId });
        if (!result.ok) {
          const msg = result.message || 'Đăng nhập thất bại';
          if (/khoá đăng nhập trong 24 giờ/i.test(msg)) alert('Số điện thoại này đang tạm bị khoá đăng nhập trong 24 giờ.');
          else alert(msg);
          return;
        }

        const customer = result.customer || { name, phone, location: loc, mapUrl: '', updatedAt: '' };
        localStorage.setItem('odcg_customer', JSON.stringify({
          name: customer.name, phone: customer.phone, location: customer.location,
          mapUrl: customer.mapUrl || '', updatedAt: customer.updatedAt || '',
          sessionId: result.sessionId, deviceId, t: Date.now()
        }));

        // Đóng popup và render hồ sơ ngay
        closeOverlay();
        renderBasicCustomerInfo({ name: customer.name, phone: customer.phone, location: customer.location, mapUrl: customer.mapUrl });

        // Lấy lại info từ web app info (không chặn UI)
        try {
          const infoRes = await fetchCustomerInfoByPhone(phone);
          if (infoRes && infoRes.ok && infoRes.customer) {
            renderBasicCustomerInfo({
              name: infoRes.customer.name || customer.name,
              phone: infoRes.customer.phone || customer.phone,
              location: infoRes.customer.location || customer.location,
              mapUrl: infoRes.customer.mapUrl || customer.mapUrl
            });
          }
        } catch {}

        // Bắt đầu ping loop (định nghĩa ở phần 3)
        if (typeof schedulePingLoop === 'function') schedulePingLoop();

      } catch(err){
        alert('Không thể đăng nhập: ' + err.message);
      } finally {
        customerLoginBtn.disabled = false;
        customerLoginBtn.textContent = 'Đăng nhập';
      }
    });

    // Logout
    async function apiLogout(){
      const session = JSON.parse(localStorage.getItem('odcg_customer') || '{}');
      if(!session.phone || !session.deviceId || !session.sessionId){
        localStorage.removeItem('odcg_customer'); removeBasicCustomerInfo(); return;
      }
      try{
        const res = await fetch(WEB_APP_MAIN, {
          method:'POST',
          headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            action:'logout_user',
            phone: session.phone,
            deviceId: session.deviceId,
            sessionId: session.sessionId
          })
        });
        const text = await res.text();
        if (text) alert(text);
      }catch(e){
        alert('Lỗi đăng xuất: ' + e.message);
      }finally{
        localStorage.removeItem('odcg_customer');
        removeBasicCustomerInfo();
      }
    }

    // Ping session minimal on load (schedule loop in part 3)
    async function pingSession({ phone, deviceId, sessionId }) {
      return postFormJSON(WEB_APP_MAIN, { action:'ping_session', phone, deviceId, sessionId });
    }
    async function restoreSessionIfAnyMinimal() {
      const session = JSON.parse(localStorage.getItem('odcg_customer') || '{}');
      if (!session.phone || !session.sessionId || !session.deviceId) { setAuthButtonsVisibility(false); return; }
      try {
        const pr = await pingSession({ phone: session.phone, deviceId: session.deviceId, sessionId: session.sessionId });
        if (pr.status === 'ACTIVE') {
          renderBasicCustomerInfo({
            name: pr.customer?.name || session.name,
            phone: pr.customer?.phone || session.phone,
            location: pr.customer?.location || session.location,
            mapUrl: pr.customer?.mapUrl || session.mapUrl
          });
          showSessionBannerUI('');
          if (typeof schedulePingLoop === 'function') schedulePingLoop();
        } else if (pr.status === 'OTHER_DEVICE') {
          showSessionBannerUI('Số điện thoại này đang đăng nhập ở nơi khác. Phiên hiện tại đã bị đăng xuất.');
          localStorage.removeItem('odcg_customer');
          removeBasicCustomerInfo();
        } else if (pr.status === 'LOCKED') {
          showSessionBannerUI('Số điện thoại này đang tạm bị khoá đăng nhập trong 24 giờ.');
          localStorage.removeItem('odcg_customer');
          removeBasicCustomerInfo();
        } else {
          localStorage.removeItem('odcg_customer');
          removeBasicCustomerInfo();
        }
      } catch {
        setAuthButtonsVisibility(false);
      }
    }
    window.addEventListener('load', restoreSessionIfAnyMinimal);

    // Bottom nav padding
    function updateBottomPadding(){
      if(!bottomNav) return;
      const h = Math.round(bottomNav.getBoundingClientRect().height || 64);
      const current = getComputedStyle(document.documentElement).getPropertyValue('--bottom-nav-pad').trim();
      const next = h + 'px';
      if(current !== next){ document.documentElement.style.setProperty('--bottom-nav-pad', next); }
    }
    window.addEventListener('load', updateBottomPadding);
    window.addEventListener('resize', updateBottomPadding);
    if('ResizeObserver' in window && bottomNav){
      const ro = new ResizeObserver(()=>requestAnimationFrame(updateBottomPadding));
      ro.observe(bottomNav);
    }
  </script>