// File: js/admin_xetDanhHieu.js

const API_URL = 'http://localhost:5114/api/QuanLySinhVien';

document.addEventListener('DOMContentLoaded', loadDatChuan);

// 1. TẢI DANH SÁCH SINH VIÊN ĐẠT CHUẨN
async function loadDatChuan() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    // Lấy Token để xác thực Admin
    const token = localStorage.getItem('accessToken'); 
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Hiệu ứng loading cho chuyên nghiệp
    tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center"><i class="fas fa-spinner fa-spin mr-2"></i>Đang quét dữ liệu...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/DatChuan`, {
            headers: {
                'Authorization': `Bearer ${token}` // <--- QUAN TRỌNG: Phải có token
            }
        });
        
        if (response.status === 401) {
            alert("Phiên làm việc hết hạn, vui lòng đăng nhập lại!");
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) throw new Error("Không thể tải danh sách");

        const data = await response.json();

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-red-500 font-bold">Chưa có sinh viên nào đạt chuẩn (Điểm >= 80).</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach(sv => {
            // Kiểm tra Case Sensitivity (Viết hoa/thường của JSON trả về)
            const hoTen = sv.hoTen || sv.HoTen;
            const mssv = sv.mssv || sv.MSSV;
            const diem = sv.diemRenLuyen || sv.DiemRenLuyen;
            const xepLoai = sv.xepLoai || sv.XepLoai;

            const html = `
                <tr class="border-b hover:bg-yellow-50 transition-colors">
                    <td class="p-4 text-center">
                        <input type="checkbox" class="sv-checkbox w-5 h-5 text-blue-600 rounded" value="${mssv}">
                    </td>
                    <td class="p-4 font-bold text-gray-800">
                        ${hoTen} <br> <span class="text-xs font-normal text-gray-500">${mssv}</span>
                    </td>
                    <td class="p-4 text-gray-600">${sv.lop || sv.Lop || '---'}</td>
                    <td class="p-4 text-center font-extrabold text-xl text-blue-900">${diem}</td>
                    <td class="p-4 text-center">
                        <span class="bg-green-100 text-green-700 px-2 py-1 rounded font-bold text-xs uppercase">${xepLoai}</span>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', html);
        });

        const countText = document.querySelector('p.text-sm');
        if (countText) countText.innerText = `Tìm thấy ${data.length} sinh viên đạt chuẩn (Điểm >= 80)`;

    } catch (e) {
        console.error("❌ Lỗi loadDatChuan:", e);
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-red-500">Lỗi kết nối API hoặc không tìm thấy dữ liệu.</td></tr>';
    }
}

// 2. CHỌN TẤT CẢ (Hàm này em giữ nguyên là đúng rồi)
function toggleAll(source) {
    const checkboxes = document.querySelectorAll('.sv-checkbox');
    checkboxes.forEach(cb => cb.checked = source.checked);
}

// 3. CẤP DANH HIỆU (GỬI API)
async function capDanhHieu() {
    const checkboxes = document.querySelectorAll('.sv-checkbox:checked');
    const inputTen = document.getElementById('txtTenDanhHieu');
    const tenDanhHieu = inputTen ? inputTen.value.trim() : "";
    const token = localStorage.getItem('accessToken');
    
    if (checkboxes.length === 0) {
        alert("Vui lòng chọn ít nhất 1 sinh viên!");
        return;
    }

    if (!tenDanhHieu) {
        alert("Vui lòng nhập tên danh hiệu (Ví dụ: Sinh viên 5 tốt)!");
        inputTen?.focus();
        return;
    }

    const listMSSV = Array.from(checkboxes).map(cb => cb.value);

    if(!confirm(`Bạn có chắc chắn muốn cấp "${tenDanhHieu}" cho ${listMSSV.length} sinh viên này không?`)) return;

    try {
        const res = await fetch(`${API_URL}/CapDanhHieu`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // <--- Admin mới được quyền cấp
            },
            body: JSON.stringify({ 
                danhSachMSSV: listMSSV, 
                tenDanhHieu: tenDanhHieu 
            })
        });

        if (res.ok) {
            const result = await res.json();
            alert("🎉 " + result.message);
            location.reload(); 
        } else {
            const errorText = await res.text();
            alert("Lỗi từ server: " + errorText);
        }

    } catch (e) {
        console.error("❌ Lỗi cấp danh hiệu:", e);
        alert("Lỗi kết nối khi cấp bằng.");
    }
}