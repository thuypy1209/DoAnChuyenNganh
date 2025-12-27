// File: js/main.js

document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. TẢI NAVBAR (MENU TRÊN) ---
    fetch('components/_navbar.html')
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById('navbar-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;

                // SAU KHI TẢI XONG HTML THÌ MỚI XỬ LÝ LOGIC:
                handleDropdown();   // Xử lý bấm menu sổ xuống
                checkLoginState();  // Kiểm tra đăng nhập để hiện tên
                setupLogout();      // Gắn sự kiện cho nút đăng xuất
            }
        });

    // --- 2. TẢI FOOTER (CHÂN TRANG) ---
    fetch('components/_footer.html')
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) placeholder.innerHTML = data;
        });
});

// --- HÀM 1: XỬ LÝ DROPDOWN (Giữ nguyên ý tưởng của bạn) ---
function handleDropdown() {
    const dropdownButton = document.getElementById('dropdown-button'); // Nút avatar/tên
    const dropdownMenu = document.getElementById('dropdown-menu');     // Menu sổ xuống

    if (dropdownButton && dropdownMenu) {
        dropdownButton.addEventListener('click', function(event) {
            event.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
        });

        // Bấm ra ngoài thì đóng
        window.addEventListener('click', function() {
            if (!dropdownMenu.classList.contains('hidden')) {
                dropdownMenu.classList.add('hidden');
            }
        });
    }
}

// --- HÀM 2: KIỂM TRA ĐĂNG NHẬP (QUAN TRỌNG) ---
function checkLoginState() {
    // Lấy thông tin từ LocalStorage (Do file authen.js lưu)
    const token = localStorage.getItem('accessToken');
    const userName = localStorage.getItem('userName');
    const userAvatar = localStorage.getItem('userAvatar') || 'images/default_avatar.png'; // Ảnh mặc định nếu chưa có

    // Các phần tử trên HTML (Bạn cần đặt ID trong file _navbar.html cho đúng nhé)
    const btnLogin = document.getElementById('nav-btn-login'); // Nút Đăng nhập
    const userArea = document.getElementById('nav-user-area'); // Khu vực hiện tên user
    const txtName = document.getElementById('nav-user-name');  // Chỗ điền tên
    const imgAvatar = document.getElementById('nav-user-avatar'); // Chỗ điền ảnh

    if (token && userName) {
        // ==> ĐÃ ĐĂNG NHẬP
        if(btnLogin) btnLogin.classList.add('hidden');       // Ẩn nút Login
        if(userArea) userArea.classList.remove('hidden');    // Hiện khu vực User
        
        if(txtName) txtName.textContent = userName;          // Điền tên
        if(imgAvatar) imgAvatar.src = userAvatar;            // Điền ảnh
    } else {
        // ==> CHƯA ĐĂNG NHẬP
        if(btnLogin) btnLogin.classList.remove('hidden');    // Hiện nút Login
        if(userArea) userArea.classList.add('hidden');       // Ẩn khu vực User
    }
}

// --- HÀM 3: XỬ LÝ ĐĂNG XUẤT ---
function setupLogout() {
    const btnLogout = document.getElementById('btn-logout'); // Nút đăng xuất trong menu sổ xuống
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            if(confirm('Bạn có chắc muốn đăng xuất?')) {
                // 1. Xóa sạch kho lưu trữ
                localStorage.clear();
                // 2. Chuyển về trang đăng nhập
                window.location.href = '/account/login.html';
            }
        });
    }
}