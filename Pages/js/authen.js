document.addEventListener('DOMContentLoaded', function() {
    
    // Kiểm tra cấu hình
    if (typeof CONFIG === 'undefined') { alert("Lỗi: Chưa có file globalConfig.js"); return; }
    const API_URL = CONFIG.API_BASE_URL + '/Auth'; 

    const btnLogin = document.getElementById('btnLogin');
    if (!btnLogin) return; // Không phải trang login thì thôi

    // XỬ LÝ KHI BẤM NÚT ĐĂNG NHẬP
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
                // 1. LƯU TẤT CẢ THÔNG TIN VÀO TÚI (LocalStorage)
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userName', data.fullName);
                localStorage.setItem('userMssv', data.mssv || "Chưa cập nhật");
                localStorage.setItem('userLop', data.lop || "Chưa cập nhật");
                localStorage.setItem('userKhoa', data.khoa || "HUTECH");
                localStorage.setItem('userEmail', data.email);

            alert("Đăng nhập thành công!");

                // 2. CHUYỂN TRANG NGAY LẬP TỨC
                // (Dùng đường dẫn tuyệt đối cho chắc ăn)
                if (data.role === 'Admin') {
                    window.location.href = '../admin/index.html'; 
                } else {
                    window.location.href = '../Home.html'; 
                }

            } else {
                alert("Lỗi: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối Server! Kiểm tra lại Backend.");
        }
    });
});