// File: js/authen.js

document.addEventListener('DOMContentLoaded', function() {
    
    // Kiểm tra cấu hình
    if (typeof CONFIG === 'undefined') { 
        console.error("Lỗi: Chưa có file globalConfig.js"); 
        return; 
    }
    
    const API_URL = CONFIG.API_BASE_URL + '/Auth'; 
    const btnLogin = document.getElementById('btnLogin');

    // --- PHẦN 1: XỬ LÝ ĐĂNG NHẬP ---
    if (btnLogin) {
        btnLogin.addEventListener('click', async function(e) {
            e.preventDefault(); 

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) { alert("Nhập đủ thông tin đi bạn ơi!"); return; }

            try {
                // Gửi thông tin lên Server
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });

                const data = await response.json();

                if (response.ok) {
                    // --- QUAN TRỌNG: LƯU TOKEN VÀO TÚI ---
                    // (Backend thường trả về 'token' hoặc 'accessToken', mình lưu cả cho chắc)
                    if (data.token) localStorage.setItem('accessToken', data.token);

                    // Lưu các thông tin khác
                    localStorage.setItem('userRole', data.role);
                    localStorage.setItem('userName', data.fullName);
                    localStorage.setItem('userMssv', data.mssv || "Chưa cập nhật");
                    localStorage.setItem('userLop', data.lop || "Chưa cập nhật");
                    localStorage.setItem('userKhoa', data.khoa || "HUTECH");
                    localStorage.setItem('userEmail', data.email || data.Email);
                    // (Có thể lưu thêm UserId nếu Backend trả về)
                    if (data.userId) localStorage.setItem('userId', data.userId);

                    alert("Đăng nhập thành công!");

                    // CHUYỂN TRANG
                    if (data.role === 'Admin') {
                        window.location.href = '/admin/index.html'; // Dùng đường dẫn tuyệt đối cho chuẩn
                    } else {
                        window.location.href = '/Home.html'; 
                    }

                } else {
                    alert("Lỗi: " + (data.message || "Sai tài khoản hoặc mật khẩu"));
                }
            } catch (error) {
                console.error(error);
                alert("Lỗi kết nối Server! Hãy kiểm tra xem Backend đã bật chưa.");
            }
        });
    }
});

// --- PHẦN 2: HÀM ĐĂNG XUẤT (GỌI TỪ BẤT CỨ ĐÂU) ---
// Mình gắn nó vào window để các trang khác (Home, Admin) đều gọi được
window.logout = function() {
    // 1. Hỏi lại cho chắc (Tùy chọn, nếu thấy phiền thì xóa dòng này)
    if (!confirm("Bạn có chắc muốn đăng xuất không?")) return;

    // 2. XÓA SẠCH SÀNH SANH TRONG TÚI (LocalStorage)
    // Cách nhanh nhất là xóa tất cả
    localStorage.clear(); 

    // Hoặc xóa từng cái nếu bạn muốn giữ lại setting gì đó (nhưng clear() là an toàn nhất)
    /*
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    ...
    */

    // 3. ĐÁ VỀ TRANG ĐĂNG NHẬP
    // Sử dụng đường dẫn tuyệt đối bắt đầu bằng dấu / để không bị lỗi đường dẫn
    window.location.href = '/account/login.html';
}