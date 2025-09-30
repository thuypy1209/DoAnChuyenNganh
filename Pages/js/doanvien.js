// doanvien.js - ĐÃ SỬA CUỐI CÙNG VÀ THÊM TRƯỜNG MỚI BỞI AI

// KHÔNG KHAI BÁO LẠI API_BASE_URL Ở ĐÂY NỮA
// Thay vào đó, chúng ta sẽ dùng window.API_DOAN_VIEN_URL đã được định nghĩa trong globalConfig.js

async function loadDoanViens() {
    try {
        const response = await fetch(window.API_DOAN_VIEN_URL); // Sử dụng biến từ globalConfig.js
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const doanViens = await response.json();

        const tableBody = document.getElementById('doanVienTableBody'); // Chọn thẻ tbody bằng ID mới
        if (!tableBody) { // Thêm kiểm tra này để đảm bảo element tồn tại
            console.warn("Không tìm thấy element có ID 'doanVienTableBody'.");
            return;
        }
        tableBody.innerHTML = ''; // Xóa dữ liệu cũ trong bảng trước khi thêm mới

        if (doanViens.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="11" class="px-6 py-4 text-center text-gray-500">Chưa có đoàn viên nào.</td></tr>`; // Cập nhật colspan
            return;
        }

        doanViens.forEach((dv, index) => {
            // SỬA LẠI TÊN THUỘC TÍNH (PROPERTY NAMES) TỪ camelCase SANG PascalCase ĐỂ KHỚP VỚI JSON
            const ngaySinhFormatted = dv.NgaySinh ? new Date(dv.NgaySinh).toLocaleDateString('vi-VN') : ''; // dv.NgaySinh
            const ngayTaoFormatted = dv.NgayTao ? new Date(dv.NgayTao).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : ''; // dv.NgayTao

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${dv.MaDoanVien || ''}</td>  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${dv.HoTen || ''}</td>     <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${ngaySinhFormatted}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${dv.SoDienThoai || ''}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${dv.Email || ''}</td>     <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${dv.Khoa || ''}</td>      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${dv.Nganh || ''}</td>     <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${dv.KhoaHoc || ''}</td>   <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${ngayTaoFormatted}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" class="text-blue-600 hover:text-blue-900 mr-3" onclick="editDoanVien(${dv.Id})"><i class="fas fa-edit"></i></a>  <a href="#" class="text-red-600 hover:text-red-900" onclick="deleteDoanVien(${dv.Id})"><i class="fas fa-trash-alt"></i></a></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Lỗi khi tải danh sách đoàn viên:", error);
        const tableBody = document.getElementById('doanVienTableBody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="11" class="px-6 py-4 text-center text-red-500">Không thể tải dữ liệu đoàn viên. Vui lòng kiểm tra API Backend và CORS.</td></tr>`; // Cập nhật colspan
        }
    }
}

// Hàm mở modal và reset form để thêm mới
function addNewDoanVien() {
    document.getElementById('modalTitle').textContent = 'Thêm Đoàn viên mới';
    document.getElementById('doanVienForm').reset();
    document.getElementById('doanVienId').value = '';
    document.getElementById('doanVienModal').classList.remove('hidden');
    document.getElementById('doanVienModal').classList.add('flex');
}

// Hàm đóng modal
function closeModal() {
    document.getElementById('doanVienModal').classList.add('hidden');
    document.getElementById('doanVienModal').classList.remove('flex');
    document.getElementById('doanVienForm').reset();
}

// Hàm xử lý gửi form (thêm mới hoặc sửa)
async function saveDoanVien(event) {
    event.preventDefault(); // Ngăn chặn form gửi đi theo cách truyền thống

    const doanVienId = document.getElementById('doanVienId').value;
    const maDoanVien = document.getElementById('maDoanVien').value;
    const hoTen = document.getElementById('hoTen').value;
    const ngaySinh = document.getElementById('ngaySinh').value;
    const soDienThoai = document.getElementById('soDienThoai').value;
    const email = document.getElementById('email').value;
    // LẤY GIÁ TRỊ CÁC TRƯỜNG MỚI
    const khoa = document.getElementById('khoa').value;
    const nganh = document.getElementById('nganh').value;
    const khoaHoc = document.getElementById('khoaHoc').value;


    const ngaySinhIso = ngaySinh ? new Date(ngaySinh).toISOString() : null;

    const doanVienData = {
        MaDoanVien: maDoanVien, // MaDoanVien
        HoTen: hoTen,           // HoTen
        NgaySinh: ngaySinhIso,  // NgaySinh
        SoDienThoai: soDienThoai, // SoDienThoai
        Email: email,            // Email
        // THÊM CÁC TRƯỜNG MỚI VÀO DATA GỬI ĐI
        Khoa: khoa,
        Nganh: nganh,
        KhoaHoc: khoaHoc
    };

    let url = window.API_DOAN_VIEN_URL; // Dùng window.API_DOAN_VIEN_URL
    let method = 'POST'; // Mặc định là thêm mới

    if (doanVienId) { // Nếu có doanVienId, đây là thao tác sửa
        url = `${window.API_DOAN_VIEN_URL}/${doanVienId}`;
        method = 'PUT';
        doanVienData.Id = parseInt(doanVienId); // Thêm Id vào data khi sửa (chữ I hoa)
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(doanVienData) // Chuyển đổi dữ liệu thành chuỗi JSON
        });
        if (response.status === 401 || response.status === 403) {
            alert('Bạn không có quyền này.');
            closeModal();
            return;
        }
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
        }

        alert(`Đoàn viên đã được ${doanVienId ? 'cập nhật' : 'thêm mới'} thành công!`);
        closeModal(); // Đóng modal sau khi lưu thành công
        loadDoanViens(); // Tải lại danh sách để thấy thay đổi
    } catch (error) {
        console.error("Lỗi khi lưu đoàn viên:", error);
        alert(`Không thể ${doanVienId ? 'cập nhật' : 'thêm mới'} đoàn viên. Lỗi: ` + error.message);
    }
}

// Hàm xử lý khi click nút "Sửa"
async function editDoanVien(id) {
    try {
        const response = await fetch(`${window.API_DOAN_VIEN_URL}/${id}`); // Dùng window.API_DOAN_VIEN_URL
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const doanVien = await response.json();

        // Điền dữ liệu vào form (LƯU Ý: SỬA TÊN THUỘC TÍNH THÀNH PascalCase)
        document.getElementById('modalTitle').textContent = 'Sửa Thông tin Đoàn viên';
        document.getElementById('doanVienId').value = doanVien.Id;
        document.getElementById('maDoanVien').value = doanVien.MaDoanVien || '';
        document.getElementById('hoTen').value = doanVien.HoTen || '';

        const ngaySinhDate = doanVien.NgaySinh ? new Date(doanVien.NgaySinh) : null;
        const formattedNgaySinh = ngaySinhDate ? ngaySinhDate.toISOString().split('T')[0] : '';
        document.getElementById('ngaySinh').value = formattedNgaySinh;

        document.getElementById('soDienThoai').value = doanVien.SoDienThoai || '';
        document.getElementById('email').value = doanVien.Email || '';
        // ĐIỀN GIÁ TRỊ CÁC TRƯỜNG MỚI VÀO FORM
        document.getElementById('khoa').value = doanVien.Khoa || '';
        document.getElementById('nganh').value = doanVien.Nganh || '';
        document.getElementById('khoaHoc').value = doanVien.KhoaHoc || '';


        document.getElementById('doanVienModal').classList.remove('hidden');
        document.getElementById('doanVienModal').classList.add('flex');

    } catch (error) {
        console.error("Lỗi khi tải thông tin đoàn viên để sửa:", error);
        alert("Không thể tải thông tin đoàn viên để sửa. Vui lòng kiểm tra API Backend.");
    }
}

// Hàm xử lý khi click nút "Xóa"
async function deleteDoanVien(id) {
    if (confirm(`Bạn có chắc chắn muốn xóa đoàn viên có Id: ${id} không?`)) {
        try {
            const response = await fetch(`${window.API_DOAN_VIEN_URL}/${id}`, { // Dùng window.API_DOAN_VIEN_URL
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert('Xóa đoàn viên thành công!');
            loadDoanViens(); // Tải lại danh sách sau khi xóa
        } catch (error) {
            console.error("Lỗi khi xóa đoàn viên:", error);
            alert("Không thể xóa đoàn viên. Vui lòng kiểm tra API Backend và CORS.");
        }
    }
}

// Gắn sự kiện submit cho form
const doanVienForm = document.getElementById('doanVienForm');
if (doanVienForm) {
    doanVienForm.addEventListener('submit', saveDoanVien);
} else {
    console.warn("Element with ID 'doanVienForm' not found. Ensure QLDV.html is loaded and the form exists.");
}

// Chặn truy cập nếu không phải admin
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Bạn cần đăng nhập để truy cập!');
        window.location.href = '../Pages/account/login.html';
        return;
    }
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Kiểm tra quyền admin (ví dụ: payload.role === 'admin' hoặc payload.roles chứa 'admin')
        if (!(payload.role === 'Admin' || (Array.isArray(payload.roles) && payload.roles.includes('admin')))) {
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = '../Pages/account/login.html';
            return;
        }
    } catch (e) {
        alert('Token không hợp lệ!');
        window.location.href = '../Pages/account/login.html';
        return;
    }
    // Nếu hợp lệ, mới cho load danh sách đoàn viên
    loadDoanViens();
});