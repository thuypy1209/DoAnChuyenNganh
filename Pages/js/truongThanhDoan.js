// File: js/truongThanhDoan.js

document.addEventListener('DOMContentLoaded', function() {
    
    // --- PHẦN 1: XỬ LÝ CHUYỂN TABS ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            
            tabButtons.forEach(btn => {
                btn.classList.remove('border-blue-500', 'text-blue-600');
                btn.classList.add('border-transparent', 'text-gray-500');
            });

            this.classList.add('border-blue-500', 'text-blue-600');
            this.classList.remove('border-transparent', 'text-gray-500');

            tabContents.forEach(content => {
                content.classList.add('hidden');
            });

            const contentId = this.getAttribute('data-content-id');
            const activeContent = document.getElementById(contentId);
            if (activeContent) {
                activeContent.classList.remove('hidden');
            }
        });
    });

    // --- PHẦN 2: XỬ LÝ CHUYỂN "MÀN HÌNH" TRONG TAB 1 ---
    const viewDanhSach = document.getElementById('view-danh-sach-de-xuat');
    const viewXacNhan = document.getElementById('view-xac-nhan-truong-thanh');
    
    const btnXacNhanTruongThanh = document.getElementById('btn-xac-nhan-truong-thanh');
    const btnQuayLai = document.getElementById('btn-quay-lai');
    
    const confirmListBody = document.getElementById('confirm-list-body');
    const deXuatTableBody = document.getElementById('den-tuoi-table-body');

    // Khi nhấn nút "TRƯỞNG THÀNH ĐOÀN"
    btnXacNhanTruongThanh.addEventListener('click', function() {
        const selectedCheckboxes = deXuatTableBody.querySelectorAll('.member-checkbox:checked');
        
        if (selectedCheckboxes.length === 0) {
            alert('Vui lòng chọn ít nhất một đoàn viên.');
            return;
        }

        confirmListBody.innerHTML = '';
        selectedCheckboxes.forEach((checkbox, index) => {
            const row = checkbox.closest('tr');
            const hoTen = row.querySelector('td:nth-child(2)').textContent;
            
            const confirmRow = `
                <tr>
                    <td class="p-2">${index + 1}</td>
                    <td class="p-2">${hoTen}</td>
                    <td class="p-2">
                        <button class="text-red-500 hover:text-red-700" title="Xóa">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
            confirmListBody.insertAdjacentHTML('beforeend', confirmRow);
        });

        viewDanhSach.classList.add('hidden');
        viewXacNhan.classList.remove('hidden');
    });

    // Khi nhấn nút "QUAY LẠI"
    btnQuayLai.addEventListener('click', function() {
        viewXacNhan.classList.add('hidden');
        viewDanhSach.classList.remove('hidden');
    });
});