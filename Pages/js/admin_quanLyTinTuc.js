const API_URL = 'http://localhost:5114/api/TinTucs';

document.addEventListener('DOMContentLoaded', loadNews);

// 1. Tải danh sách tin tức
async function loadNews() {
    const tbody = document.getElementById('newsTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">Đang tải...</td></tr>';

    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        tbody.innerHTML = '';
        data.forEach(item => {
            const date = new Date(item.NgayDang).toLocaleDateString('vi-VN');
            const img = item.HinhAnhUrl || '../images/banner1.jpg'; // Ảnh mặc định

            const html = `
                <tr class="border-b hover:bg-gray-50">
                    <td class="px-5 py-4 text-sm text-gray-500">#${item.Id}</td>
                    <td class="px-5 py-4">
                        <img src="${img}" class="w-16 h-10 object-cover rounded shadow-sm">
                    </td>
                    <td class="px-5 py-4">
                        <p class="text-blue-900 font-bold hover:underline cursor-pointer">${item.TieuDe}</p>
                        <p class="text-gray-500 text-xs mt-1 truncate w-64">${item.TomTat || ''}</p>
                    </td>
                    <td class="px-5 py-4 text-sm text-gray-600">${date}</td>
                    <td class="px-5 py-4 text-center">
                        <button onclick="deleteNews(${item.Id})" class="text-red-500 hover:text-red-700 bg-red-100 p-2 rounded">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', html);
        });
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500 p-4">Lỗi tải dữ liệu.</td></tr>';
    }
}

// 2. Lưu tin tức mới (Dùng FormData để gửi file)
async function saveNews() {
    const tieuDe = document.getElementById('txtTieuDe').value;
    const tomTat = document.getElementById('txtTomTat').value;
    const noiDung = document.getElementById('txtNoiDung').value;
    const fileInput = document.getElementById('fileAnh');

    if (!tieuDe) {
        alert("Vui lòng nhập tiêu đề!");
        return;
    }

    const formData = new FormData();
    formData.append('TieuDe', tieuDe);
    formData.append('TomTat', tomTat);
    formData.append('NoiDung', noiDung);
    
    if (fileInput.files[0]) {
        formData.append('fileHinhAnh', fileInput.files[0]);
    }

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            alert("✅ Đăng bài thành công!");
            closeModal();
            loadNews(); // Tải lại bảng
            
            // Reset form
            document.getElementById('txtTieuDe').value = '';
            document.getElementById('txtTomTat').value = '';
            document.getElementById('txtNoiDung').value = '';
            fileInput.value = '';
        } else {
            alert("Lỗi khi đăng bài.");
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi kết nối.");
    }
}

// 3. Xóa tin tức
async function deleteNews(id) {
    if(!confirm("Bạn chắc chắn muốn xóa tin này?")) return;
    
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if(res.ok) loadNews();
    } catch(e) { alert("Lỗi khi xóa."); }
}

// Modal Helpers
window.openModal = () => document.getElementById('newsModal').classList.remove('hidden');
window.closeModal = () => document.getElementById('newsModal').classList.add('hidden');