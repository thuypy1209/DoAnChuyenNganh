const API_BASE = "http://localhost:5114/api";

document.addEventListener('DOMContentLoaded', async function() {
    // 1. Tải số liệu thống kê
    await loadStats();
    
    // 2. Tải danh sách yêu cầu mới
    await loadRecentRequests();
    
    // 3. Vẽ biểu đồ (Giữ nguyên hoặc cập nhật sau)
    initCharts();
});

// --- HÀM 1: LẤY SỐ LIỆU THỐNG KÊ (DÙNG API MỚI) ---
async function loadStats() {
    try {
        // Gọi API Thống kê mới làm
        const response = await fetch(`${API_BASE}/HoatDongs/ThongKeDashboard`);
        
        if (response.ok) {
            const data = await response.json();
            
            // 1. Tổng sinh viên
            document.getElementById('countStudent').innerText = data.SinhVien;
            
            // 2. Hoạt động đang mở
            document.getElementById('countActive').innerText = data.DangMo;
            
            // 3. Đơn chờ duyệt
            document.getElementById('countPending').innerText = data.ChoDuyet;
            
            // 4. Chứng nhận đã cấp (Số này giờ sẽ chuẩn vì Server đã đếm hộ rồi)
            document.getElementById('countCert').innerText = data.DaCap;
        }
    } catch (e) { 
        console.error("Lỗi tải thống kê:", e); 
    }
}

// --- HÀM 2: LẤY YÊU CẦU MỚI NHẤT (BẢNG BÊN DƯỚI) ---
async function loadRecentRequests() {
    const tbody = document.getElementById('requestTableBody');
    if(!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/HoatDongs/DanhSachChoDuyet`);
        const data = await res.json();
        
        tbody.innerHTML = '';
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">Không có đơn mới.</td></tr>';
            return;
        }

        // Lấy 5 đơn đầu tiên
        data.slice(0, 5).forEach(item => {
            const html = `
                <tr class="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3"><input type="checkbox" class="rounded"></td>
                    <td class="px-4 py-3 font-medium text-gray-900">
                        ${item.TenSinhVien} <br>
                        <span class="text-xs text-gray-500">${item.MSSV}</span>
                    </td>
                    <td class="px-4 py-3 text-blue-800 font-medium">${item.TenHoatDong}</td>
                    <td class="px-4 py-3 text-center">
                        <button onclick="duyetDon(${item.Id}, 'DaDuyet')" class="text-green-600 hover:bg-green-100 px-3 py-1 rounded font-bold mr-2 text-xs">Duyệt</button>
                        <button onclick="duyetDon(${item.Id}, 'TuChoi')" class="text-red-500 hover:bg-red-100 px-3 py-1 rounded text-xs">Từ chối</button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', html);
        });
    } catch (e) { console.error(e); }
}

// --- HÀM 3: XỬ LÝ DUYỆT NHANH ---
async function duyetDon(id, status) {
    if(!confirm("Xác nhận xử lý đơn này?")) return;
    try {
        const res = await fetch(`${API_BASE}/HoatDongs/DuyetDangKy`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ Id: id, TrangThai: status })
        });
        if(res.ok) {
            alert("Đã xử lý thành công!");
            loadStats(); // Cập nhật lại số liệu ngay lập tức
            loadRecentRequests(); // Cập nhật lại bảng
        } else {
            alert("Lỗi khi xử lý.");
        }
    } catch (e) { alert("Lỗi kết nối."); }
}

// --- HÀM 4: XUẤT BÁO CÁO TỔNG HỢP (EXCEL) ---
window.exportGeneralReport = async function() {
    try {
        // 1. Thông báo đang tải
        const btn = document.querySelector("a[onclick='exportGeneralReport()']");
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo file...';

        // 2. Lấy dữ liệu toàn bộ hoạt động
        const res = await fetch(`${API_BASE}/HoatDongs?filter=All`);
        if (!res.ok) throw new Error("Lỗi tải dữ liệu");
        
        const activities = await res.json();

        // 3. Chuyển đổi dữ liệu sang định dạng Excel
        const excelData = activities.map(item => ({
            "Mã HĐ": item.Id,
            "Tên Hoạt Động": item.TenHoatDong,
            "Loại": item.LoaiHoatDong,
            "Ngày Bắt Đầu": new Date(item.NgayBatDau).toLocaleDateString('vi-VN'),
            "Địa Điểm": item.DiaDiem,
            "Đã Đăng Ký": item.SoLuongDaDangKy,
            "Tối Đa": item.SoLuongToiDa,
            "Điểm RL": item.DiemRenLuyen,
            "Trạng Thái": item.TrangThaiHienTai
        }));

        // 4. Tạo file Excel
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "TongHopHoatDong");

        // 5. Tải xuống
        XLSX.writeFile(workbook, `BaoCao_TongHop_${new Date().getTime()}.xlsx`);

        // 6. Trả lại nút bấm
        btn.innerHTML = originalText;

    } catch (e) {
        console.error(e);
        alert("Không thể xuất báo cáo: " + e.message);
        // Nếu lỗi, trả lại nút bấm
        const btn = document.querySelector("a[onclick='exportGeneralReport()']");
        if(btn) btn.innerHTML = originalText; 
    }
}

// --- HÀM 5: KHỞI TẠO BIỂU ĐỒ (Giữ nguyên mẫu) ---
function initCharts() {
    const ctxTrend = document.getElementById('trendChart');
    if(ctxTrend) {
        new Chart(ctxTrend.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['T8', 'T9', 'T10', 'T11', 'T12', 'T1'],
                datasets: [{
                    label: 'Lượt tham gia',
                    data: [150, 300, 450, 320, 500, 600],
                    borderColor: '#1e3a8a', tension: 0.4, fill: true, backgroundColor: 'rgba(30,58,138,0.1)'
                }]
            }
        });
    }

    const ctxPie = document.getElementById('categoryChart');
    if(ctxPie) {
        new Chart(ctxPie.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Tình nguyện', 'Học thuật', 'Khác'],
                datasets: [{
                    data: [45, 25, 30],
                    backgroundColor: ['#3b82f6', '#a855f7', '#facc15']
                }]
            }
        });
    }
}