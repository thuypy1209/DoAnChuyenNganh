const API_URL = 'http://localhost:5114/api/QuanLySinhVien';

document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
    document.getElementById('btnFilter').addEventListener('click', loadStudents);
    document.getElementById('searchKeyword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadStudents();
    });
});

async function loadStudents() {
    const keyword = document.getElementById('searchKeyword').value;
    const khoa = document.getElementById('filterKhoa').value;
    const lop = document.getElementById('filterLop').value;
    const tbody = document.getElementById('studentTableBody');
    const token = localStorage.getItem('accessToken');

    tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center"><i class="fas fa-spinner fa-spin text-3xl text-blue-900"></i><p class="mt-2 text-gray-500">Đang tải danh sách...</p></td></tr>';

    try {
        const url = `${API_URL}?keyword=${encodeURIComponent(keyword)}&khoa=${khoa}&lop=${lop}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) return window.location.href = 'login.html';
        if (!response.ok) throw new Error("Lỗi tải dữ liệu");

        const data = await response.json();
        tbody.innerHTML = data.length === 0 ? '<tr><td colspan="6" class="p-8 text-center text-gray-500">Không tìm thấy sinh viên.</td></tr>' : '';

        data.forEach(sv => {
            // Đảm bảo lấy đúng tên thuộc tính (ưu tiên kiểm tra cả hoa/thường)
            const hoTen = sv.hoTen || sv.HoTen;
            const mssv = sv.mssv || sv.MSSV;
            const diem = sv.diemRenLuyen || sv.DiemRenLuyen || 0;
            const xepLoai = sv.xepLoai || sv.XepLoai || "Trung bình";

            let rankClass = "bg-gray-100 text-gray-600";
            if(xepLoai === "Xuất sắc") rankClass = "bg-purple-100 text-purple-700 border-purple-200";
            else if(xepLoai === "Giỏi") rankClass = "bg-green-100 text-green-700 border-green-200";
            else if(xepLoai === "Khá") rankClass = "bg-blue-100 text-blue-700 border-blue-200";

            tbody.insertAdjacentHTML('beforeend', `
                <tr class="border-b hover:bg-blue-50 transition-colors">
                    <td class="p-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">${getInitials(hoTen)}</div>
                            <div>
                                <p class="font-bold text-gray-800 cursor-pointer hover:text-blue-600" onclick="viewProfile('${mssv}')">${hoTen}</p>
                                <p class="text-xs text-gray-500">${mssv}</p>
                            </div>
                        </div>
                    </td>
                    <td class="p-4 text-sm font-medium">${sv.lop || sv.Lop}</td>
                    <td class="p-4 text-center font-bold text-blue-900">${diem}</td>
                    <td class="p-4 text-center">
                        <span class="${rankClass} px-3 py-1 rounded-full text-xs font-bold uppercase">${xepLoai}</span>
                    </td>
                    <td class="p-4 text-center">
                        <button onclick="viewProfile('${mssv}')" class="text-blue-600 hover:text-blue-800"><i class="fas fa-id-card-alt text-xl"></i></button>
                    </td>
                </tr>
            `);
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-red-500">Lỗi kết nối Server.</td></tr>';
    }
}

function getInitials(name) {
    if(!name) return "?";
    const parts = name.trim().split(" ");
    return parts[parts.length - 1].charAt(0).toUpperCase();
}