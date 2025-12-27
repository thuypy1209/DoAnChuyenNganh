// File: js/khoTaiLieu.js

// 1. CẤU HÌNH API
// (Ưu tiên lấy từ globalConfig nếu có)
const API_BASE = (typeof CONFIG !== 'undefined') ? CONFIG.API_BASE_URL : "http://localhost:5114";
const API_DOCS = `${API_BASE}/api/TaiLieus`;
const API_HOSO = `${API_BASE}/api/HoSos`;
const API_YEUCAU = `${API_BASE}/api/HoSoYeuCau`;

// 2. LẤY THÔNG TIN NGƯỜI DÙNG TỪ LOCAL STORAGE
const MSSV = localStorage.getItem('userMssv');
const TENSV = localStorage.getItem('userName');
const TOKEN = localStorage.getItem('accessToken');

// Kiểm tra đăng nhập
if (!TOKEN || !MSSV) {
    alert("Vui lòng đăng nhập để nộp hồ sơ!");
    window.location.href = "/account/login.html";
}

let allDocsData = []; 

document.addEventListener('DOMContentLoaded', function() {
    loadDocuments();
    loadRequests();
});

// --- CHỨC NĂNG CHUYỂN TAB ---
window.switchTab = function(tab) {
    document.getElementById('panelDownload').classList.toggle('hidden', tab !== 'download');
    document.getElementById('panelUpload').classList.toggle('hidden', tab !== 'upload');
    
    const btnDown = document.getElementById('tabDownload');
    const btnUp = document.getElementById('tabUpload');
    
    if(tab === 'download') {
        btnDown.classList.add('active-tab', 'text-white'); btnDown.classList.remove('text-gray-500');
        btnUp.classList.remove('active-tab', 'text-white'); btnUp.classList.add('text-gray-500');
    } else {
        btnUp.classList.add('active-tab', 'text-white'); btnUp.classList.remove('text-gray-500');
        btnDown.classList.remove('active-tab', 'text-white'); btnDown.classList.add('text-gray-500');
    }
}

// --- TAB 1: KHO TÀI LIỆU (GET - CÓ TOKEN) ---
async function loadDocuments() {
    try {
        const res = await fetch(API_DOCS, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        
        if(!res.ok) throw new Error("Lỗi tải tài liệu");
        
        allDocsData = await res.json();
        renderDocs(allDocsData);
    } catch(e) { 
        console.error(e);
        const list = document.getElementById('studentDocList');
        if(list) list.innerHTML = '<p class="text-red-500">Lỗi kết nối.</p>';
    }
}

window.filterDocs = function(type) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.className = "filter-btn px-4 py-1.5 bg-white text-gray-600 border rounded-full text-sm font-bold hover:bg-gray-50";
    });
    event.target.className = "filter-btn px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-bold hover:bg-blue-200 ring-2 ring-blue-300";

    if(type === 'all') renderDocs(allDocsData);
    else renderDocs(allDocsData.filter(d => (d.loaiTaiLieu || d.LoaiTaiLieu || '').includes(type)));
}

function renderDocs(data) {
    const container = document.getElementById('studentDocList');
    if(!container) return;
    container.innerHTML = '';
    
    if(data.length === 0) {
        container.innerHTML = '<p class="text-center col-span-full text-gray-400">Không tìm thấy tài liệu.</p>';
        return;
    }
    data.forEach(item => {
        let link = item.duongDanUrl || item.DuongDanUrl || '#';
        if(link !== '#' && !link.startsWith('http')) link = API_BASE + link;

        const type = item.loaiTaiLieu || item.LoaiTaiLieu || 'Tài liệu';
        let icon = 'fa-file-alt';
        let color = 'text-blue-600 bg-blue-50';
        if(type.includes('Biểu mẫu')) { icon = 'fa-file-contract'; color = 'text-green-600 bg-green-50'; }
        if(type.includes('Quyết định')) { icon = 'fa-gavel'; color = 'text-red-600 bg-red-50'; }

        container.insertAdjacentHTML('beforeend', `
            <div class="doc-card bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                <div class="flex items-start gap-4 mb-3">
                    <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${color}"><i class="fas ${icon}"></i></div>
                    <div><span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider border px-1.5 py-0.5 rounded">${type}</span><h3 class="font-bold text-gray-800 line-clamp-2 mt-1">${item.tenTaiLieu || item.TenTaiLieu}</h3></div>
                </div>
                <p class="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">${item.moTa || item.MoTa || ''}</p>
                <a href="${link}" download target="_blank" class="block text-center w-full py-2 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-blue-900 hover:text-white transition-colors"><i class="fas fa-download mr-2"></i> Tải về</a>
            </div>
        `);
    });
}

// --- TAB 2: NỘP HỒ SƠ (GET/POST - CÓ TOKEN) ---
async function loadRequests() {
    try {
        const headers = { 'Authorization': `Bearer ${TOKEN}` };
        
        const [resReq, resNop] = await Promise.all([
            fetch(API_YEUCAU, { headers }), 
            fetch(API_HOSO, { headers })
        ]);

        if(!resReq.ok || !resNop.ok) throw new Error("Lỗi tải dữ liệu");

        const requests = await resReq.json();
        const daNopList = await resNop.json();

        const container = document.getElementById('requestList');
        if(!container) return;
        container.innerHTML = '';

        if (!requests || requests.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-400">Không có yêu cầu nào.</p>';
            return;
        }

        requests.forEach(req => {
            const reqId = req.Id || req.id;
            const reqTitle = req.TieuDe || req.tieuDe;
            const reqDate = req.HanChot || req.hanChot;

            // CHECK ĐÃ NỘP (So khớp MSSV động)
            const mySubmission = daNopList.find(x => {
                const dbMSSV = x.MSSV || x.mssv || '';
                const dbTen = x.TenHoSo || x.tenHoSo || ''; 
                // So sánh cả MSSV và ID yêu cầu trong tên hồ sơ
                return dbMSSV == MSSV && dbTen.includes(`ID: ${reqId}`);
            });

            let actionHtml, statusHtml;

            if (mySubmission) {
                // Đã nộp
                let fileLink = mySubmission.DuongDanTep || mySubmission.duongDanTep || '#';
                if(fileLink !== '#' && !fileLink.startsWith('http')) fileLink = API_BASE + fileLink;

                statusHtml = `<span class="text-green-600 font-bold text-xs bg-green-50 px-3 py-1 rounded border border-green-200"><i class="fas fa-check-circle"></i> Đã nộp</span>`;
                actionHtml = `
                    <div class="text-right">
                        <a href="${fileLink}" target="_blank" class="text-blue-600 hover:underline text-sm font-bold flex justify-end items-center gap-1"><i class="fas fa-eye"></i> Xem file</a>
                        <button onclick="document.getElementById('reupload_${reqId}').classList.remove('hidden')" class="text-xs text-gray-400 underline mt-1">Nộp lại</button>
                    </div>
                    <div id="reupload_${reqId}" class="hidden mt-2 flex items-center gap-2 justify-end">
                        <input type="file" id="file_${reqId}" class="text-xs w-40">
                        <button onclick="submitDoc(${reqId})" class="bg-blue-900 text-white px-2 py-1 rounded text-xs">Gửi</button>
                    </div>`;
            } else {
                // Chưa nộp
                statusHtml = `<span class="text-gray-500 font-bold text-xs bg-gray-100 px-3 py-1 rounded border"><i class="fas fa-clock"></i> Chưa nộp</span>`;
                actionHtml = `
                    <div class="flex items-center gap-2">
                        <input type="file" id="file_${reqId}" class="text-xs w-48 text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer">
                        <button onclick="submitDoc(${reqId})" class="bg-blue-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-800 transition-colors shadow-sm">Nộp</button>
                    </div>`;
            }

            const deadlineDisplay = reqDate ? new Date(reqDate).toLocaleDateString('vi-VN') : 'Vô thời hạn';

            container.insertAdjacentHTML('beforeend', `
                <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-all">
                    <div class="flex-grow">
                        <h4 class="font-bold text-gray-800 text-base">${reqTitle}</h4>
                        <div class="flex gap-4 mt-2 items-center">
                            <span class="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-100"><i class="far fa-calendar-times mr-1"></i> Deadline: ${deadlineDisplay}</span>
                            ${statusHtml}
                        </div>
                    </div>
                    <div class="w-full md:w-auto text-right">${actionHtml}</div>
                </div>
            `);
        });
    } catch(e) { console.error(e); }
}

// --- SUBMIT DOC (POST - CÓ TOKEN) ---
window.submitDoc = async function(reqId) {
    const fileInput = document.getElementById(`file_${reqId}`);
    if (!fileInput || !fileInput.files[0]) return Swal.fire('Chưa chọn file', '', 'warning');

    const formData = new FormData();
    formData.append('TenHoSo', `Nộp hồ sơ theo yêu cầu ID: ${reqId}`); 
    formData.append('MSSV', MSSV); 
    formData.append('TenSinhVien', TENSV); 
    formData.append('file', fileInput.files[0]);

    Swal.fire({ title: 'Đang nộp...', didOpen: () => Swal.showLoading() });

    try {
        const res = await fetch(API_HOSO, { 
            method: 'POST', 
            headers: { 'Authorization': `Bearer ${TOKEN}` }, 
            body: formData 
        });

        if (res.ok) {
            Swal.fire('Thành công!', 'Đã nộp hồ sơ.', 'success');
            setTimeout(loadRequests, 1000); 
        } else {
            const txt = await res.text();
            Swal.fire('Lỗi', txt, 'error');
        }
    } catch (e) { Swal.fire('Lỗi kết nối', '', 'error'); }
}

// --- CLEAN UP (DELETE - CÓ TOKEN) ---
window.cleanUpData = async function() {
    if(confirm("Bạn có chắc muốn xóa HẾT lịch sử nộp hồ sơ của mình để test lại?")) {
        const headers = { 'Authorization': `Bearer ${TOKEN}` };
        
        const res = await fetch(API_HOSO, { headers });
        const data = await res.json();
        const myDocs = data.filter(x => (x.MSSV||x.mssv) == MSSV);
        
        for(let doc of myDocs) {
            await fetch(`${API_HOSO}/${doc.Id || doc.id}`, { 
                method: 'DELETE',
                headers: headers 
            });
        }
        alert("Đã xóa sạch! Hãy nộp lại.");
        loadRequests();
    }
}