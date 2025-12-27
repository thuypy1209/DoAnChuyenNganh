// admin_baoCaoThongKe.js - ĐÃ SỬA (Thêm bảo mật JWT)

// 1. Kiểm tra đăng nhập trước khi làm gì hết
function checkLoginStatus() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/account/login.html';
        return null;
    }
    return token;
}

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra login ngay khi tải trang
    const token = checkLoginStatus();
    
    if (token) {
        // Nếu có token thì mới bắt đầu tải dữ liệu
        loadChartTopKhoa(token);
        loadChartTrend(token);
        loadStatsSV5T(token);
    }
});

// Helper: Tạo Header chứa Token
function getAuthHeaders(token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Helper: Lấy URL API (Kết hợp từ Global Config)
// Nếu chưa có window.API_BASE_URL thì fallback về localhost
const BASE_API = (window.API_BASE_URL || 'http://localhost:5114/api') + '/ThongKe';


// 1. BIỂU ĐỒ TOP KHOA (BAR CHART)
async function loadChartTopKhoa(token) {
    try {
        const res = await fetch(`${BASE_API}/TopKhoa`, {
            method: 'GET',
            headers: getAuthHeaders(token) // <--- QUAN TRỌNG: Gửi kèm Token
        });

        if (!res.ok) throw new Error('Lỗi tải Top Khoa');
        const data = await res.json();

        const ctx = document.getElementById('chartTopKhoa').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(i => i.khoa || 'Chưa xác định'),
                datasets: [{
                    label: 'Số lượt tham gia',
                    data: data.map(i => i.soLuot),
                    backgroundColor: '#3b82f6',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });
    } catch (error) {
        console.error(error);
    }
}

// 2. BIỂU ĐỒ XU HƯỚNG (LINE CHART)
async function loadChartTrend(token) {
    try {
        const res = await fetch(`${BASE_API}/XuHuongThang`, {
            method: 'GET',
            headers: getAuthHeaders(token) // <--- QUAN TRỌNG
        });

        if (!res.ok) throw new Error('Lỗi tải Xu hướng');
        const data = await res.json();

        const ctx = document.getElementById('chartTrend').getContext('2d');
        
        // Gradient màu
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(i => i.thang),
                datasets: [{
                    label: 'Lượt tham gia theo tháng',
                    data: data.map(i => i.soLuot),
                    borderColor: '#22c55e',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });
    } catch (error) {
        console.error(error);
    }
}

// 3. THỐNG KÊ SV5T & TOP SINH VIÊN
async function loadStatsSV5T(token) {
    try {
        const res = await fetch(`${BASE_API}/SV5T`, {
            method: 'GET',
            headers: getAuthHeaders(token) // <--- QUAN TRỌNG
        });

        if (!res.ok) throw new Error('Lỗi tải SV5T');
        const data = await res.json();

        // Cập nhật thanh Progress
        document.getElementById('lblTyLeTruong').innerText = `${data.TyLeTruong.toFixed(1)}%`;
        document.getElementById('barTruong').style.width = `${data.TyLeTruong}%`;
        document.getElementById('txtCountTruong').innerText = `${data.DatCapTruong} / ${data.total} sinh viên`;

        document.getElementById('lblTyLeThanh').innerText = `${data.TyLeThanh.toFixed(1)}%`;
        document.getElementById('barThanh').style.width = `${data.TyLeThanh}%`;
        document.getElementById('txtCountThanh').innerText = `${data.DatCapThanh} / ${data.total} sinh viên`;

        // Cập nhật Top Sinh viên
        const tbody = document.getElementById('topStudentTable');
        tbody.innerHTML = '';
        
        data.topSinhVien.forEach((sv, index) => {
            let medal = '';
            if(index === 0) medal = '🥇';
            else if(index === 1) medal = '🥈';
            else if(index === 2) medal = '🥉';
            else medal = `#${index + 1}`;

            const html = `
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-4 font-bold text-lg">${medal}</td>
                    <td class="p-4 font-bold text-blue-900">
                        ${sv.hoTen} <br> <span class="text-xs text-gray-500 font-normal">${sv.mssv}</span>
                    </td>
                    <td class="p-4 text-gray-600">${sv.khoa || '---'}</td>
                    <td class="p-4 text-center font-extrabold text-green-600 text-lg">${sv.diem}</td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', html);
        });
    } catch (error) {
        console.error(error);
    }
}