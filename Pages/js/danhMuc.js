// danhMuc.js - ĐÃ SỬA VÀ THIẾT KẾ LẠI GIAO DIỆN BỞI AI

// KHÔNG KHAI BÁO LẠI API_DANH_MUC_BASE_URL Ở ĐÂY NỮA
// Thay vào đó, chúng ta sẽ dùng window.API_DANH_MUC_BASE_URL đã được định nghĩa trong globalConfig.js

async function loadDanhMucs() {
    try {
        const response = await fetch(window.API_DANH_MUC_BASE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const danhMucs = await response.json(); 

        const danhMucListContainer = document.getElementById('danhMucListContainer'); // Lấy container mới
        if (!danhMucListContainer) {
            console.warn("Không tìm thấy element có ID 'danhMucListContainer'.");
            return;
        }
        danhMucListContainer.innerHTML = ''; // Xóa dữ liệu mẫu/cũ

        if (danhMucs.length === 0) {
            danhMucListContainer.innerHTML = `<div class="md:col-span-full card-base p-6 text-center text-gray-500">Chưa có danh mục nào.</div>`; // Dùng md:col-span-full để căn giữa
            return;
        }

        danhMucs.forEach((dm) => {
            const card = document.createElement('div');
            card.className = 'category-card'; // Dùng class mới cho card
            card.innerHTML = `
                <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2 hutech-font-title">${dm.TenDanhMuc || ''}</h3>
                    <p class="text-gray-600 text-sm hutech-font-body">${dm.MoTa || ''}</p>
                </div>
                <div class="flex justify-end space-x-2 mt-4">
                    <button class="text-blue-600 hover:text-blue-800" onclick="editDanhMuc(${dm.Id})"><i class="fas fa-edit"></i> Sửa</button>
                    <button class="text-red-600 hover:text-red-800" onclick="deleteDanhMuc(${dm.Id})"><i class="fas fa-trash-alt"></i> Xóa</button>
                </div>
            `;
            danhMucListContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Lỗi khi tải danh sách danh mục:", error);
        const danhMucListContainer = document.getElementById('danhMucListContainer');
        if (danhMucListContainer) {
            danhMucListContainer.innerHTML = `<div class="md:col-span-full card-base p-6 text-center text-red-500">Không thể tải dữ liệu danh mục. Vui lòng kiểm tra API Backend và CORS.</div>`;
        }
    }
}

// Hàm mở modal và reset form để thêm mới danh mục
function addNewDanhMuc() {
    document.getElementById('danhMucModalTitle').textContent = 'Thêm Danh mục mới';
    document.getElementById('danhMucForm').reset(); 
    document.getElementById('danhMucId').value = ''; 
    document.getElementById('danhMucModal').classList.remove('hidden'); 
    document.getElementById('danhMucModal').classList.add('flex');
}

// Hàm đóng modal danh mục
function closeDanhMucModal() {
    document.getElementById('danhMucModal').classList.add('hidden'); 
    document.getElementById('danhMucModal').classList.remove('flex');
    document.getElementById('danhMucForm').reset(); 
}

async function saveDanhMuc(event) {
    event.preventDefault(); 

    const danhMucId = document.getElementById('danhMucId').value;
    const tenDanhMuc = document.getElementById('tenDanhMuc').value;
    const moTa = document.getElementById('moTa').value;

    const danhMucData = {
        TenDanhMuc: tenDanhMuc, // PascalCase
        MoTa: moTa              // PascalCase
    };

    let url = window.API_DANH_MUC_BASE_URL;
    let method = 'POST'; 

    if (danhMucId) { 
        url = `${window.API_DANH_MUC_BASE_URL}/${danhMucId}`;
        method = 'PUT';
        danhMucData.Id = parseInt(danhMucId); // PascalCase
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(danhMucData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
        }

        alert(`Danh mục đã được ${danhMucId ? 'cập nhật' : 'thêm mới'} thành công!`);
        closeDanhMucModal(); 
        loadDanhMucs(); 
    } catch (error) {
        console.error("Lỗi khi lưu danh mục:", error);
        alert(`Không thể ${danhMucId ? 'cập nhật' : 'thêm mới'} danh mục. Lỗi: ` + error.message);
    }
}


async function editDanhMuc(id) {
    try {
        const response = await fetch(`${window.API_DANH_MUC_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const danhMuc = await response.json();

        document.getElementById('danhMucModalTitle').textContent = 'Sửa Thông tin Danh mục';
        document.getElementById('danhMucId').value = danhMuc.Id; 
        document.getElementById('tenDanhMuc').value = danhMuc.TenDanhMuc || ''; 
        document.getElementById('moTa').value = danhMuc.MoTa || ''; 

        document.getElementById('danhMucModal').classList.remove('hidden');
        document.getElementById('danhMucModal').classList.add('flex');

    } catch (error) {
        console.error("Lỗi khi tải thông tin danh mục để sửa:", error);
        alert("Không thể tải thông tin danh mục để sửa. Vui lòng kiểm tra API Backend.");
    }
}

async function deleteDanhMuc(id) {
    if (confirm(`Bạn có chắc chắn muốn xóa danh mục ID: ${id} không?`)) {
        try {
            const response = await fetch(`${window.API_DANH_MUC_BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert('Xóa danh mục thành công!');
            loadDanhMucs();
        } catch (error) {
            console.error("Lỗi khi xóa danh mục:", error);
            alert("Không thể xóa danh mục. Vui lòng kiểm tra API Backend và CORS.");
        }
    }
}

// Lắng nghe sự kiện submit của form modal, thay vì onclick trên nút
document.addEventListener('DOMContentLoaded', () => {
    const danhMucForm = document.getElementById('danhMucForm');
    if (danhMucForm) {
        danhMucForm.addEventListener('submit', saveDanhMuc);
    } else {
        console.warn("Element with ID 'danhMucForm' not found. Ensure DanhMuc.html is loaded and the form exists.");
    }
    loadDanhMucs(); // Tải danh mục khi trang được tải
});