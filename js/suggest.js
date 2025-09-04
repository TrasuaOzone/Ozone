// suggest.js – Xử lý gợi ý địa chỉ khi người dùng nhập

// Hàm khởi tạo sự kiện cho ô tìm kiếm địa chỉ
export function initSuggestEvents() { // Bắt đầu hàm initSuggestEvents
  const locSearch = document.getElementById('locSearch'); // Lấy phần tử input tìm kiếm địa chỉ
  if (!locSearch) return; // Nếu không tìm thấy thì thoát

  locSearch.addEventListener('input', () => { // Lắng nghe sự kiện nhập liệu
    const query = locSearch.value.trim(); // Lấy giá trị nhập và loại bỏ khoảng trắng 2 đầu
    if (query.length >= 3) { // Nếu độ dài từ 3 ký tự trở lên
      fetchSuggest(query); // Gọi hàm lấy gợi ý
    } // Kết thúc if
  }); // Kết thúc addEventListener
} // Kết thúc hàm initSuggestEvents

// Hàm gọi API Nominatim để lấy gợi ý địa chỉ
export async function fetchSuggest(query) { // Bắt đầu hàm fetchSuggest
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`; // URL API tìm kiếm
  const res = await fetch(url); // Gọi API
  const data = await res.json(); // Parse JSON
  renderSuggest(data); // Gọi hàm hiển thị gợi ý
} // Kết thúc hàm fetchSuggest

// Hàm hiển thị danh sách gợi ý
export function renderSuggest(items) { // Bắt đầu hàm renderSuggest
  const suggestBox = document.getElementById('suggestBox'); // Lấy phần tử chứa gợi ý
  if (!suggestBox) return; // Nếu không có thì thoát
  suggestBox.innerHTML = ''; // Xóa nội dung cũ

  items.forEach(item => { // Lặp qua từng gợi ý
    const div = document.createElement('div'); // Tạo phần tử div
    div.className = 'suggest-item'; // Thêm class cho styling
    div.textContent = item.display_name; // Gán tên địa chỉ
    div.addEventListener('click', () => { // Khi click vào gợi ý
      document.getElementById('locSearch').value = item.display_name; // Gán vào ô tìm kiếm
      suggestBox.innerHTML = ''; // Xóa danh sách gợi ý
    }); // Kết thúc addEventListener
    suggestBox.appendChild(div); // Thêm vào danh sách
  }); // Kết thúc forEach
} // Kết thúc hàm renderSuggest
