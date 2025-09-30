// lichThi.js - ĐÃ SỬA VÀ CẬP NHẬT HIỂN THỊ CỘT PHỤ CHI TIẾT HƠN BỞI AI

// KHÔNG KHAI BÁO LẠI API_LICH_THI_BASE_URL Ở ĐÂY NỮA
// Thay vào đó, chúng ta sẽ dùng window.API_LICH_THI_BASE_URL đã được định nghĩa trong globalConfig.js

async function loadLichThis() {
    try {
        const response = await fetch(window.API_LICH_THI_BASE_URL); // Sử dụng biến từ globalConfig.js
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const lichThis = await response.json(); 

        const tableBody = document.getElementById('lichThiTableBody'); 
        if (!tableBody) {
            console.warn("Không tìm thấy element có ID 'lichThiTableBody'.");
            return;
        }
        tableBody.innerHTML = ''; 

        if (lichThis.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">Chưa có lịch thi/lớp tín chỉ nào.</td></tr>`;
            return;
        }

        lichThis.forEach((lt, index) => {
            // SỬA LẠI TÊN THUỘC TÍNH (PROPERTY NAMES) TỪ camelCase SANG PascalCase ĐỂ KHỚP VỚI JSON
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${lt.TenMonHoc || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${lt.MaLop || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${lt.GiangVien || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${lt.ThoiGian || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${lt.DiaDiem || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${lt.SiSo || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" class="text-blue-600 hover:text-blue-900 mr-3" onclick="editLichThi(${lt.Id})"><i class="fas fa-edit"></i></a>
                    <a href="#" class="text-red-600 hover:text-red-900" onclick="deleteLichThi(${lt.Id})"><i class="fas fa-trash-alt"></i></a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Lỗi khi tải danh sách lịch thi:", error);
        const tableBody = document.getElementById('lichThiTableBody');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="8" class="px-6 py-4 text-center text-red-500">Không thể tải dữ liệu lịch thi. Vui lòng kiểm tra API Backend và CORS.</td></tr>`;
        }
    }
}

// Hàm để tải lịch thi mới nhất cho cột bên phải
async function loadRecentLichThi() {
    try {
        const response = await fetch(window.API_LICH_THI_BASE_URL); // Gọi API lấy tất cả lịch thi
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const lichThis = await response.json();

        const recentLichThiList = document.getElementById('recentLichThiList');
        if (!recentLichThiList) {
            console.warn("Không tìm thấy element có ID 'recentLichThiList'.");
            return;
        }
        recentLichThiList.innerHTML = ''; // Xóa dữ liệu mẫu

        // Sắp xếp lịch thi theo một tiêu chí (ví dụ: thời gian gần nhất) và chỉ lấy 5 mục mới nhất
        // Giả sử có một trường ngày/thời gian cụ thể để sắp xếp
        const sortedLichThi = lichThis.sort((a, b) => {
            // Cần có một trường ngày/thời gian chính xác trong API để sắp xếp
            // Ví dụ: nếu có lt.NgayTao, thì new Date(b.NgayTao) - new Date(a.NgayTao)
            // Hiện tại đang sắp xếp dựa trên thời gian chuỗi ThoiGian (có thể không chính xác về thứ tự thời gian)
            return String(b.ThoiGian).localeCompare(String(a.ThoiGian)); // Sắp xếp theo chuỗi thời gian
        });
        const top5LichThi = sortedLichThi.slice(0, 5); // Lấy 5 lịch thi mới nhất/nổi bật

        if (top5LichThi.length === 0) {
            recentLichThiList.innerHTML = `<li><p class="text-gray-500 text-sm p-3">Chưa có thông báo lịch thi mới.</p></li>`;
            return;
        }

        top5LichThi.forEach(lt => {
            const listItem = document.createElement('li');
            listItem.className = 'recent-news-item'; // Dùng lại class CSS từ tin tức
            listItem.innerHTML = `
                <div class="recent-news-icon"><i class="fas fa-calendar-check"></i></div> <div class="recent-news-content">
                    <p class="recent-news-date"><i class="far fa-clock"></i> ${lt.ThoiGian || ''}</p> <h3 class="recent-news-title">${lt.TenMonHoc || ''} - ${lt.MaLop || ''}</h3> <p class="recent-news-summary">Giảng viên: ${lt.GiangVien || ''} | Địa điểm: ${lt.DiaDiem || ''}</p> </div>
            `;
            recentLichThiList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Lỗi khi tải lịch thi mới nhất:", error);
        const recentLichThiList = document.getElementById('recentLichThiList');
        if (recentLichThiList) {
            recentLichThiList.innerHTML = `<li><p class="text-red-500 text-sm p-3">Không thể tải thông báo lịch thi.</p></li>`;
        }
    }
}


function addNewLichThi() {
    document.getElementById('lichThiModalTitle').textContent = 'Thêm Lịch thi mới';
    document.getElementById('lichThiForm').reset(); 
    document.getElementById('lichThiId').value = ''; 
    document.getElementById('lichThiModal').classList.remove('hidden'); 
    document.getElementById('lichThiModal').classList.add('flex');
}

function closeLichThiModal() {
    document.getElementById('lichThiModal').classList.add('hidden'); 
    document.getElementById('lichThiModal').classList.remove('flex');
    document.getElementById('lichThiForm').reset(); 
}

async function saveLichThi(event) {
    event.preventDefault(); 

    const lichThiId = document.getElementById('lichThiId').value;
    const tenMonHoc = document.getElementById('tenMonHoc').value;
    const maLop = document.getElementById('maLop').value;
    const giangVien = document.getElementById('giangVien').value;
    const thoiGian = document.getElementById('thoiGian').value;
    const diaDiem = document.getElementById('diaDiem').value;
    const siSo = parseInt(document.getElementById('siSo').value); 

    const lichThiData = {
        TenMonHoc: tenMonHoc, 
        MaLop: maLop,
        GiangVien: giangVien,
        ThoiGian: thoiGian,
        DiaDiem: diaDiem,
        SiSo: siSo
    };

    let url = window.API_LICH_THI_BASE_URL; 
    let method = 'POST'; 

    if (lichThiId) { 
        url = `${window.API_LICH_THI_BASE_URL}/${lichThiId}`;
        method = 'PUT';
        lichThiData.Id = parseInt(lichThiId); 
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(lichThiData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
        }

        alert(`Lịch thi đã được ${lichThiId ? 'cập nhật' : 'thêm mới'} thành công!`);
        closeLichThiModal(); 
        
        loadLichThis(); // Tải lại bảng chính
        loadRecentLichThi(); // Tải lại cột bên phải
    } catch (error) {
        console.error("Lỗi khi lưu lịch thi:", error);
        alert(`Không thể ${lichThiId ? 'cập nhật' : 'thêm mới'} lịch thi. Lỗi: ` + error.message);
    }
}

async function editLichThi(id) {
    try {
        const response = await fetch(`${window.API_LICH_THI_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const lichThi = await response.json();

        document.getElementById('lichThiModalTitle').textContent = 'Sửa Lịch thi';
        document.getElementById('lichThiId').value = lichThi.Id; 
        document.getElementById('tenMonHoc').value = lichThi.TenMonHoc; 
        document.getElementById('maLop').value = lichThi.MaLop; 
        document.getElementById('giangVien').value = lichThi.GiangVien; 
        document.getElementById('thoiGian').value = lichThi.ThoiGian; 
        document.getElementById('diaDiem').value = lichThi.DiaDiem; 
        document.getElementById('siSo').value = lichThi.SiSo; 

        document.getElementById('lichThiModal').classList.remove('hidden');
        document.getElementById('lichThiModal').classList.add('flex');

    } catch (error) {
        console.error("Lỗi khi tải thông tin lịch thi để sửa:", error);
        alert("Không thể tải thông tin lịch thi để sửa. Vui lòng kiểm tra API Backend.");
    }
} 

async function deleteLichThi(id) {
    if (confirm(`Bạn có chắc chắn muốn xóa lịch thi ID: ${id} không?`)) {
        try {
            const response = await fetch(`${window.API_LICH_THI_BASE_URL}/${id}`, {
                method: 'DELETE' 
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert('Xóa lịch thi thành công!');
            loadLichThis(); 
            loadRecentLichThi(); // Tải lại cột bên phải
        } catch (error) {
            console.error("Lỗi khi xóa lịch thi:", error);
            alert("Không thể xóa lịch thi. Vui lòng kiểm tra API Backend và CORS.");
        }
    }
}

// Lắng nghe sự kiện submit của form modal, thay vì onclick trên nút
document.addEventListener('DOMContentLoaded', () => {
    const lichThiForm = document.getElementById('lichThiForm');
    if (lichThiForm) {
        lichThiForm.addEventListener('submit', saveLichThi);
    } else {
        console.warn("Element with ID 'lichThiForm' not found. Ensure LichThi.html is loaded and the form exists.");
    }
    loadRecentLichThi(); // Tải tin tức mới nhất khi trang được tải
});


loadLichThis();