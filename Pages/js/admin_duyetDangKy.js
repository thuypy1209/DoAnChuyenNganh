// File: js/admin_duyetDangKy.js

const API_URL = 'http://localhost:5114/api/HoatDongs';

document.addEventListener('DOMContentLoaded', loadPendingList);

// 1. TẢI DANH SÁCH CHỜ DUYỆT
async function loadPendingList() {
    const tbody = document.getElementById('tableBody');
    
    try {
        const res = await fetch(`${API_URL}/DanhSachChoDuyet`);
        const data = await res.json();

        // Cập nhật số lượng badge
        document.getElementById('pendingCount').innerText = data.length;

        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-500 italic"><i class="fas fa-check-circle text-green-500 text-2xl block mb-2"></i> Tuyệt vời! Đã xử lý hết các đơn đăng ký.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach(item => {
            // Xử lý link minh chứng
            const MinhChungBtn = item.MinhChungUrl 
                ? `<a href="${item.MinhChungUrl}" target="_blank" class="text-blue-600 hover:underline"><i class="fas fa-link"></i> Xem file</a>` 
                : '<span class="text-gray-400 italic">Không có</span>';

            const html = `
                <tr class="border-b hover:bg-blue-50 transition-colors">
                    <td class="p-4">
                        <p class="font-bold text-gray-800">${item.TenSinhVien}</p>
                        <p class="text-xs text-gray-500 font-mono">${item.MSSV}</p>
                    </td>
                    <td class="p-4 font-semibold text-blue-900">
                        ${item.TenHoatDong}
                    </td>
                    <td class="p-4 text-gray-600">
                        ${new Date(item.NgayDangKy).toLocaleString('vi-VN')}
                    </td>
                    <td class="p-4 text-center">
                        ${MinhChungBtn}
                    </td>
                    <td class="p-4 text-center">
                        <div class="flex justify-center gap-2">
                            <button onclick="processRequest(${item.Id}, 'DaDuyet')" class="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-green-200 border border-green-300 flex items-center">
                                <i class="fas fa-check mr-1"></i> DUYỆT
                            </button>
                            <button onclick="openRejectModal(${item.Id})" class="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-red-200 border border-red-300 flex items-center">
                                <i class="fas fa-times mr-1"></i> TỪ CHỐI
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', html);
        });

    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-red-500">Lỗi kết nối API.</td></tr>';
    }
}

// 2. XỬ LÝ DUYỆT NGAY
async function processRequest(id, status, lyDo = "") {
    if(status === 'DaDuyet' && !confirm("Xác nhận duyệt đơn đăng ký này? Sinh viên sẽ được cộng điểm ngay.")) return;

    try {
        const res = await fetch(`${API_URL}/DuyetDangKy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, trangThai: status, lyDo: lyDo })
        });

        if (res.ok) {
            // alert("Thành công!"); // Bỏ alert cho đỡ phiền, tự load lại là được
            loadPendingList(); // Tải lại danh sách
        } else {
            alert("Có lỗi xảy ra.");
        }
    } catch (e) { console.error(e); }
}

// 3. XỬ LÝ TỪ CHỐI (Mở Modal)
function openRejectModal(id) {
    document.getElementById('rejectId').value = id;
    document.getElementById('txtLyDo').value = ''; // Reset lý do cũ
    document.getElementById('rejectModal').classList.remove('hidden');
}

// 4. XÁC NHẬN TỪ CHỐI
function confirmReject() {
    const id = document.getElementById('rejectId').value;
    const lyDo = document.getElementById('txtLyDo').value;

    if (!lyDo) {
        alert("Vui lòng nhập lý do từ chối!");
        return;
    }

    processRequest(id, 'TuChoi', lyDo);
    document.getElementById('rejectModal').classList.add('hidden');
}