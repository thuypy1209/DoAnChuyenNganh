// File: js/homeDashboard.js

document.addEventListener('DOMContentLoaded', async function() {
    // 1. CẤU HÌNH API
    // Gắn vào window để dùng chung
    window.API_BASE_URL = "http://quocviet09-001-site1.smarterasp.net/api";

    // 2. LẤY THÔNG TIN TỪ LOCAL STORAGE & GẮN VÀO WINDOW
    window.CURRENT_STUDENT_ID = localStorage.getItem('userId'); 
    window.TOKEN = localStorage.getItem('accessToken');
    window.CURRENT_MSSV = localStorage.getItem('userMssv');

    console.log("Check Auth:", { 
        ID: window.CURRENT_STUDENT_ID, 
        MSSV: window.CURRENT_MSSV, 
        Token: window.TOKEN ? "Có" : "Không" 
    });

    // Nếu chưa đăng nhập thì đuổi về
    if (!window.TOKEN || !window.CURRENT_MSSV) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        window.location.href = '/account/login.html';
        return;
    }

    // 3. KHỞI TẠO BIẾN DỮ LIỆU TOÀN CỤC (GẮN VÀO WINDOW)
    window.appData = {
        totalScore: 0,
        criteria: [],
        history: [],
        titles: [],
        ThongTin: null
    };

    // 4. CHẠY CÁC HÀM KHỞI TẠO
    await loadRealData(); 
    renderDashboard();    
    renderHistory();
    renderTitles();
    initChart();
    renderDetailedScore();
    initForecast(); 
});

async function loadRealData() {
    try {
        console.log("🚀 Đang tải dữ liệu cho MSSV:", window.CURRENT_MSSV);
        
        const url = `${window.API_BASE_URL}/QuanLySinhVien/GetByMssv/${window.CURRENT_MSSV}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${window.TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 404) {
            console.warn("⚠️ Chưa tìm thấy hồ sơ sinh viên.");
            window.appData.ThongTin = { 
                HoTen: localStorage.getItem('userName') || "Sinh Viên", 
                MSSV: window.CURRENT_MSSV,
                AnhDaiDien: 'images/default.png'
            };
            return;
        }

        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        console.log("✅ Dữ liệu nhận được:", data);

        // 1. Cập nhật thông tin cơ bản
        window.appData.ThongTin = data.thongTin || data.ThongTin; 
        
        // 2. Cập nhật ĐIỂM TỔNG (Đây là chỗ sẽ hiện con số 55)
        window.appData.totalScore = data.tongDiem || data.TongDiem || data.diemRenLuyen || 0;
        
        // 3. Cập nhật lịch sử và danh hiệu
        window.appData.history = data.lichSu || data.LichSu || [];
        window.appData.titles = data.danhHieu || data.DanhHieu || [];

        // 4. XỬ LÝ 5 TIÊU CHÍ (Để hiện điểm thành phần)
        // Nếu Backend trả về mảng TieuChi, chúng ta dùng nó, nếu không mới dùng mặc định
        const backendCriteria = data.tieuChi || data.TieuChi || data.diemThanhPhan;
        
        if (backendCriteria && backendCriteria.length > 0) {
            // Chuyển đổi dữ liệu backend sang định dạng frontend cần
            window.appData.criteria = backendCriteria.map((item, index) => ({
                id: index + 1,
                name: item.tieuChi || item.name || "Tiêu chí",
                score: item.diem || item.score || 0,
                max: 20
            }));
        } else {
            // Nếu không có dữ liệu thành phần, tự tính từ lịch sử (Dành cho trường hợp chữa cháy)
            tinhDiemTuLichSu();
        }

    } catch (error) {
        console.error("❌ LỖI KẾT NỐI:", error);
    }
}

// Hàm phụ trợ nếu Backend chưa kịp trả về mảng TieuChi
function tinhDiemTuLichSu() {
    const scores = { "Đạo đức": 0, "Học tập": 0, "Thể lực": 0, "Tình nguyện": 0, "Hội nhập": 0 };
    window.appData.history.forEach(h => {
        if (h.trangThaiDuyet === "DaDuyet" || h.TrangThaiDuyet === "DaDuyet") {
            const key = h.tieuChiSV5T || h.TieuChiSV5T;
            if (scores[key] !== undefined) scores[key] += (h.diemRenLuyen || h.DiemRenLuyen || 0);
        }
    });
    window.appData.criteria = Object.keys(scores).map((key, i) => ({
        id: i + 1, name: key, score: scores[key], max: 20
    }));
}

// --- VẼ DASHBOARD ---
function renderDashboard() {
    // 1. Hiển thị điểm tổng
    const scoreElement = document.getElementById('txtMainScore');
    if (scoreElement) scoreElement.textContent = window.appData.totalScore;

    // 2. Màu sắc vòng tròn
    const mainCircle = document.getElementById('mainScoreCircle');
    if (mainCircle) {
        let score = window.appData.totalScore;
        let mainColor = "text-green-500";
        if (score < 65) mainColor = "text-red-500";
        else if (score < 80) mainColor = "text-yellow-500";
        else if (score < 90) mainColor = "text-blue-500";
        
        mainCircle.setAttribute("class", `circle ${mainColor}`);
        mainCircle.setAttribute("stroke-dasharray", `${score}, 100`);
    }

    // --- TÌM ĐOẠN NÀY TRONG HÀM renderDashboard ---

    // 3. Xếp loại (CODE ĐÃ SỬA LẠI LOGIC CHUẨN)
    let score = window.appData.totalScore || 0;
    let rankLabel = "KÉM"; // Mặc định là Kém
    let rankColor = "text-gray-500"; // Màu xám

    if (score >= 90) {
        rankLabel = "XUẤT SẮC";
        rankColor = "text-green-600";
    } else if (score >= 80) {
        rankLabel = "GIỎI";
        rankColor = "text-blue-600";
    } else if (score >= 65) {
        rankLabel = "KHÁ";
        rankColor = "text-yellow-500";
    } else if (score >= 50) {
        rankLabel = "TRUNG BÌNH";
        rankColor = "text-orange-500";
    } else {
        // Dưới 50 điểm
        rankLabel = "YẾU";
        rankColor = "text-red-500";
    }

    // Hiển thị ra màn hình và tô màu cho đẹp
    const rankElement = document.getElementById('txtRank');
    if(rankElement) {
        rankElement.innerText = "Xếp loại: " + rankLabel;
        // Xóa màu cũ, thêm màu mới
        rankElement.className = `text-2xl font-bold ${rankColor}`;
    }

    // --- TÌM ĐOẠN NÀY TRONG HÀM renderDashboard ---

    // 4. Hiển thị thông tin cá nhân
    const imgAvatar = document.getElementById('imgAvatarPreview');
    const lblTen = document.getElementById('lblTenSinhVien');
    
    if (window.appData.ThongTin) {
        if (lblTen) lblTen.innerText = window.appData.ThongTin.HoTen;

        if (imgAvatar) {
            // Lấy link ảnh từ Database
            let avatarUrl = window.appData.ThongTin.AnhDaiDien;
            
            // Logic tạo ảnh mặc định thông minh (Không cần file default.png nữa)
            // Nếu link rỗng, hoặc là "default.png", hoặc là "string" (do lỗi database cũ)
            const isInvalid = !avatarUrl || avatarUrl === 'default.png' || avatarUrl === 'string';
            
            if (isInvalid) {
                // Tạo avatar theo tên (Ví dụ: tên Việt -> hiện chữ V)
                const ten = window.appData.ThongTin.HoTen || "User";
                avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(ten)}&background=0D8ABC&color=fff&size=256&font-size=0.5`;
            }
            
            // Gán link vào thẻ img
            imgAvatar.src = avatarUrl;
            
            // Phòng hờ: Nếu link Database bị lỗi (404), nó sẽ tự quay về ảnh online
            imgAvatar.onerror = function() {
                console.warn("Ảnh bị lỗi, chuyển về ảnh mặc định.");
                const ten = window.appData.ThongTin.HoTen || "User";
                this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ten)}&background=random&size=256`;
            };
        }
    }

    // 5. Thống kê
    updateStatBox('Hoạt động', window.appData.history ? window.appData.history.length : 0);
    updateStatBox('Danh hiệu', window.appData.titles ? window.appData.titles.length : 0);
    
    let volHours = 0;
    if (window.appData.history) {
        window.appData.history.forEach(h => {
             if (h.TenHoatDong && (h.TenHoatDong.toLowerCase().includes('mùa hè xanh') || h.TenHoatDong.toLowerCase().includes('hiến máu'))) {
                 volHours += (h.DiemRenLuyen || 0);
             }
        });
    }
    updateStatBox('Tình nguyện', volHours + 'h');

    renderCriteriaCircles();
}

function updateStatBox(labelName, value) {
    const labels = Array.from(document.querySelectorAll('p'));
    const targetLabel = labels.find(el => el.textContent.trim().toUpperCase() === labelName.toUpperCase());
    if (targetLabel) {
        const numberEl = targetLabel.parentElement.querySelector('.text-2xl');
        if (numberEl) numberEl.innerText = value;
    }
}

function renderCriteriaCircles() {
    const container = document.getElementById('criteriaContainer');
    if(!container) return;
    container.innerHTML = '';
    window.appData.criteria.forEach(c => {
        const percent = (c.score / c.max) * 100;
        let colorClass = c.score < (c.max * 0.5) ? 'text-red-500' : (c.score < (c.max * 0.8) ? 'text-yellow-500' : 'text-green-500');
        
        const html = `
            <div class="flex flex-col items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                <div class="relative w-14 h-14 mb-2 transform group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 36 36" class="circular-chart">
                        <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="circle ${colorClass}" stroke-dasharray="${percent}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                        ${c.score}/${c.max}
                    </div>
                </div>
                <span class="text-[10px] uppercase font-bold text-gray-500 text-center">${c.name}</span>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function initChart() {
    const ctx = document.getElementById('progressChart');
    if(!ctx) return;
    if (window.myChartInstance) window.myChartInstance.destroy();

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(30, 58, 138, 0.5)');
    gradient.addColorStop(1, 'rgba(30, 58, 138, 0.0)');

    window.myChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['HK1/23', 'HK2/23', 'HK1/24', 'HK2/24', 'HK1/25'],
            datasets: [{
                label: 'Điểm Rèn Luyện',
                data: [65, 72, 80, 78, window.appData.totalScore],
                borderColor: '#1e3a8a', backgroundColor: gradient, borderWidth: 3,
                pointBackgroundColor: '#fff', pointBorderColor: '#facc15', fill: true, tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 50, max: 100 }, x: { grid: { display: false } } } }
    });
}

function renderHistory() {
    const container = document.getElementById('historyTimeline');
    if(!container) return;
    container.innerHTML = '';
    
    if (!window.appData.history || window.appData.history.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-4">Chưa có lịch sử hoạt động.</p>';
        return;
    }

    window.appData.history.forEach(item => {
        const color = item.TrangThaiDuyet === 'DaDuyet' ? 'green' : 'yellow';
        const statusText = item.TrangThaiDuyet === 'DaDuyet' ? 'Đã duyệt' : 'Chờ duyệt';
        let displayDate = item.NgayBatDau;
        if(displayDate && displayDate.includes('T')) displayDate = displayDate.split('T')[0];

        const html = `
            <div class="timeline-item relative pl-8 pb-6 border-l-2 border-gray-200 last:border-0 ml-2">
                <div class="absolute -left-[9px] top-0 w-5 h-5 bg-${color}-100 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                    <div class="w-2 h-2 bg-${color}-500 rounded-full"></div>
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-gray-800 text-sm md:text-base">${item.TenHoatDong}</h4>
                            <div class="text-xs text-gray-500 mt-1 flex gap-3">
                                <span><i class="far fa-clock"></i> ${displayDate}</span>
                                <span class="font-semibold text-blue-600">${item.TieuChiSV5T || 'Hoạt động'}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="block text-lg font-bold text-${color}-600">+${item.DiemRenLuyen}</span>
                            <span class="text-[10px] font-bold text-gray-400 uppercase">${statusText}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

// --- SỬA LẠI HÀM NÀY TRONG FILE js/homeDashboard.js ---

function renderTitles() {
    const container = document.getElementById('titlesContainer');
    
    if(!container) return;
    
    container.innerHTML = '';
    
    // Kiểm tra nếu không có danh hiệu
    if (!window.appData.titles || window.appData.titles.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-2 italic">Chưa có danh hiệu nào được ghi nhận.</p>';
        return;
    }

    // Duyệt qua từng danh hiệu để vẽ
    window.appData.titles.forEach(t => {
        // SỬA TẠI ĐÂY: Kiểm tra cả 2 trường hợp viết hoa và viết thường của thuộc tính
        const tenDanhHieu = t.tenChungNhan || t.TenChungNhan || t.name || "Danh hiệu";
        
        let namHoc = "2024-2025";
        if (t.ngayCap || t.NgayCap) {
            const date = new Date(t.ngayCap || t.NgayCap);
            namHoc = date.getFullYear();
        }

        // Tự động chọn màu sắc cho "xịn"
        let color = 'yellow'; // Danh hiệu thì nên để màu vàng cho đẹp
        let icon = 'medal';

        const html = `
            <div class="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm hover:shadow-md transition-all animate-fade-in">
                <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-yellow-500 text-2xl shadow-sm">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div>
                    <h4 class="font-bold text-blue-900 text-sm uppercase">${tenDanhHieu}</h4>
                    <p class="text-xs text-gray-600">Năm cấp: ${namHoc}</p>
                </div>
            </div>`;
        
        container.insertAdjacentHTML('beforeend', html);
    });
}

// --- CHỨC NĂNG CHỌN ẢNH ĐẠI DIỆN ---
// (Đã gắn vào window để HTML gọi được)
window.chonAnhAvatar = async function(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        var reader = new FileReader();
        reader.onload = function (e) {
            const imgElement = document.getElementById('imgAvatarPreview');
            if (imgElement) imgElement.src = e.target.result;
        };
        reader.readAsDataURL(file);

        try {
            console.log("🚀 Đang tải ảnh lên...");
            const formData = new FormData();
            formData.append('file', file);
            
            // Dùng ID thật nếu có, nếu không thì dùng ID tạm từ localStorage
            const svId = window.CURRENT_MSSV || window.CURRENT_STUDENT_ID;

            const response = await fetch(`${window.API_BASE_URL}/Upload/Avatar/${svId}`, {
                method: 'POST', 
                headers: {
                    'Authorization': `Bearer ${window.TOKEN}` 
                },
                body: formData
            });

            if (!response.ok) throw new Error("Lỗi upload");
            const result = await response.json();
            
            if(window.appData.ThongTin) window.appData.ThongTin.AnhDaiDien = result.link;
            alert("Đã lưu ảnh đại diện mới!");

        } catch (error) {
            console.error("Lỗi:", error);
            alert("Lỗi khi lưu ảnh: " + error.message);
        }
    }
}

// --- CHỨC NĂNG NỘP ĐƠN ---
// (Đã gắn vào window để HTML gọi được)
window.nopDonSV5T = async function() {
    if (!confirm("Bạn có chắc chắn muốn nộp hồ sơ không?")) return;
    try {
        // Kiểm tra biến toàn cục
        if(!window.appData || !window.appData.ThongTin) { 
            alert("Chưa tải được thông tin sinh viên! Vui lòng tải lại trang."); 
            return; 
        }
        
        const payload = {
            MSSV: window.appData.ThongTin.MSSV,
            TenSinhVien: window.appData.ThongTin.HoTen,
            TenHoatDong: "Xét duyệt Sinh viên 5 Tốt (Nộp Online)",
            LoaiChungNhan: "DanhHieu",
            LyDo: "Đã đủ điều kiện điểm rèn luyện và học tập.",
            MinhChungUrl: "",
            TrangThai: "ChoDuyet"
        };

        const response = await fetch(`${window.API_BASE_URL}/YeuCauChungNhans`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.TOKEN}` 
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Lỗi gửi đơn");
        alert("✅ Nộp đơn thành công! Vui lòng chờ Admin duyệt.");

    } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi xảy ra: " + error.message);
    }
}

window.switchTab = function(event, tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active', 'text-blue-900', 'border-b-3', 'border-yellow-400');
        el.classList.add('text-gray-600');
    });
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active', 'text-blue-900');
    event.currentTarget.classList.remove('text-gray-600');
}

function renderDetailedScore() {
    const tbody = document.getElementById('scoreTableBody');
    const footerTotal = document.getElementById('tableTotalScore');
    
    if (!tbody) return;
    tbody.innerHTML = ''; 

    if (!window.appData.history || window.appData.history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-gray-500">Chưa có dữ liệu điểm.</td></tr>';
        if(footerTotal) footerTotal.innerText = 0;
        return;
    }

    const groups = {};
    
    window.appData.history.forEach(item => {
        const tieuChi = item.TieuChiSV5T || 'Hoạt động khác';
        
        if (!groups[tieuChi]) {
            groups[tieuChi] = {
                tenTieuChi: tieuChi,
                dsHoatDong: [],
                tongDiemThanhPhan: 0
            };
        }
        
        groups[tieuChi].dsHoatDong.push(item);
        groups[tieuChi].tongDiemThanhPhan += (item.DiemRenLuyen || 0);
    });

    for (const key in groups) {
        const group = groups[key];
        
        const tenHoatDongsHtml = group.dsHoatDong
            .map(h => `<div class="mb-1">• ${h.TenHoatDong} <span class="text-gray-400 text-xs italic">(${h.NgayBatDau ? h.NgayBatDau.split('T')[0] : ''})</span></div>`)
            .join('');

        const diemCongsHtml = group.dsHoatDong
            .map(h => `<div class="mb-1 font-medium text-green-600">+${h.DiemRenLuyen}</div>`)
            .join('');

        const row = `
            <tr class="bg-white border-b hover:bg-gray-50 transition-colors">
                <td class="p-3 font-bold text-blue-900 align-top">${group.tenTieuChi}</td>
                <td class="p-3 align-top">${tenHoatDongsHtml}</td>
                <td class="p-3 text-center align-top">${diemCongsHtml}</td>
                <td class="p-3 text-center font-bold text-blue-900 text-lg align-top bg-blue-50">
                    ${group.tongDiemThanhPhan}
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    }

    if(footerTotal) footerTotal.innerText = window.appData.totalScore;
}

// --- TÍNH NĂNG DỰ BÁO ĐIỂM ---
async function initForecast() {
    try {
        // Kiểm tra xem Route của bạn là HoatDongs hay QuanLyHoatDong
        const response = await fetch(`${window.API_BASE_URL}/HoatDongs/SapDienRa`, {
             headers: { 'Authorization': `Bearer ${window.TOKEN}` }
        });

        const upcomingEvents = await response.json();
        // Tìm đúng container theo ID hoặc Class trong HTML của bạn
        const container = document.getElementById('forecastContainer') || document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.gap-3');
        
        if (container) {
            if (!upcomingEvents || upcomingEvents.length === 0) {
                container.innerHTML = '<p class="text-xs text-gray-400 italic">Không có hoạt động sắp tới.</p>';
                return;
            }

            container.innerHTML = ''; 
            upcomingEvents.forEach(evt => {
                const html = `
                    <label class="bg-white p-3 rounded-lg cursor-pointer flex justify-between items-center hover:bg-blue-50 border border-gray-100 transition-all">
                        <span class="text-sm font-medium text-gray-700">
                            ${evt.tenHoatDong || evt.TenHoatDong} 
                            <span class="text-green-600 font-bold">(+${evt.diemRenLuyen || evt.DiemRenLuyen}đ)</span>
                        </span>
                        <input type="checkbox" class="forecast-cb w-5 h-5 accent-blue-600" 
                               value="${evt.diemRenLuyen || evt.DiemRenLuyen}" 
                               onchange="calculateForecast()">
                    </label>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });
        }
    } catch (e) {
        console.error("Lỗi tải hoạt động dự báo:", e);
    }
}

window.calculateForecast = function() {
    let currentScore = window.appData.totalScore || 0;
    
    let addedScore = 0;
    document.querySelectorAll('.forecast-cb:checked').forEach(cb => {
        addedScore += parseInt(cb.value);
    });
    
    let finalScore = currentScore + addedScore;
    if (finalScore > 100) finalScore = 100; 

    let rank = "KÉM";
    let colorClass = "text-gray-500";
    
    if (finalScore >= 90) { rank = "XUẤT SẮC"; colorClass = "text-green-500"; }
    else if (finalScore >= 80) { rank = "GIỎI"; colorClass = "text-blue-500"; }
    else if (finalScore >= 70) { rank = "KHÁ"; colorClass = "text-yellow-500"; }
    else if (finalScore >= 50) { rank = "TRUNG BÌNH"; colorClass = "text-orange-500"; }

    animateValue("forecastScore", 0, finalScore, 1000);
    
    const rankEl = document.getElementById('forecastRank');
    if(rankEl) {
        rankEl.innerText = rank;
        rankEl.className = `text-lg font-bold uppercase ${colorClass}`;
    }
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}