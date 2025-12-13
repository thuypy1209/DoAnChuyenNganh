// File: js/homeDashboard.js

// 1. CẤU HÌNH API (Đúng cổng 7006)
const API_BASE_URL = "https://localhost:7006/api";
const CURRENT_STUDENT_ID = 1; // ID giả định

// Biến chứa dữ liệu toàn cục
let appData = {
    totalScore: 0,
    criteria: [],
    history: [],
    titles: [],
    ThongTin: null // Quan trọng: Phải có biến này để chứa Info sinh viên
};

document.addEventListener('DOMContentLoaded', async function() {
    await loadRealData(); // 1. Tải dữ liệu
    renderDashboard();    // 2. Vẽ giao diện
    renderHistory();
    renderTitles();
    initChart();
    renderDetailedScore();
    // initForecast();
});

// --- HÀM GỌI API (ĐÃ SỬA LỖI QUÊN DỮ LIỆU) ---
async function loadRealData() {
    try {
        console.log("🚀 Bắt đầu gọi API...");
        const url = `${API_BASE_URL}/SinhViens/${CURRENT_STUDENT_ID}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`Lỗi API: ${response.status}`);

        const data = await response.json();
        console.log("✅ Dữ liệu nhận được:", data);

        // --- MAPPING DỮ LIỆU (QUAN TRỌNG NHẤT) ---
        
        // 1. Lưu thông tin cá nhân (Cái này nãy mình quên nè)
        appData.ThongTin = data.ThongTin; 

        // 2. Lưu điểm số
        appData.totalScore = data.TongDiem || data.DiemRenLuyen || 0;

        // 3. Lưu lịch sử (Lấy từ LichSu chứ ko phải HoatDongs)
        appData.history = data.LichSu || [];

        // 4. Tạo dữ liệu giả cho 5 tiêu chí (Vì API chưa trả về cái này)
        appData.criteria = [
            { id: 1, name: "Đạo đức", score: 18, max: 20 },
            { id: 2, name: "Học tập", score: 15, max: 20 },
            { id: 3, name: "Thể lực", score: 10, max: 20 },
            { id: 4, name: "Tình nguyện", score: 12, max: 20 },
            { id: 5, name: "Hội nhập", score: 14, max: 20 }
        ];

        // 5. Tạo dữ liệu giả cho Danh hiệu (Vì API chưa trả về)
        appData.titles = [
            { name: "Sinh viên 5 tốt cấp Khoa", year: "2024", icon: "medal", color: "yellow" }
        ];

    } catch (error) {
        console.error("❌ LỖI:", error);
        alert("Không tải được dữ liệu: " + error.message);
    }
}

// --- VẼ DASHBOARD (ĐÃ CẬP NHẬT HIỂN THỊ ẢNH & TÊN) ---
function renderDashboard() {
    // 1. Hiển thị điểm tổng
    const scoreElement = document.getElementById('txtMainScore');
    if (scoreElement) scoreElement.textContent = appData.totalScore;

    // 2. Màu sắc vòng tròn điểm
    const mainCircle = document.getElementById('mainScoreCircle');
    if (mainCircle) {
        let mainColor = "text-green-500";
        if (appData.totalScore < 65) mainColor = "text-red-500";
        else if (appData.totalScore < 80) mainColor = "text-yellow-500";
        else if (appData.totalScore < 90) mainColor = "text-blue-500";
        
        mainCircle.setAttribute("class", `circle ${mainColor}`);
        mainCircle.setAttribute("stroke-dasharray", `${appData.totalScore}, 100`);
    }

    // 3. Hiển thị Xếp loại
    const rankLabel = appData.totalScore >= 90 ? "XUẤT SẮC" : (appData.totalScore >= 80 ? "GIỎI" : "KHÁ");
    if(document.getElementById('txtRank')) document.getElementById('txtRank').innerText = "Xếp loại: " + rankLabel;
    if(document.getElementById('txtXepLoai')) document.getElementById('txtXepLoai').innerText = rankLabel;

    // 4. HIỂN THỊ ẢNH ĐẠI DIỆN & TÊN (SỬA LỖI F5 MẤT ẢNH)
    const imgAvatar = document.getElementById('imgAvatarPreview');
    const lblTen = document.getElementById('lblTenSinhVien');
    
    if (appData.ThongTin) {
        // Tên sinh viên
        if (lblTen) lblTen.innerText = appData.ThongTin.HoTen;

        // Ảnh đại diện
        if (imgAvatar) {
            if (appData.ThongTin.AnhDaiDien) {
                imgAvatar.src = appData.ThongTin.AnhDaiDien; // Ảnh thật từ DB
            } else {
                // Ảnh mặc định theo tên
                imgAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(appData.ThongTin.HoTen)}&background=0D8ABC&color=fff&size=128`;
            }
        }
    }

    // 5. CẬP NHẬT 3 Ô THỐNG KÊ (HOẠT ĐỘNG, DANH HIỆU, TÌNH NGUYỆN)
    updateStatBox('Hoạt động', appData.history ? appData.history.length : 0);
    updateStatBox('Danh hiệu', appData.titles ? appData.titles.length : 0);
    
    // Tính giờ tình nguyện
    let volHours = 0;
    if (appData.history) {
        appData.history.forEach(h => {
             if (h.TenHoatDong && (h.TenHoatDong.includes('Mùa Hè Xanh') || h.TenHoatDong.includes('hiến máu'))) {
                 volHours += (h.DiemRenLuyen || 0);
             }
        });
    }
    updateStatBox('Tình nguyện', volHours + 'h');

    // 6. Vẽ 5 vòng tròn tiêu chí nhỏ
    renderCriteriaCircles();
}

// Hàm phụ để cập nhật số liệu thống kê cho gọn
function updateStatBox(labelName, value) {
    // Tìm tất cả thẻ p, lọc ra thẻ nào có chữ đúng với labelName
    const labels = Array.from(document.querySelectorAll('p'));
    const targetLabel = labels.find(el => el.textContent.trim().toUpperCase() === labelName.toUpperCase());
    
    if (targetLabel) {
        // Tìm thẻ cha, sau đó tìm thẻ chứa số (class text-2xl)
        const numberEl = targetLabel.parentElement.querySelector('.text-2xl');
        if (numberEl) numberEl.innerText = value;
    }
}

// Hàm vẽ 5 vòng tròn nhỏ
function renderCriteriaCircles() {
    const container = document.getElementById('criteriaContainer');
    if(!container) return;
    container.innerHTML = '';
    appData.criteria.forEach(c => {
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

// --- CÁC HÀM VẼ KHÁC (GIỮ NGUYÊN) ---
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
                data: [65, 72, 80, 78, appData.totalScore],
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
    
    if (!appData.history || appData.history.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-4">Chưa có lịch sử hoạt động.</p>';
        return;
    }

    appData.history.forEach(item => {
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

function renderTitles() {
    const container = document.getElementById('titlesContainer');
    if(!container) return;
    container.innerHTML = '';
    if (appData.titles.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-2">Chưa có danh hiệu nào.</p>';
        return;
    }
    appData.titles.forEach(t => {
        const html = `
            <div class="flex items-center gap-4 p-4 bg-${t.color}-50 border border-${t.color}-200 rounded-xl shadow-sm">
                <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-${t.color}-500 text-2xl shadow-sm"><i class="fas fa-${t.icon}"></i></div>
                <div><h4 class="font-bold text-blue-900 text-sm">${t.name}</h4><p class="text-xs text-gray-600">Năm học: ${t.year}</p></div>
            </div>`;
        container.insertAdjacentHTML('beforeend', html);
    });
}

// --- CHỨC NĂNG CHỌN ẢNH ĐẠI DIỆN ---
async function chonAnhAvatar(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Preview ngay lập tức
        var reader = new FileReader();
        reader.onload = function (e) {
            const imgElement = document.getElementById('imgAvatarPreview');
            if (imgElement) imgElement.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Gửi lên Server
        try {
            console.log("🚀 Đang tải ảnh lên...");
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch(`${API_BASE_URL}/Upload/Avatar/${CURRENT_STUDENT_ID}`, {
                method: 'POST', body: formData
            });

            if (!response.ok) throw new Error("Lỗi upload");
            const result = await response.json();
            
            // Cập nhật link mới vào appData để F5 không bị mất
            if(appData.ThongTin) appData.ThongTin.AnhDaiDien = result.link;
            alert("Đã lưu ảnh đại diện mới!");

        } catch (error) {
            console.error("Lỗi:", error);
            alert("Lỗi khi lưu ảnh: " + error.message);
        }
    }
}

// --- CHỨC NĂNG NỘP ĐƠN ---
async function nopDonSV5T() {
    if (!confirm("Bạn có chắc chắn muốn nộp hồ sơ không?")) return;
    try {
        // Đảm bảo có thông tin mới nhất
        if(!appData.ThongTin) { alert("Chưa tải được thông tin sinh viên!"); return; }
        
        const payload = {
            MSSV: appData.ThongTin.MSSV,
            TenSinhVien: appData.ThongTin.HoTen,
            TenHoatDong: "Xét duyệt Sinh viên 5 Tốt (Nộp Online)",
            LoaiChungNhan: "DanhHieu",
            LyDo: "Đã đủ điều kiện điểm rèn luyện và học tập.",
            MinhChungUrl: "",
            TrangThai: "ChoDuyet"
        };

        const response = await fetch(`${API_BASE_URL}/YeuCauChungNhans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Lỗi gửi đơn");
        alert("✅ Nộp đơn thành công! Vui lòng chờ Admin duyệt.");

    } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi xảy ra: " + error.message);
    }
}

// --- CÁC HÀM TIỆN ÍCH ---
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

window.tinhDuBao = function() {
    let current = appData.totalScore || 0;
    document.querySelectorAll('.forecast-cb:checked').forEach(cb => current += parseInt(cb.value));
    if(current > 100) current = 100;
    
    const txtForecast = document.getElementById('txtTongDiemDuBao') || document.getElementById('forecastScore');
    if(txtForecast) txtForecast.innerText = current;
    
    let rank = "TRUNG BÌNH";
    if(current >= 90) rank = "XUẤT SẮC";
    else if(current >= 80) rank = "TỐT";
    else if(current >= 65) rank = "KHÁ";
    
    const txtRankForecast = document.getElementById('txtXepLoaiDuBao') || document.getElementById('forecastRank');
    if(txtRankForecast) txtRankForecast.innerText = rank;
}

// --- 7. VẼ BẢNG ĐIỂM CHI TIẾT (GOM NHÓM THEO TIÊU CHÍ) ---
function renderDetailedScore() {
    const tbody = document.getElementById('scoreTableBody');
    const footerTotal = document.getElementById('tableTotalScore');
    
    if (!tbody) return;
    tbody.innerHTML = ''; // Xóa trắng bảng cũ

    if (!appData.history || appData.history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-gray-500">Chưa có dữ liệu điểm.</td></tr>';
        if(footerTotal) footerTotal.innerText = 0;
        return;
    }

    // 1. Gom nhóm hoạt động theo Tiêu chí (Ví dụ: Tình nguyện, Học tập...)
    const groups = {};
    
    appData.history.forEach(item => {
        // Nếu API chưa trả về TieuChiSV5T thì mặc định là 'Hoạt động khác'
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

    // 2. Vẽ từng dòng vào bảng
    for (const key in groups) {
        const group = groups[key];
        
        // Tạo danh sách tên hoạt động (xuống dòng cho đẹp)
        const tenHoatDongsHtml = group.dsHoatDong
            .map(h => `<div class="mb-1">• ${h.TenHoatDong} <span class="text-gray-400 text-xs italic">(${h.NgayBatDau ? h.NgayBatDau.split('T')[0] : ''})</span></div>`)
            .join('');

        // Tạo danh sách điểm cộng tương ứng
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

    // 3. Cập nhật tổng điểm ở chân bảng
    if(footerTotal) footerTotal.innerText = appData.totalScore;

    // --- 8. TÍNH NĂNG DỰ BÁO ĐIỂM ---

// Hàm này gọi khi trang web vừa tải xong (Thêm vào DOMContentLoaded)
async function initForecast() {
    try {
        // 1. Gọi API lấy hoạt động sắp tới
        const response = await fetch(`${API_BASE_URL}/HoatDongs/SapDienRa`);
        if (!response.ok) return; // Nếu lỗi thì thôi, giữ nguyên mặc định
        
        const upcomingEvents = await response.json();
        const container = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.gap-3');
        
        if (container && upcomingEvents.length > 0) {
            container.innerHTML = ''; // Xóa các checkbox mẫu cũ
            
            // 2. Vẽ checkbox từ dữ liệu thật
            upcomingEvents.forEach(evt => {
                const html = `
                    <label class="bg-white p-3 rounded-lg cursor-pointer flex justify-between items-center hover:bg-blue-50 border border-gray-100">
                        <span class="text-sm font-medium text-gray-700">${evt.TenHoatDong} <span class="text-green-600 font-bold">(+${evt.DiemRenLuyen}đ)</span></span>
                        <input type="checkbox" class="forecast-cb w-5 h-5 accent-blue-600" value="${evt.DiemRenLuyen}">
                    </label>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });
        }
    } catch (e) {
        console.error("Lỗi tải hoạt động dự báo:", e);
    }
}

// Hàm tính toán (Gắn vào nút "Dự báo ngay")
window.calculateForecast = function() {
    // 1. Lấy điểm hiện tại (từ biến toàn cục appData)
    let currentScore = appData.totalScore || 0;
    
    // 2. Cộng thêm điểm từ các checkbox đã chọn
    let addedScore = 0;
    document.querySelectorAll('.forecast-cb:checked').forEach(cb => {
        addedScore += parseInt(cb.value);
    });
    
    let finalScore = currentScore + addedScore;
    if (finalScore > 100) finalScore = 100; // Max là 100

    // 3. Xếp loại dự kiến
    let rank = "KÉM";
    let colorClass = "text-gray-500";
    
    if (finalScore >= 90) { rank = "XUẤT SẮC"; colorClass = "text-green-500"; }
    else if (finalScore >= 80) { rank = "GIỎI"; colorClass = "text-blue-500"; }
    else if (finalScore >= 70) { rank = "KHÁ"; colorClass = "text-yellow-500"; }
    else if (finalScore >= 50) { rank = "TRUNG BÌNH"; colorClass = "text-orange-500"; }

    // 4. Hiển thị kết quả (Hiệu ứng số chạy)
    animateValue("forecastScore", 0, finalScore, 1000);
    
    const rankEl = document.getElementById('forecastRank');
    if(rankEl) {
        rankEl.innerText = rank;
        rankEl.className = `text-lg font-bold uppercase ${colorClass}`;
    }
}

// Hàm phụ tạo hiệu ứng số chạy tăng dần cho đẹp
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


}