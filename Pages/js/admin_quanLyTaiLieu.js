// File: js/admin_quanLyTaiLieu.js

const API_BASE = 'http://localhost:5114'; // Cổng Server API của em
const API_URL = `${API_BASE}/api/TaiLieus`;

document.addEventListener('DOMContentLoaded', loadDocs);

// 1. Hiển thị tên file khi chọn (Cho đẹp)
function displayFileName(input) {
    const display = document.getElementById('fileNameDisplay');
    if (input.files && input.files[0]) {
        display.innerText = input.files[0].name;
        display.classList.add('text-green-600', 'font-bold');
    } else {
        display.innerText = "Click chọn file";
        display.classList.remove('text-green-600', 'font-bold');
    }
}

// 2. TẢI DANH SÁCH TÀI LIỆU
async function loadDocs() {
    const tbody = document.getElementById('docTableBody');
    if (!tbody) return; // Tránh lỗi nếu không tìm thấy bảng

    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Lỗi kết nối Server");

        const data = await res.json();
        
        // Cập nhật số lượng
        document.getElementById('docCount').innerText = `${data.length} tài liệu`;
        
        tbody.innerHTML = '';

        if(data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-400">Chưa có tài liệu nào.</td></tr>';
            return;
        }

        data.forEach((item, index) => {
            // Xử lý ngày tháng
            const date = new Date(item.ngayDang || item.NgayDang).toLocaleDateString('vi-VN');
            
            // 👇 QUAN TRỌNG: SỬA LỖI LINK 404 TẠI ĐÂY 👇
            // Lấy đường dẫn từ API
            let link = item.duongDanUrl || item.DuongDanUrl || '#';
            // Nếu đường dẫn là tương đối (bắt đầu bằng /), nối thêm domain vào
            if (link !== '#' && !link.startsWith('http')) {
                link = API_BASE + link;
            }
            // 👆-------------------------------------------

            const name = item.tenTaiLieu || item.TenTaiLieu;
            const type = item.loaiTaiLieu || item.LoaiTaiLieu;
            const id = item.id || item.Id;

            // Màu sắc badge
            let badgeClass = 'bg-gray-100 text-gray-600';
            if((type||'').includes('Biểu mẫu')) badgeClass = 'bg-green-100 text-green-700';
            if((type||'').includes('Quyết định')) badgeClass = 'bg-red-100 text-red-700';

            const html = `
                <tr class="border-b hover:bg-gray-50 group transition-colors">
                    <td class="px-6 py-4 font-mono text-gray-400 text-xs">${index + 1}</td>
                    <td class="px-6 py-4">
                        <a href="${link}" target="_blank" class="font-bold text-blue-900 hover:underline flex items-center gap-2">
                            <i class="far fa-file-alt text-gray-400"></i> ${name}
                        </a>
                        <button onclick="navigator.clipboard.writeText('${link}')" class="text-[10px] text-gray-400 hover:text-blue-500 mt-1 cursor-pointer">
                            <i class="fas fa-link"></i> Copy Link
                        </button>
                    </td>
                    <td class="px-6 py-4">
                        <span class="${badgeClass} px-2 py-1 rounded text-xs font-bold uppercase border border-transparent">
                            ${type}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-xs text-gray-500">
                        <i class="far fa-calendar-alt mr-1"></i> ${date}
                    </td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="deleteDoc(${id})" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors" title="Xóa">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', html);
        });

    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Lỗi kết nối API!</td></tr>';
    }
}

// 3. UPLOAD TÀI LIỆU
async function uploadDoc() {
    const name = document.getElementById('txtName').value;
    const type = document.getElementById('txtType').value;
    const desc = document.getElementById('txtDesc').value;
    const fileInput = document.getElementById('fileInput');

    if (!name || !fileInput.files[0]) {
        Swal.fire('Thiếu thông tin', 'Vui lòng nhập tên và chọn file!', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('TenTaiLieu', name);
    formData.append('LoaiTaiLieu', type);
    formData.append('MoTa', desc);
    // Lưu ý: Bên TaiLieusController em đặt tên biến nhận file là gì? 
    // Thường là 'fileTaiLieu' hoặc 'file'. Hãy thử 'fileTaiLieu' trước.
    formData.append('fileTaiLieu', fileInput.files[0]); 

    Swal.fire({ title: 'Đang tải lên...', didOpen: () => Swal.showLoading() });

    try {
        const res = await fetch(API_URL, { method: 'POST', body: formData });
        
        if (res.ok) {
            Swal.fire('Thành công', 'Đã tải lên tài liệu mới!', 'success');
            // Reset form
            document.getElementById('txtName').value = '';
            document.getElementById('txtDesc').value = '';
            fileInput.value = '';
            document.getElementById('fileNameDisplay').innerText = 'Click chọn file';
            loadDocs(); // Tải lại bảng
        } else {
            Swal.fire('Lỗi', 'Server không nhận file.', 'error');
        }
    } catch (e) {
        console.error(e);
        Swal.fire('Lỗi', 'Không thể kết nối Server.', 'error');
    }
}

// 4. XÓA TÀI LIỆU
async function deleteDoc(id) {
    const result = await Swal.fire({
        title: 'Xóa tài liệu này?',
        text: "Hành động này không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa ngay'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                Swal.fire('Đã xóa!', '', 'success');
                loadDocs();
            } else {
                Swal.fire('Lỗi', 'Không thể xóa.', 'error');
            }
        } catch (e) {
            Swal.fire('Lỗi', 'Lỗi kết nối.', 'error');
        }
    }
}