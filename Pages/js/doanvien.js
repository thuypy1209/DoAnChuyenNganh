document.addEventListener('DOMContentLoaded', function() {
    // Lấy token đã được lưu trong file authen.js
    const token = localStorage.getItem('token'); 

    if (!token) {
        alert('Bạn cần đăng nhập để truy cập trang này.');
        window.location.href = 'account/login.html';
        return;
    }

    // Dùng token để gọi API lấy danh sách Đoàn viên
    fetch('http://localhost:5114/api/DoanViens', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (response.status === 403) { // Lỗi 403: Forbidden - Không có quyền
            throw new Error('Tài khoản của bạn không có quyền truy cập chức năng này.');
        }
        if (!response.ok) { // Các lỗi khác
            throw new Error('Lỗi khi tải dữ liệu Đoàn viên. Hãy kiểm tra Console (F12).');
        }
        return response.json(); // Nếu thành công, chuyển dữ liệu thành JSON
    })
    .then(danhSachDoanVien => {
        // In dữ liệu ra Console để kiểm tra
        console.log("Dữ liệu đoàn viên nhận được:", danhSachDoanVien);

        const tableBody = document.querySelector('tbody');
        if (!tableBody) return;

        tableBody.innerHTML = ''; // Xóa dữ liệu mẫu đi

        if (danhSachDoanVien.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="p-4 text-center">Chưa có dữ liệu đoàn viên.</td></tr>`;
            return;
        }

        // Dùng dữ liệu thật để điền vào bảng
        danhSachDoanVien.forEach((dv, index) => {
            const row = `
                <tr>
                    <td class="p-4">${index + 1}</td>
                    <td class="p-4 font-medium text-gray-800">${dv.HoTen}</td>
                    <td class="p-4 text-gray-600">${dv.MaDoanVien}</td>
                    <td class="p-4 text-gray-600">${new Date(dv.NgaySinh).toLocaleDateString('vi-VN')}</td>
                    <td class="p-4 text-gray-600">${dv.Email}</td>
                    <td class="p-4 flex space-x-2">
                        <a href="#" class="text-blue-500 hover:text-blue-700" title="Sửa"><i class="fas fa-edit text-lg"></i></a>
                        <a href="#" class="text-red-500 hover:text-red-700" title="Xóa"><i class="fas fa-trash-alt text-lg"></i></a>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

    })
    .catch(error => {
        // Hiển thị lỗi ra cho bạn thấy
        console.error('Lỗi:', error);
        alert(error.message); 
    });
});