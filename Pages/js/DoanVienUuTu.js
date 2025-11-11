// File: js/doanVienUuTu.js

document.addEventListener('DOMContentLoaded', function() {
    // --- PHẦN 1: XỬ LÝ CHUYỂN TABS ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('border-blue-500', 'text-blue-600'));
            this.classList.add('border-blue-500', 'text-blue-600');
            tabContents.forEach(content => content.classList.add('hidden'));
            document.getElementById(this.getAttribute('data-content-id')).classList.remove('hidden');
        });
    });

    // --- PHẦN 2: XỬ LÝ CHUYỂN "MÀN HÌNH" TRONG TAB 1 ---
    const viewChonDV = document.getElementById('view-chon-dv-uutuu');
    const viewXacNhan = document.getElementById('view-xac-nhan-uutuu');
    const btnShowXacNhan = document.getElementById('btn-show-xac-nhan-uutuu');
    const btnQuayLai = document.getElementById('btn-quay-lai-uutuu');
    
    // Khi nhấn nút "XÉT ĐOÀN VIÊN ƯU TÚ"
    btnShowXacNhan.addEventListener('click', function() {
        const selectedCheckboxes = viewChonDV.querySelectorAll('.dv-uutuu-checkbox:checked');
        if (selectedCheckboxes.length === 0) {
            alert('Vui lòng chọn ít nhất một đoàn viên.');
            return;
        }
        
        // Cập nhật danh sách xác nhận
        const confirmListBody = document.getElementById('xac-nhan-uutuu-list-body');
        confirmListBody.innerHTML = '';
        selectedCheckboxes.forEach((checkbox, index) => {
             const row = checkbox.closest('tr');
             const hoTen = row.querySelector('td:nth-child(2)').textContent;
             confirmListBody.innerHTML += `<tr><td class="p-2">${index + 1}</td><td class="p-2">${hoTen}</td><td class="p-2"><button class="text-red-500"><i class="fas fa-trash-alt"></i></button></td></tr>`;
        });

        // Chuyển màn hình
        viewChonDV.classList.add('hidden');
        viewXacNhan.classList.remove('hidden');
    });

    // Khi nhấn nút "QUAY LẠI"
    btnQuayLai.addEventListener('click', function() {
        viewXacNhan.classList.add('hidden');
        viewChonDV.classList.remove('hidden');
    });
});