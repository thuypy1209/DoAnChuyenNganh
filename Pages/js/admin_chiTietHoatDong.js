// File: js/admin_chiTietHoatDong.js

const API_URL = 'http://localhost:5114/api/HoatDongs';
const urlParams = new URLSearchParams(window.location.search);
const activityId = urlParams.get('id'); // Lấy ID từ URL

document.addEventListener('DOMContentLoaded', function() {
    if (!activityId) {
        alert("Không tìm thấy ID hoạt động!");
        window.location.href = 'quanLyHoatDong.html';
        return;
    }

    loadActivityInfo();
    loadStudentList();
});

// 1. Lấy thông tin hoạt động (Để hiện tên, ngày tháng)
async function loadActivityInfo() {
    try {
        const res = await fetch(`${API_URL}/${activityId}`);
        const data = await res.json();
        
        document.getElementById('lblTenHoatDong').innerText = data.TenHoatDong; // Chú ý chữ hoa thường do API trả về
        // Kiểm tra lại xem API trả về TenHoatDong hay tenHoatDong (thường là camelCase nếu không cấu hình)
        // Tốt nhất là check console.log(data) nếu không hiện
        
        const date = new Date(data.NgayBatDau);
        document.getElementById('lblThoiGian').innerText = date.toLocaleString('vi-VN');
        document.getElementById('lblDiaDiem').innerText = data.DiaDiem || 'Chưa cập nhật';
    } catch (e) { console.error(e); }
}

// 2. Lấy danh sách sinh viên đăng ký
async function loadStudentList() {
    const tbody = document.getElementById('studentTableBody');
    
    try {
        const res = await fetch(`${API_URL}/DanhSachDangKy/${activityId}`);
        const data = await res.json(); // Danh sách này trả về từ API mới làm

        // Cập nhật Stats
        document.getElementById('countTotal').innerText = data.length;
        document.getElementById('countApproved').innerText = data.filter(d => d.TrangThaiDuyet === 'DaDuyet').length;
        document.getElementById('countPending').innerText = data.filter(d => d.TrangThaiDuyet === 'ChoDuyet').length;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-500">Chưa có ai đăng ký.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach(sv => {
            // Xử lý trạng thái
            let statusBadge = '';
            if (sv.TrangThaiDuyet === 'ChoDuyet') statusBadge = '<span class="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">Chờ duyệt</span>';
            else if (sv.TrangThaiDuyet === 'DaDuyet') statusBadge = '<span class="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">Đã duyệt</span>';
            else statusBadge = '<span class="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">Từ chối</span>';

            // Xử lý điểm danh
            const checkInStatus = sv.DaDiemDanh 
                ? `<span class="text-green-600 font-bold"><i class="fas fa-check-circle"></i> ${new Date(sv.ThoiGianDiemDanh).toLocaleTimeString()}</span>`
                : '<span class="text-gray-400 italic">Chưa quét</span>';

            const html = `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-4">
                        <p class="font-bold text-gray-800">${sv.TenSinhVien}</p>
                        <p class="text-xs text-gray-500 font-mono">${sv.MSSV}</p>
                    </td>
                    <td class="p-4 text-sm text-gray-600">${new Date(sv.NgayDangKy).toLocaleDateString()}</td>
                    <td class="p-4 text-center">${statusBadge}</td>
                    <td class="p-4 text-center">${checkInStatus}</td>
                    <td class="p-4 text-center">
                        ${sv.TrangThaiDuyet === 'ChoDuyet' ? `
                            <button onclick="updateStatus(${sv.Id}, 'DaDuyet')" class="text-green-600 hover:text-green-800 font-bold mr-2 text-xs border border-green-600 px-2 py-1 rounded">Duyệt</button>
                            <button onclick="updateStatus(${sv.Id}, 'TuChoi')" class="text-red-500 hover:text-red-700 font-bold text-xs border border-red-500 px-2 py-1 rounded">Từ chối</button>
                        ` : '<span class="text-gray-400 text-xs">Đã xử lý</span>'}
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', html);
        });

    } catch (e) { 
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-red-500">Lỗi tải danh sách.</td></tr>';
    }
}

// 3. Duyệt / Từ chối
async function updateStatus(id, status) {
    if(!confirm(status === 'DaDuyet' ? "Duyệt đơn đăng ký này?" : "Từ chối đơn đăng ký này?")) return;

    try {
        const res = await fetch(`${API_URL}/DuyetDangKy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, TrangThai: status })
        });

        if (res.ok) {
            loadStudentList(); // Tải lại bảng
        } else {
            alert("Lỗi khi cập nhật.");
        }
    } catch (e) { console.error(e); }
}

// 4. Hiện QR Code
function showQRCode() {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${activityId}`;
    document.getElementById('imgQR').src = qrUrl;
    document.getElementById('qrModal').classList.remove('hidden');
}