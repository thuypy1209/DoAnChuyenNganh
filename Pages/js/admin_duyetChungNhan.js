// File: js/admin_duyetChungNhan.js

const API_URL = 'http://localhost:5114/api/ChungNhans';

document.addEventListener('DOMContentLoaded', () => loadRequests('ChoDuyet'));

// 1. TẢI DANH SÁCH YÊU CẦU
async function loadRequests(status) {
    // Update UI nút bấm
    document.querySelectorAll('button').forEach(b => {
        if(b.id.startsWith('btn')) {
            b.classList.remove('bg-blue-100', 'text-blue-800');
            b.classList.add('text-gray-500');
        }
    });
    const btn = document.getElementById(`btn${status}`);
    if(btn) {
        btn.classList.add('bg-blue-100', 'text-blue-800');
        btn.classList.remove('text-gray-500');
    }

    const tbody = document.getElementById('requestTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center"><i class="fas fa-spinner fa-spin"></i></td></tr>';

    try {
        const res = await fetch(`${API_URL}/DanhSachYeuCau?status=${status}`);
        const data = await res.json();

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-500 italic">Không có dữ liệu.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach(item => {
            // Link minh chứng
            const linkProof = item.MinhChungUrl 
                ? `<a href="${item.MinhChungUrl}" target="_blank" class="text-blue-600 hover:underline flex items-center justify-center gap-1"><i class="fas fa-external-link-alt"></i> Xem</a>` 
                : '<span class="text-gray-400">-</span>';

            // Nút thao tác (Chỉ hiện nếu đang chờ duyệt)
            let actions = '<span class="text-gray-400 italic text-xs">Đã xử lý</span>';
            if (status === 'ChoDuyet') {
                actions = `
                    <div class="flex justify-center gap-2">
                        <button onclick="approveRequest(${item.Id})" class="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 font-bold text-xs shadow">
                            <i class="fas fa-check mr-1"></i> CẤP BẰNG
                        </button>
                        <button onclick="rejectRequest(${item.Id})" class="bg-red-100 text-red-600 px-3 py-1.5 rounded hover:bg-red-200 font-bold text-xs border border-red-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            }

            const html = `
                <tr class="border-b hover:bg-purple-50 transition-colors">
                    <td class="p-4">
                        <p class="font-bold text-gray-800">${item.TenSinhVien}</p>
                        <p class="text-xs text-gray-500 font-mono">${item.MSSV}</p>
                        <p class="text-xs text-gray-400 mt-1">${new Date(item.NgayGui).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td class="p-4 font-semibold text-blue-900">
                        ${item.TenHoatDong}
                    </td>
                    <td class="p-4 text-gray-600 text-sm">
                        <span class="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold border border-gray-300">${item.LoaiChungNhan || 'Khác'}</span>
                        <p class="mt-1 italic text-xs">"${item.LyDo || 'Không có lý do'}"</p>
                    </td>
                    <td class="p-4 text-center">
                        ${linkProof}
                    </td>
                    <td class="p-4 text-center">
                        ${actions}
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

// 2. DUYỆT (CẤP BẰNG)
async function approveRequest(id) {
    if(!confirm("Xác nhận cấp chứng nhận cho sinh viên này? Hệ thống sẽ tự động tạo bằng khen vào ví của họ.")) return;

    try {
        const res = await fetch(`${API_URL}/Duyet/${id}`, { method: 'POST' });
        if(res.ok) {
            alert("✅ Đã cấp chứng nhận thành công!");
            loadRequests('ChoDuyet'); // Load lại danh sách
        } else {
            alert("Lỗi khi cấp bằng.");
        }
    } catch (e) { console.error(e); }
}

// 3. TỪ CHỐI
async function rejectRequest(id) {
    if(!confirm("Bạn có chắc chắn muốn từ chối yêu cầu này?")) return;

    try {
        const res = await fetch(`${API_URL}/TuChoi/${id}`, { method: 'POST' });
        if(res.ok) {
            loadRequests('ChoDuyet');
        } else {
            alert("Lỗi.");
        }
    } catch (e) { console.error(e); }
}