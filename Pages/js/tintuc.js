document.addEventListener('DOMContentLoaded', function() {
    // Lấy "chìa khóa" (token) đã lưu khi đăng nhập
    const token = localStorage.getItem('jwtToken'); 
    
    // Nếu chưa đăng nhập, không có token thì không cho vào, đá về trang login
    if (!token) {
        alert('Bạn cần đăng nhập để truy cập trang này.');
        window.location.href = 'account/login.html';
        return;
    }

    // Dùng "chìa khóa" để gọi API lấy danh sách tin tức
    fetch('http://localhost:5114/api/TinTuc', { // Nhớ kiểm tra lại cổng API của bạn
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (response.status === 401) { // Lỗi xác thực
             alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
             window.location.href = 'account/login.html';
             return;
        }
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu tin tức.');
        }
        return response.json();
    })
    .then(danhSachTinTuc => {
        const tableBody = document.querySelector('tbody');
        tableBody.innerHTML = ''; // Xóa các dòng dữ liệu mẫu trong HTML

        // Lặp qua danh sách tin tức nhận được từ API và tạo các hàng trong bảng
        danhSachTinTuc.forEach((tin, index) => {
            const row = `
                <tr>
                    <td class="p-4">${index + 1}</td>
                    <td class="p-4 font-medium text-gray-800">${tin.TieuDe}</td>
                    <td class="p-4 text-gray-600">${tin.TacGia}</td>
                    <td class="p-4 text-gray-600">${new Date(tin.NgayDang).toLocaleDateString()}</td>
                    <td class="p-4"><img src="${tin.HinhAnh}" alt="thumbnail" class="h-10 w-16 object-cover rounded"></td>
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
        console.error('Lỗi:', error);
        alert(error.message);
    });
});