document.addEventListener('DOMContentLoaded', async function() {
    const mssv = localStorage.getItem('userMssv');
    const token = localStorage.getItem('accessToken');

    if (!mssv) {
        window.location.href = 'account/login.html'; // Sửa lại đường dẫn cho chắc
        return;
    }

    try {
        // Gọi API lấy thông tin thực tế
        // Lưu ý: Đường dẫn này đúng với C# cậu gửi (api/QuanLySinhVien)
        const response = await fetch(`http://localhost:5114/api/QuanLySinhVien/GetByMssv/${mssv}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            // Xử lý data linh hoạt (có thể nằm trong thongTin hoặc nằm ngoài)
            const sv = data.thongTin || data.ThongTin || data;

            // 1. Đổ dữ liệu vào các thẻ
            document.getElementById('profileName').innerText = sv.hoTen || sv.HoTen || "Sinh viên";
            document.getElementById('profileMssv').innerText = sv.mssv || sv.MSSV || mssv;
            document.getElementById('profileLop').innerText = sv.lop || sv.Lop || "Chưa cập nhật";
            document.getElementById('profileKhoa').innerText = sv.khoa || sv.Khoa || "Chưa cập nhật";
            
            // --- SỬA LẠI LOGIC EMAIL CHO CHUẨN ---
            // 1. Lấy cái Email lưu trong túi (localStorage) lúc đăng nhập
            const emailLogin = localStorage.getItem('userEmail');

            // 2. Kiểm tra kỹ: Nếu API có email thì lấy, không thì lấy cái trong túi
            // Thêm check khác "undefined" (chuỗi) vì đôi khi localStorage lưu bậy
            let realEmail = sv.email || sv.Email;
            
            if (!realEmail || realEmail === "undefined") {
                realEmail = (emailLogin && emailLogin !== "undefined") ? emailLogin : "Chưa cập nhật";
            }
            
            // 3. Gán vào màn hình
            document.getElementById('profileEmail').innerText = realEmail;
            // -------------------------------------
            
            // Hiện điểm rèn luyện
            document.getElementById('profileTotalScore').innerText = data.tongDiem || data.TongDiem || 0;

            // Xử lý ngày sinh (định dạng lại dd/mm/yyyy)
            const NgaySinhRaw = sv.ngaySinh || sv.NgaySinh;
            document.getElementById('profileBirthday').innerText = NgaySinhRaw ? new Date(NgaySinhRaw).toLocaleDateString('vi-VN') : "Chưa cập nhật";
            
            // Số điện thoại
            document.getElementById('profilePhone').innerText = sv.soDienThoai || sv.SoDienThoai || "Chưa cập nhật";

            // 2. ĐỒNG BỘ ẢNH ĐẠI DIỆN
            let avatarUrl = sv.anhDaiDien || sv.AnhDaiDien;
            if (!avatarUrl || avatarUrl === 'string' || avatarUrl === 'default.png') {
                const name = sv.hoTen || "User";
                avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=256`;
            }
            const imgAvatar = document.getElementById('profileAvatar');
            if(imgAvatar) imgAvatar.src = avatarUrl;
        }
    } catch (error) {
        console.error("Lỗi:", error);
    }
});

function logout() {
    if(!confirm("Bạn có chắc muốn đăng xuất?")) return;
    localStorage.clear();
    // Dùng đường dẫn tuyệt đối cho an toàn
    window.location.href = '/account/login.html'; 
}

// --- CÁC HÀM XỬ LÝ SỬA ĐỔI ---

// 1. Bật chế độ sửa
function batCheDoSua() {
    // Ẩn text, hiện input
    document.getElementById('profileBirthday').classList.add('hidden');
    document.getElementById('editBirthday').classList.remove('hidden');

    document.getElementById('profilePhone').classList.add('hidden');
    document.getElementById('editPhone').classList.remove('hidden');

    // Đổi nút bấm
    document.getElementById('normalButtons').classList.add('hidden');
    document.getElementById('editButtons').classList.remove('hidden');

    // Đổ dữ liệu hiện tại vào ô input để sửa
    const currentPhone = document.getElementById('profilePhone').innerText;
    document.getElementById('editPhone').value = (currentPhone === "Chưa cập nhật" || currentPhone === "...") ? "" : currentPhone;
    
    // Lưu ý: Input date cần định dạng yyyy-MM-dd, còn hiển thị là dd/MM/yyyy
    // Nếu muốn xịn thì phải convert, còn lười thì để user tự chọn lại ngày
}

// 2. Hủy sửa (Quay về như cũ)
function huySua() {
    // Hiện text, ẩn input
    document.getElementById('profileBirthday').classList.remove('hidden');
    document.getElementById('editBirthday').classList.add('hidden');

    document.getElementById('profilePhone').classList.remove('hidden');
    document.getElementById('editPhone').classList.add('hidden');

    // Đổi nút bấm lại
    document.getElementById('normalButtons').classList.remove('hidden');
    document.getElementById('editButtons').classList.add('hidden');
}

// 3. LƯU THÔNG TIN (ĐÃ SỬA LỖI 404 VÀ JSON)
async function luuThongTin() {
    const mssv = localStorage.getItem('userMssv');
    const token = localStorage.getItem('accessToken');
    
    const newPhone = document.getElementById('editPhone').value;
    const newDob = document.getElementById('editBirthday').value;

    if (!newDob && !newPhone) {
        alert("Bạn chưa nhập thay đổi nào cả!");
        return;
    }

    try {
        // 🔥 QUAN TRỌNG: Sửa lại đường dẫn thành 'QuanLySinhVien' cho khớp với C#
        const response = await fetch(`http://localhost:5114/api/QuanLySinhVien/UpdateProfile/${mssv}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                NgaySinh: newDob ? newDob : null,
                SoDienThoai: newPhone
            })
        });

        // 🔥 XỬ LÝ LỖI JSON: Đọc text trước để tránh crash
        const text = await response.text();

        if (response.ok) {
            alert("✅ Cập nhật hồ sơ thành công!");
            window.location.reload(); 
        } else {
            console.error("Server trả về:", text);
            // Thử parse JSON xem có thông báo lỗi đẹp không
            try {
                const err = JSON.parse(text);
                alert("❌ Lỗi: " + (err.message || "Không thể cập nhật"));
            } catch (e) {
                // Nếu không phải JSON thì hiện lỗi thô
                alert("❌ Lỗi Server: " + text);
            }
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối Server!");
    }
}