// File: js/danhSachDoanVien.js

// Chạy hàm loadDoanViens ngay khi trang được tải xong
document.addEventListener('DOMContentLoaded', loadDoanViens);

async function loadDoanViens() {
    const tableBody = document.getElementById('danh-sach-doan-vien-body');
    if (!tableBody) {
        console.error("Không tìm thấy phần tử tbody với id='danh-sach-doan-vien-body'");
        return;
    }
    
    tableBody.innerHTML = '<tr><td colspan="8" class="p-4 text-center">Đang tải dữ liệu...</td></tr>';

    try {
        // Sử dụng cổng mà bạn đã xác nhận là đúng (ví dụ 5114 hoặc 7006)
        const response = await fetch('http://localhost:5114/api/DoanViens'); 
        
        if (!response.ok) {
            throw new Error('Lỗi khi tải dữ liệu từ API.');
        }

        const danhSachDoanVien = await response.json();
        
        tableBody.innerHTML = ''; // Xóa dòng "Đang tải"

        if (danhSachDoanVien.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="p-4 text-center">Chưa có đoàn viên nào trong danh sách.</td></tr>`;
            return;
        }

        // Lặp qua từng đoàn viên và tạo một hàng mới trong bảng
        danhSachDoanVien.forEach((dv, index) => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50'; // Thêm style cho đẹp

            // Tạo nội dung cho hàng với các cột tương ứng
            row.innerHTML = `
                <td class="p-4">${index + 1}</td>
                <td class="p-4 font-medium text-blue-600">${dv.HoTen}</td>
                <td class="p-4">${dv.MaDinhDanh || '---'}</td>
                <td class="p-4">${new Date(dv.NgaySinh).toLocaleDateString('vi-VN')}</td>
                <td class="p-4">${dv.GioiTinh || '---'}</td>
                <td class="p-4">${dv.DanToc || '---'}</td>
                <td class="p-4">${dv.TonGiao || '---'}</td>
                <td class="p-4">${dv.QueQuan || '---'}</td>
            `;

            // Thêm hàng mới vào bảng
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Chi tiết lỗi:', error);
        tableBody.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-red-500">Không thể tải được dữ liệu. Hãy chắc chắn rằng Back-end đang chạy.</td></tr>`;
    }
}