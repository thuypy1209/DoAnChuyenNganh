// File: js/admin_quanLySinhVien.js

const API_URL = 'http://localhost:5114/api/SinhViens';

document.addEventListener('DOMContentLoaded', function() {
    loadStudents();

    // Gắn sự kiện cho nút Lọc
    document.getElementById('btnFilter').addEventListener('click', loadStudents);
    
    // Gắn sự kiện Enter cho ô tìm kiếm
    document.getElementById('searchKeyword').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') loadStudents();
    });
});

// 1. TẢI DANH SÁCH SINH VIÊN
async function loadStudents() {
    const keyword = document.getElementById('searchKeyword').value;
    const khoa = document.getElementById('filterKhoa').value;
    const lop = document.getElementById('filterLop').value;

    const tbody = document.getElementById('studentTableBody');
    
    // Hiệu ứng loading
    tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center"><i class="fas fa-spinner fa-spin text-3xl text-blue-900"></i><p class="mt-2 text-gray-500">Đang tính toán điểm rèn luyện...</p></td></tr>';

    try {
        // Gọi API (Não sẽ tự tính điểm)
        const url = `${API_URL}?keyword=${keyword}&khoa=${khoa}&lop=${lop}`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Lỗi tải dữ liệu");

        const data = await response.json();

        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500 italic">Không tìm thấy sinh viên nào phù hợp.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach(sv => {
            // Xử lý màu sắc Xếp loại
            let rankClass = "bg-gray-100 text-gray-600";
            if(sv.xepLoai === "Xuất sắc") rankClass = "bg-purple-100 text-purple-700 border border-purple-200";
            else if(sv.xepLoai === "Giỏi") rankClass = "bg-green-100 text-green-700 border border-green-200";
            else if(sv.xepLoai === "Khá") rankClass = "bg-blue-100 text-blue-700 border border-blue-200";
            else if(sv.xepLoai === "Trung bình") rankClass = "bg-yellow-100 text-yellow-700 border border-yellow-200";
            else rankClass = "bg-red-100 text-red-700 border border-red-200"; // Yếu/Kém

            // Badge SV5T
            const sv5tBadge = sv.datSV5T 
                ? '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold border border-yellow-300 shadow-sm"><i class="fas fa-medal mr-1 text-yellow-600"></i> Đạt chuẩn</span>'
                : '<span class="text-gray-300 text-xs">-</span>';

            const html = `
                <tr class="border-b hover:bg-blue-50 transition-colors group">
                    <td class="p-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                ${getInitials(sv.HoTen)}
                            </div>
                            <div>
                                <p class="font-bold text-gray-800 group-hover:text-blue-800 cursor-pointer" onclick="viewProfile(${sv.Id})">${sv.HoTen}</p>
                                <p class="text-xs text-gray-500 font-mono">${sv.MSSV || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </td>
                    <td class="p-4 text-gray-600 text-sm">
                        <p class="font-bold">${sv.Lop || '---'}</p>
                        <p class="text-xs opacity-75">${sv.Khoa || '---'}</p>
                    </td>
                    <td class="p-4 text-center">
                        <span class="text-lg font-bold text-blue-900">${sv.DiemRenLuyen}</span>
                        <span class="text-xs text-gray-400">/100</span>
                    </td>
                    <td class="p-4 text-center">
                        <span class="${rankClass} px-3 py-1 rounded-full text-xs font-bold uppercase">${sv.XepLoai}</span>
                    </td>
                    <td class="p-4 text-center">${sv5tBadge}</td>
                    <td class="p-4 text-center">
                        <button onclick="viewProfile(${sv.Id})" class="text-blue-600 hover:text-white hover:bg-blue-600 p-2 rounded-lg transition-all" title="Xem hồ sơ chi tiết">
                            <i class="fas fa-id-card-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', html);
        });

    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-red-500">Lỗi kết nối đến máy chủ.</td></tr>';
    }
}

// Hàm lấy chữ cái đầu tên (Ví dụ: Lương Quốc Việt -> V)
function getInitials(name) {
    if(!name) return "?";
    const parts = name.split(" ");
    return parts[parts.length - 1].charAt(0).toUpperCase();
}

// --- XEM CHI TIẾT HỒ SƠ SINH VIÊN ---
async function viewProfile(id) {
    const modal = document.getElementById('studentDetailModal');
    
    // Reset dữ liệu cũ
    document.getElementById('detailName').innerText = "Đang tải...";
    document.getElementById('detailHistoryBody').innerHTML = '<tr><td colspan="4" class="p-4 text-center"><i class="fas fa-spinner fa-spin"></i></td></tr>';
    
    // Hiện modal
    modal.classList.remove('hidden');

    try {
        // Gọi API chi tiết (Đã có trong SinhViensController)
        const res = await fetch(`${API_URL}/${id}`);
        if(!res.ok) throw new Error("Lỗi tải chi tiết");
        
        const data = await res.json();
        const sv = data.ThongTin; // Lấy thông tin cá nhân
        const history = data.LichSu; // Lấy lịch sử hoạt động
        const totalScore = data.TongDiem; // Tổng điểm

        // 1. Điền thông tin cá nhân
        document.getElementById('detailAvatar').innerText = sv.HoTen.charAt(0).toUpperCase();
        document.getElementById('detailName').innerText = sv.HoTen;
        document.getElementById('detailMssv').innerText = sv.MSSV || "---";
        document.getElementById('detailLop').innerText = sv.Lop || "---";
        document.getElementById('detailKhoa').innerText = sv.khoa || "---";
        document.getElementById('detailDob').innerText = new Date(sv.NgaySinh).toLocaleDateString('vi-VN');

        // 2. Điền điểm số
        document.getElementById('detailScore').innerText = totalScore;
        
        let rank = "Trung bình";
        let rankClass = "bg-gray-100 text-gray-600";
        if(totalScore >= 90) { rank = "Xuất sắc"; rankClass = "bg-purple-100 text-purple-700"; }
        else if(totalScore >= 80) { rank = "Giỏi"; rankClass = "bg-green-100 text-green-700"; }
        else if(totalScore >= 65) { rank = "Khá"; rankClass = "bg-blue-100 text-blue-700"; }
        
        const rankBadge = document.getElementById('detailRank');
        rankBadge.innerText = rank;
        rankBadge.className = `px-3 py-1 rounded-full text-xs font-bold ${rankClass}`;

        // 3. Điền lịch sử hoạt động
        const tbody = document.getElementById('detailHistoryBody');
        tbody.innerHTML = '';

        if(history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400 italic">Chưa tham gia hoạt động nào.</td></tr>';
        } else {
            history.forEach(h => {
                let statusBadge = '<span class="text-gray-400">Chưa duyệt</span>';
                if(h.TrangThaiDuyet === 'DaDuyet') statusBadge = '<span class="text-green-600 font-bold"><i class="fas fa-check"></i> Đã cộng</span>';
                else if(h.TrangThaiDuyet === 'TuChoi') statusBadge = '<span class="text-red-500 font-bold">Từ chối</span>';
                else statusBadge = '<span class="text-yellow-600 font-bold">Chờ duyệt</span>';

                const html = `
                    <tr class="hover:bg-gray-50">
                        <td class="p-4 font-medium text-gray-800">${h.TenHoatDong}</td>
                        <td class="p-4 text-gray-500">${new Date(h.NgayBatDau).toLocaleDateString('vi-VN')}</td>
                        <td class="p-4 text-center font-bold text-blue-900">+${h.DiemRenLuyen}</td>
                        <td class="p-4 text-center text-xs">${statusBadge}</td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', html);
            });
        }

    } catch (e) {
        console.error(e);
        alert("Không thể lấy thông tin chi tiết.");
        modal.classList.add('hidden');
    }
}
