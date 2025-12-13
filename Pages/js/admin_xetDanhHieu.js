// File: js/admin_xetDanhHieu.js

const API_URL = 'http://localhost:5114/api/SinhViens';

document.addEventListener('DOMContentLoaded', loadDatChuan);

// 1. TẢI DANH SÁCH ĐẠT CHUẨN
async function loadDatChuan() {
    const tbody = document.getElementById('tableBody');
    
    try {
        const res = await fetch(`${API_URL}/DatChuan`);
        const data = await res.json();

        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-red-500 font-bold">Chưa có sinh viên nào đạt chuẩn.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach(sv => {
            const html = `
                <tr class="border-b hover:bg-yellow-50 transition-colors">
                    <td class="p-4 text-center">
                        <input type="checkbox" class="sv-checkbox w-5 h-5 text-blue-600 rounded" value="${sv.MSSV}">
                    </td>
                    <td class="p-4 font-bold text-gray-800">
                        ${sv.HoTen} <br> <span class="text-xs font-normal text-gray-500">${sv.MSSV}</span>
                    </td>
                    <td class="p-4 text-gray-600">${sv.Lop}</td>
                    <td class="p-4 text-center font-extrabold text-xl text-blue-900">${sv.DiemRenLuyen}</td>
                    <td class="p-4 text-center"><span class="bg-green-100 text-green-700 px-2 py-1 rounded font-bold text-xs uppercase">${sv.XepLoai}</span></td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', html);
        });

        // Cập nhật số lượng tìm thấy
        document.querySelector('p.text-sm').innerText = `Tìm thấy ${data.length} sinh viên đạt chuẩn (Điểm >= 80)`;

    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-red-500">Lỗi kết nối API.</td></tr>';
    }
}

// 2. CHỌN TẤT CẢ
function toggleAll(source) {
    const checkboxes = document.querySelectorAll('.sv-checkbox');
    checkboxes.forEach(cb => cb.checked = source.checked);
}

// 3. CẤP DANH HIỆU (GỬI API)
async function capDanhHieu() {
    const checkboxes = document.querySelectorAll('.sv-checkbox:checked');
    const tenDanhHieu = document.getElementById('txtTenDanhHieu').value;
    
    if (checkboxes.length === 0) {
        alert("Vui lòng chọn ít nhất 1 sinh viên!");
        return;
    }

    // Lấy danh sách MSSV đã chọn
    const listMSSV = Array.from(checkboxes).map(cb => cb.value);

    if(!confirm(`Bạn có chắc chắn muốn cấp "${TenDanhHieu}" cho ${listMSSV.length} sinh viên này không?`)) return;

    try {
        const res = await fetch(`${API_URL}/CapDanhHieu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                danhSachMSSV: listMSSV, 
                tenDanhHieu: tenDanhHieu 
            })
        });

        const result = await res.json();
        if (res.ok) {
            alert("🎉 " + result.message);
            // Chuyển sang trang quản lý chứng nhận để xem kết quả (nếu muốn)
            // window.location.href = 'duyetChungNhan.html';
        } else {
            alert("Lỗi: " + result);
        }

    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối khi cấp bằng.");
    }
}