// Đợi trang web tải xong toàn bộ HTML rồi mới chạy code JS
document.addEventListener('DOMContentLoaded', function() {
    
    // Kiểm tra xem file Config đã nhận chưa
    if (typeof CONFIG === 'undefined') {
        alert("Lỗi: Không tìm thấy file globalConfig.js. Hãy kiểm tra lại file HTML!");
        return;
    }

    const API_URL = CONFIG.API_BASE_URL + '/Auth'; 
    console.log("Javascript đã sẵn sàng! Đang tìm nút Đăng nhập...");

    // Tìm nút đăng nhập
    const btnLogin = document.getElementById('btnLogin');

    // Kiểm tra xem có tìm thấy nút không
    if (!btnLogin) {
        alert("Lỗi nghiêm trọng: Không tìm thấy nút có id='btnLogin' trong file HTML. Hãy kiểm tra lại file login.html xem đã đặt đúng id chưa!");
        return;
    }

    // --- PHẦN 1: XỬ LÝ KHI BẤM NÚT "ĐĂNG NHẬP" ---
    btnLogin.addEventListener('click', async function(e) {
        alert("OK! Đã bắt được sự kiện click nút!"); // <--- Nếu thấy cái này là ngon!
        e.preventDefault(); 

        const emailElement = document.getElementById('email');
        const passwordElement = document.getElementById('password');

        if (!emailElement || !passwordElement) {
             alert("Lỗi: Không tìm thấy ô nhập Email hoặc Password trong HTML");
             return;
        }

        const email = emailElement.value;
        const password = passwordElement.value;

        // 2. Kiểm tra sơ bộ
        if (!email || !password) {
            alert("Vui lòng nhập đầy đủ Email và Mật khẩu!");
            return;
        }

        // 3. Gửi lên Server
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Đăng nhập đúng! Hãy kiểm tra Email để lấy mã OTP.");
                
                document.getElementById('btnLogin').style.display = 'none'; // Ẩn nút đăng nhập
                
                const otpSection = document.getElementById('otpSection');
                if(otpSection) {
                    otpSection.style.display = 'block'; // Hiện khung OTP
                    otpSection.classList.remove('hidden'); // Nếu dùng Tailwind thì xóa class hidden
                } else {
                    alert("Lỗi: Không tìm thấy khung id='otpSection' để hiện lên");
                }

                document.getElementById('email').disabled = true;
                document.getElementById('password').disabled = true;
            } else {
                alert("Lỗi từ Server: " + data.message);
            }
        } catch (error) {
            console.error("Lỗi hệ thống:", error);
            alert("Không kết nối được với Server. Kiểm tra xem Backend (cổng 5114) đã chạy chưa?");
        }
    });

    // --- PHẦN 2: XỬ LÝ KHI BẤM NÚT "XÁC NHẬN OTP" ---
    const btnVerify = document.getElementById('btnVerifyOtp');
    if (btnVerify) {
        btnVerify.addEventListener('click', async function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const otp = document.getElementById('otpCode').value;

            if (!otp) { alert("Vui lòng nhập mã OTP!"); return; }

            try {
                const response = await fetch(`${API_URL}/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, otpCode: otp })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('userRole', data.role);
                    localStorage.setItem('userName', data.fullName);
                    localStorage.setItem('userId', data.userId);

                    alert("Thành công! Chào " + data.fullName);

                    if (data.role === 'Admin') {
    // Sửa thành đường dẫn tuyệt đối chuẩn xác:
    window.location.href = '/PAGES/admin/index.html'; 
} else {
    // Sửa thành đường dẫn về trang chủ:
    window.location.href = '/PAGES/Home.html'; 
}
                } else {
                    alert("Lỗi: " + data.message);
                }
            } catch (error) {
                console.error(error);
                alert("Lỗi khi xác thực OTP.");
            }
        });
    }
});