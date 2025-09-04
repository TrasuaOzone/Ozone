/* =========================
   RENDER DỊCH VỤ TỪ JSON
   ========================= */

export async function renderServices() {
  try {
    // Lấy dữ liệu từ file JSON
    const res = await fetch('data/services.json');
    if (!res.ok) throw new Error('Không thể tải dữ liệu dịch vụ');
    const categories = await res.json();

    const mainContent = document.getElementById('main-content');

    // Xóa nội dung cũ (nếu có)
    mainContent.innerHTML = '';

    // Tạo section cho từng category
    categories.forEach(cat => {
      const section = document.createElement('section');

      // Tiêu đề category
      const h2 = document.createElement('h2');
      h2.textContent = cat.category;
      section.appendChild(h2);

      // Lưới dịch vụ
      const grid = document.createElement('div');
      grid.className = 'grid';

      cat.items.forEach(item => {
        const a = document.createElement('a');
        a.href = item.link;
        a.className = 'card';
        a.setAttribute('aria-label', item.label);

        // Icon SVG
        const img = document.createElement('img');
        img.src = item.icon;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');

        // Tên dịch vụ
        const p = document.createElement('p');
        p.textContent = item.label;

        a.appendChild(img);
        a.appendChild(p);
        grid.appendChild(a);
      });

      section.appendChild(grid);
      mainContent.appendChild(section);
    });
  } catch (err) {
    console.error(err);
  }
}
