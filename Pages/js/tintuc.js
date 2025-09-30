// tintuc.js - ĐÃ SỬA VÀ CẬP NHẬT HIỂN THỊ ẢNH VÀ CỘT PHỤ CHI TIẾT HƠN BỞI AI

// KHÔNG KHAI BÁO LẠI API_TIN_TUC_BASE_URL Ở ĐÂY NỮA
// Thay vào đó, chúng ta sẽ dùng window.API_TIN_TUC_BASE_URL đã được định nghĩa trong globalConfig.js

async function loadTinTucs() {
    try {
        const response = await fetch(window.API_TIN_TUC_BASE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tinTucs = await response.json(); 

        const tableBody = document.getElementById('tinTucTableBody'); 
        if (!tableBody) {
            console.warn("Không tìm thấy element có ID 'tinTucTableBody'.");
            return;
        }
        tableBody.innerHTML = ''; 

        if (tinTucs.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Chưa có tin tức nào.</td></tr>`;
            return;
        }

        tinTucs.forEach((tt, index) => {
            // Sử dụng PascalCase cho tên thuộc tính
            const ngayDangFormatted = tt.NgayDang ? new Date(tt.NgayDang).toLocaleDateString('vi-VN') : '';

            // Tạo nội dung hình ảnh hoặc placeholder
            let imageContent = '';
            if (tt.UrlHinhAnh) {
                imageContent = `<img src="${tt.UrlHinhAnh}" alt="Hình ảnh" class="h-10 w-10 object-cover rounded-full inline-block" onerror="this.onerror=null;this.src='https://via.placeholder.com/40?text=NoImg';">`;
            } else {
                imageContent = `<span class="img-placeholder">Không có</span>`;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${tt.TieuDe || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${tt.TenTacGia || ''}</td> 
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${ngayDangFormatted}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 w-img-col">${imageContent}</td> <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" class="text-blue-600 hover:text-blue-900 mr-3" onclick="editTinTuc(${tt.Id})"><i class="fas fa-edit"></i></a>
                    <a href="#" class="text-red-600 hover:text-red-900" onclick="deleteTinTuc(${tt.Id})"><i class="fas fa-trash-alt"></i></a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Lỗi khi tải danh sách tin tức:", error);
        const tableBody = document.getElementById('tinTucTableBody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Không thể tải dữ liệu tin tức. Vui lòng kiểm tra API Backend và CORS.</td></tr>`;
        }
    }
}

// Hàm để tải tin tức mới nhất cho cột bên phải
async function loadRecentNews() {
    try {
        const response = await fetch(window.API_TIN_TUC_BASE_URL); // Gọi API lấy tất cả tin tức
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tinTucs = await response.json();

        const recentNewsList = document.getElementById('recentNewsList');
        if (!recentNewsList) {
            console.warn("Không tìm thấy element có ID 'recentNewsList'.");
            return;
        }
        recentNewsList.innerHTML = ''; // Xóa dữ liệu mẫu

        // Sắp xếp tin tức theo ngày đăng giảm dần và chỉ lấy 5 tin mới nhất
        const sortedNews = tinTucs.sort((a, b) => new Date(b.NgayDang) - new Date(a.NgayDang));
        const top5News = sortedNews.slice(0, 5); // Lấy 5 tin mới nhất

        if (top5News.length === 0) {
            recentNewsList.innerHTML = `<li><p class="text-gray-500 text-sm p-3">Chưa có tin tức mới.</p></li>`;
            return;
        }

        top5News.forEach(tt => {
            const ngayDangFormatted = tt.NgayDang ? new Date(tt.NgayDang).toLocaleDateString('vi-VN') : '';
            const listItem = document.createElement('li');
            listItem.className = 'recent-news-item'; // THÊM CLASS ĐỂ STYLE ĐẸP HƠN
            listItem.innerHTML = `
                <div class="recent-news-icon"><i class="fas fa-bullhorn"></i></div> <div class="recent-news-content">
                    <p class="recent-news-date"><i class="far fa-calendar-alt"></i> ${ngayDangFormatted}</p>
                    <h3 class="recent-news-title">${tt.TieuDe || ''}</h3>
                    <p class="recent-news-summary">${tt.NoiDungTomTat ? tt.NoiDungTomTat.substring(0, 100) + '...' : ''}</p> </div>
            `;
            recentNewsList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Lỗi khi tải tin tức mới nhất:", error);
        const recentNewsList = document.getElementById('recentNewsList');
        if (recentNewsList) {
            recentNewsList.innerHTML = `<li><p class="text-red-500 text-sm p-3">Không thể tải tin tức mới.</p></li>`;
        }
    }
}


function addNewTinTuc() {
    document.getElementById('tinTucModalTitle').textContent = 'Thêm Tin tức Mới';
    document.getElementById('tinTucForm').reset();
    document.getElementById('tinTucId').value = '';
    document.getElementById('tinTucModal').classList.remove('hidden');
    document.getElementById('tinTucModal').classList.add('flex');
}

function closeTinTucModal() {
    document.getElementById('tinTucModal').classList.add('hidden');
    document.getElementById('tinTucModal').classList.remove('flex');
    document.getElementById('tinTucForm').reset();
}

async function saveTinTuc(event) {
    event.preventDefault(); 

    const tinTucId = document.getElementById('tinTucId').value;
    const tieuDe = document.getElementById('tieuDe').value;
    const noiDungTomTat = document.getElementById('noiDungTomTat').value; 
    const tenTacGia = document.getElementById('tenTacGia').value; 
    const ngayDang = document.getElementById('ngayDang').value; 
    const urlHinhAnh = document.getElementById('urlHinhAnh').value; 

    const ngayDangIso = ngayDang ? new Date(ngayDang).toISOString() : null;

    const tinTucData = {
        TieuDe: tieuDe,
        NoiDungTomTat: noiDungTomTat, 
        TenTacGia: tenTacGia, 
        NgayDang: ngayDangIso,
        UrlHinhAnh: urlHinhAnh 
    };

    let url = window.API_TIN_TUC_BASE_URL;
    let method = 'POST';

    if (tinTucId) {
        url = `${window.API_TIN_TUC_BASE_URL}/${tinTucId}`;
        method = 'PUT';
        tinTucData.Id = parseInt(tinTucId); 
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tinTucData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
        }

        alert(`Tin tức đã được ${tinTucId ? 'cập nhật' : 'thêm mới'} thành công!`);
        closeTinTucModal();
        loadTinTucs(); // Tải lại bảng chính
        loadRecentNews(); // Tải lại cột bên phải
    } catch (error) {
        console.error("Lỗi khi lưu tin tức:", error);
        alert(`Không thể ${tinTucId ? 'cập nhật' : 'thêm mới'} tin tức. Lỗi: ` + error.message);
    }
}

async function editTinTuc(id) {
    try {
        const response = await fetch(`${window.API_TIN_TUC_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tinTuc = await response.json();

        document.getElementById('tinTucModalTitle').textContent = 'Sửa Thông tin Tin tức';
        document.getElementById('tinTucId').value = tinTuc.Id; 
        document.getElementById('tieuDe').value = tinTuc.TieuDe;
        document.getElementById('noiDungTomTat').value = tinTuc.NoiDungTomTat || ''; 
        document.getElementById('tenTacGia').value = tinTuc.TenTacGia || ''; 
        
        const ngayDangDate = tinTuc.NgayDang ? new Date(tinTuc.NgayDang) : null;
        const formattedNgayDang = ngayDangDate ? ngayDangDate.toISOString().split('T')[0] : '';
        document.getElementById('ngayDang').value = formattedNgayDang;

        document.getElementById('urlHinhAnh').value = tinTuc.UrlHinhAnh || ''; 

        document.getElementById('tinTucModal').classList.remove('hidden');
        document.getElementById('tinTucModal').classList.add('flex');

    } catch (error) {
        console.error("Lỗi khi tải thông tin tin tức để sửa:", error);
        alert("Không thể tải thông tin tin tức để sửa. Vui lòng kiểm tra API Backend.");
    }
}

async function deleteTinTuc(id) {
    if (confirm(`Bạn có chắc chắn muốn xóa tin tức ID: ${id} không?`)) {
        try {
            const response = await fetch(`${window.API_TIN_TUC_BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert('Xóa tin tức thành công!');
            loadTinTucs(); // Tải lại bảng chính
            loadRecentNews(); // Tải lại cột bên phải
        } catch (error) {
            console.error("Lỗi khi xóa tin tức:", error);
            alert("Không thể xóa tin tức. Vui lòng kiểm tra API Backend và CORS.");
        }
    }
}

// Lắng nghe sự kiện submit của form modal, thay vì onclick trên nút
document.addEventListener('DOMContentLoaded', () => {
    const tinTucForm = document.getElementById('tinTucForm');
    if (tinTucForm) {
        tinTucForm.addEventListener('submit', saveTinTuc);
    } else {
        console.warn("Element with ID 'tinTucForm' not found. Ensure TinTuc.html is loaded and the form exists.");
    }
    loadRecentNews(); // Tải tin tức mới nhất khi trang được tải
});

loadTinTucs(); // Tải bảng chính khi script được tải