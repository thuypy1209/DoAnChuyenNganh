// File: js/admin_quanLyHoatDong.js

const API_URL = 'http://localhost:5114/api/HoatDongs';

document.addEventListener('DOMContentLoaded', function() {
    loadTable('All');
});

// 1. TẢI DANH SÁCH & VẼ BẢNG
async function loadTable(filter) {
    const tbody = document.getElementById('activityTableBody');
    
    // Cập nhật nút Filter active
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('bg-blue-50', 'text-blue-900', 'bg-gray-100'));
    document.getElementById(`btn${filter}`).classList.add('bg-blue-50', 'text-blue-900');

    tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center"><i class="fas fa-spinner fa-spin text-2xl text-blue-600"></i></td></tr>';

    try {
        const response = await fetch(`${API_URL}?filter=${filter}`);
        const data = await response.json();

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-500 italic">Chưa có hoạt động nào.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach(item => {
            // Màu sắc trạng thái
            const isClosed = item.TrangThaiHienTai === 'KetThuc';
            const statusBadge = isClosed 
                ? '<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">Đã kết thúc</span>'
                : '<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold animate-pulse">Đang mở</span>';
            
            // Màu thanh tiến độ (Đỏ nếu sắp full, Xanh nếu còn nhiều)
            const progressColor = item.PhanTram > 90 ? 'bg-red-500' : (item.PhanTram > 50 ? 'bg-yellow-400' : 'bg-green-500');

            const html = `
                <tr class="border-b hover:bg-blue-50 transition-colors group">
                    <td class="p-4">
                        <p class="font-bold text-blue-900 text-base group-hover:text-blue-700 cursor-pointer" onclick="viewDetail(${item.Id})">${item.TenHoatDong}</p>
                        <p class="text-xs text-gray-400 font-mono mt-1">ID: #${item.Id}</p>
                    </td>
                    <td class="p-4 text-sm text-gray-600">
                        <p><i class="far fa-clock mr-1 text-blue-400"></i> ${new Date(item.NgayBatDau).toLocaleDateString('vi-VN')}</p>
                        <p class="mt-1"><i class="fas fa-map-marker-alt mr-1 text-red-400"></i> ${item.DiaDiem || 'Đang cập nhật'}</p>
                    </td>
                    <td class="p-4 text-center">
                        <span class="block text-xs font-bold text-gray-700 mb-1">${item.LoaiHoatDong}</span>
                        <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">
                            +${item.DiemRenLuyen}đ ${item.TieuChiSV5T}
                        </span>
                    </td>
                    <td class="p-4">
                        <div class="flex justify-between text-xs font-bold text-gray-600 mb-1">
                            <span>${item.SoLuongDaDangKy} / ${item.SoLuongToiDa}</span>
                            <span>${item.PhanTram}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="${progressColor} h-2 rounded-full transition-all duration-1000" style="width: ${item.PhanTram}%"></div>
                        </div>
                    </td>
                    <td class="p-4 text-center space-x-2">
                        <button onclick="viewDetail(${item.Id})" class="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded hover:bg-blue-100" title="Xem chi tiết & Duyệt">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="deleteActivity(${item.Id})" class="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded hover:bg-red-100" title="Xóa">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', html);
        });

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-red-500">Lỗi kết nối API.</td></tr>';
    }
}

// 2. TẠO MỚI HOẠT ĐỘNG (ĐÃ NÂNG CẤP UPLOAD ẢNH)
async function createActivity() {
    // 1. Lấy các giá trị từ ô nhập liệu
    const ten = document.getElementById('newTen').value;
    const ngayBd = document.getElementById('newNgayBd').value;
    const ngayKt = document.getElementById('newNgayKt').value;
    const diaDiem = document.getElementById('newDiaDiem').value;
    const loai = document.getElementById('newLoai').value;
    const tieuChi = document.getElementById('newTieuChi').value;
    const slot = document.getElementById('newSlot').value;
    const diem = document.getElementById('newDiem').value;
    const moTa = document.getElementById('newMoTa').value;
    
    // Lấy file ảnh
    const fileInput = document.getElementById('filePoster');

    // 2. Kiểm tra dữ liệu (Validation)
    if (!ten || !ngayBd) {
        alert("Vui lòng nhập tên và ngày bắt đầu!");
        return;
    }

    // 3. TẠO FORMDATA (Cái thùng hàng để chứa dữ liệu + file)
    const formData = new FormData();
    formData.append('TenHoatDong', ten);
    formData.append('NgayBatDau', ngayBd);
    formData.append('NgayKetThuc', ngayKt);
    formData.append('DiaDiem', diaDiem);
    formData.append('LoaiHoatDong', loai);
    formData.append('TieuChiSV5T', tieuChi);
    formData.append('SoLuongToiDa', slot);
    formData.append('DiemRenLuyen', diem);
    formData.append('MoTa', moTa);
    formData.append('TrangThai', 'DangMo');

    // Quan trọng: Nếu có chọn file thì bỏ file vào thùng hàng
    // 'filePoster' phải trùng tên với [FromForm] IFormFile filePoster trong C#
    if (fileInput.files[0]) {
        formData.append('filePoster', fileInput.files[0]);
    }

    // 4. Gửi lên Server
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: formData // Gửi nguyên thùng hàng đi (Không cần header Content-Type)
        });

        if (res.ok) {
            alert("✅ Tạo hoạt động thành công!");
            closeCreateModal();
            loadTable('All'); // Tải lại bảng
            
            // Reset lại cái khung ảnh về mặc định
            document.getElementById('posterPreview').classList.add('hidden');
            document.getElementById('posterPlaceholder').classList.remove('hidden');
            fileInput.value = ''; // Xóa file đã chọn
            
        } else {
            alert("❌ Lỗi khi tạo hoạt động. Vui lòng kiểm tra lại.");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối Server.");
    }
}

// 3. XÓA HOẠT ĐỘNG
async function deleteActivity(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa hoạt động này? Dữ liệu đăng ký của sinh viên cũng sẽ mất.")) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadTable('All');
        } else {
            alert("Không thể xóa.");
        }
    } catch (e) { alert("Lỗi kết nối."); }
}

// 4. CHUYỂN HƯỚNG SANG TRANG CHI TIẾT
function viewDetail(id) {
    // Chúng ta sẽ làm trang này ở bước sau
    window.location.href = `chiTietHoatDongAdmin.html?id=${id}`;
}

// Helpers Modal
window.openCreateModal = () => document.getElementById('createModal').classList.remove('hidden');
window.closeCreateModal = () => document.getElementById('createModal').classList.add('hidden');
window.filterTable = (status) => loadTable(status);

// --- 5. HÀM XEM TRƯỚC ẢNH KHI UPLOAD (Mới thêm) ---
window.previewPoster = function(input) {
    const preview = document.getElementById('posterPreview');
    const placeholder = document.getElementById('posterPlaceholder');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden'); // Hiện ảnh
            placeholder.classList.add('hidden'); // Ẩn cái icon đám mây đi
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}