// File: js/admin_daoTaoHDSD.js

const API_URL = 'http://localhost:5114/api/DaoTao';

document.addEventListener('DOMContentLoaded', () => {
    loadTaiLieu();
    loadFAQ();
});

// 1. TẢI TÀI LIỆU
async function loadTaiLieu() {
    const list = document.getElementById('listTaiLieu');
    try {
        const res = await fetch(`${API_URL}/TaiLieu`);
        const data = await res.json();
        
        list.innerHTML = '';
        data.forEach(item => {
            let icon = 'fa-file-alt';
            let color = 'text-gray-500';
            if (item.loai === 'PDF') { icon = 'fa-file-pdf'; color = 'text-red-500'; }
            if (item.loai === 'Video') { icon = 'fa-video'; color = 'text-red-600'; }
            if (item.loai === 'Link') { icon = 'fa-link'; color = 'text-blue-500'; }

            const html = `
                <li class="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-blue-50 border border-gray-100 group">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <i class="fas ${icon} ${color} text-lg"></i>
                        <a href="${item.linkUrl}" target="_blank" class="font-medium text-gray-700 hover:text-blue-800 truncate block max-w-xs" title="${item.TenTaiLieu}">${item.TenTaiLieu}</a>
                    </div>
                    <button onclick="deleteItem('TaiLieu', ${item.Id})" class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fas fa-trash"></i></button>
                </li>`;
            list.insertAdjacentHTML('beforeend', html);
        });
    } catch (e) { list.innerHTML = '<p class="text-red-500 text-sm">Lỗi tải.</p>'; }
}

// 2. TẢI FAQ
async function loadFAQ() {
    const list = document.getElementById('listFAQ');
    try {
        const res = await fetch(`${API_URL}/FAQ`);
        const data = await res.json();
        
        list.innerHTML = '';
        data.forEach(item => {
            const html = `
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 relative group hover:shadow-sm">
                    <button onclick="deleteItem('FAQ', ${item.Id})" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><i class="fas fa-trash"></i></button>
                    <h4 class="font-bold text-blue-900 text-sm mb-1"><i class="fas fa-question-circle mr-1 opacity-50"></i> ${item.CauHoi}</h4>
                    <p class="text-sm text-gray-600 pl-5">${item.TraLoi}</p>
                </div>`;
            list.insertAdjacentHTML('beforeend', html);
        });
    } catch (e) { list.innerHTML = '<p class="text-red-500 text-sm">Lỗi tải.</p>'; }
}

// 3. THÊM MỚI (CHUNG CHO CẢ 2)
async function addTaiLieu() {
    const data = {
        tenTaiLieu: document.getElementById('newTenTL').value,
        loai: document.getElementById('newLoaiTL').value,
        linkUrl: document.getElementById('newLinkTL').value,
        doiTuong: "TatCa"
    };
    if(!data.tenTaiLieu) return alert("Nhập tên tài liệu!");

    await fetch(`${API_URL}/TaiLieu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    closeModal('modalTaiLieu');
    loadTaiLieu();
}

async function addFAQ() {
    const data = {
        cauHoi: document.getElementById('newCauHoi').value,
        traLoi: document.getElementById('newTraLoi').value
    };
    if(!data.cauHoi) return alert("Nhập câu hỏi!");

    await fetch(`${API_URL}/FAQ`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    closeModal('modalFAQ');
    loadFAQ();
}

// 4. XÓA
async function deleteItem(type, id) {
    if(!confirm("Xóa mục này?")) return;
    await fetch(`${API_URL}/${type}/${id}`, { method: 'DELETE' });
    if(type === 'TaiLieu') loadTaiLieu(); else loadFAQ();
}

// Helpers
window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => document.getElementById(id).classList.add('hidden');