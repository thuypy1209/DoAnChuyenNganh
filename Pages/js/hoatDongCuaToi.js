// File: js/hoatDongCuaToi.js

document.addEventListener('DOMContentLoaded', async function() {
    // Cấu hình
    const MSSV_HIENTAI = '2280603664'; // Tạm thời fix cứng MSSV của bạn để test
    const API_URL = `http://localhost:5114/api/HoatDongs/CuaToi?mssv=${MSSV_HIENTAI}`;
    
    const container = document.getElementById('myActivitiesContainer');

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Lỗi tải dữ liệu");
        
        const data = await response.json();

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="p-10 text-center flex flex-col items-center">
                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" class="w-24 h-24 opacity-50 mb-4">
                    <p class="text-gray-500 text-lg">Bạn chưa đăng ký hoạt động nào.</p>
                    <a href="dangKyHoatDong.html" class="mt-4 bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800">Đăng ký ngay</a>
                </div>`;
            return;
        }

        // Xóa loading
        container.innerHTML = '';

        // Vẽ từng dòng
        data.forEach(item => {
            // Xử lý màu sắc trạng thái
            let statusBadge = '';
            let actionBtn = '';

            if (item.TrangThaiDuyet === 'ChoDuyet') {
                statusBadge = '<span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200"><i class="fas fa-clock mr-1"></i> Chờ duyệt</span>';
                actionBtn = `<button class="text-red-500 hover:text-red-700 text-sm font-semibold" onclick="huyDangKy(${item.Id})">Hủy đăng ký</button>`;
            } else if (item.TrangThaiDuyet === 'DaDuyet') {
                statusBadge = '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200"><i class="fas fa-check-circle mr-1"></i> Đã duyệt</span>';
                actionBtn = `<button class="text-blue-600 hover:text-blue-800 text-sm font-semibold"><i class="fas fa-qrcode"></i> Mã QR</button>`;
            } else {
                statusBadge = '<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200"><i class="fas fa-times-circle mr-1"></i> Từ chối</span>';
                actionBtn = '<span class="text-gray-400 text-sm">--</span>';
            }

            const rowHtml = `
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 items-center transition-colors">
                    
                    <div class="md:col-span-5 flex items-start gap-3">
                        <img src="${item.PosterUrl || 'images/hutech_logo.png'}" class="w-16 h-16 rounded-md object-cover border border-gray-200 hidden sm:block">
                        <div>
                            <h3 class="font-bold text-blue-900 text-lg leading-tight mb-1">${item.TenHoatDong}</h3>
                            <p class="text-xs text-gray-500">Mã đăng ký: #${item.Id}</p>
                        </div>
                    </div>

                    <div class="md:col-span-3 text-sm text-gray-600">
                        <p class="mb-1"><i class="far fa-calendar-alt w-5 text-blue-500"></i> ${new Date(item.NgayBatDau).toLocaleDateString('vi-VN')}</p>
                        <p><i class="fas fa-map-marker-alt w-5 text-red-500"></i> ${item.DiaDiem || 'Đang cập nhật'}</p>
                    </div>

                    <div class="md:col-span-2 text-center">
                        ${statusBadge}
                    </div>

                    <div class="md:col-span-2 text-center">
                        ${actionBtn}
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', rowHtml);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="p-10 text-center text-red-500">Lỗi kết nối server.</div>';
    }
});

// Hàm Hủy đăng ký (Tạm thời alert thôi, chưa gọi API hủy)
function huyDangKy(id) {
    if(confirm('Bạn có chắc chắn muốn hủy đăng ký hoạt động này không?')) {
        alert('Chức năng hủy đang được phát triển!');
        // Sau này sẽ gọi API Delete tại đây
    }
}

// --- XỬ LÝ QUÉT QR (html5-qrcode) ---
let html5QrcodeScanner = null;

window.openQRScanner = function() {
    document.getElementById('qrModal').classList.remove('hidden');
    
    // Khởi tạo camera
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: { width: 250, height: 250 } }
    );
    
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

window.closeQRScanner = function() {
    document.getElementById('qrModal').classList.add('hidden');
    if(html5QrcodeScanner) {
        html5QrcodeScanner.clear();
    }
}

// Khi quét thành công
// Khi quét thành công
async function onScanSuccess(decodedText, decodedResult) {
    // Dừng camera ngay để tránh quét liên tục
    html5QrcodeScanner.clear();
    
    try {
        console.log("Đang gửi mã hoạt động:", decodedText); // Log để kiểm tra

        const response = await fetch('http://localhost:5114/api/HoatDongs/DiemDanhQR', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                hoatDongId: parseInt(decodedText), 
                mssv: '2280603664' // Fix cứng MSSV của bạn
            })
        });

        // --- ĐOẠN SỬA QUAN TRỌNG: XỬ LÝ AN TOÀN ---
        const text = await response.text(); // Lấy dữ liệu thô về trước
        let result;
        
        try {
            result = JSON.parse(text); // Thử biến nó thành JSON
        } catch (e) {
            // Nếu Server trả về lỗi chữ thường (không phải JSON), ta tự gói nó lại
            result = { message: text }; 
        }
        // ------------------------------------------

        if (response.ok) {
            // Thành công: Ẩn camera, hiện thông báo xanh
            document.getElementById('reader').parentElement.classList.add('hidden');
            document.getElementById('qrResult').classList.remove('hidden');
        } else {
            // Thất bại: Hiện lỗi rõ ràng từ Server
            alert("⚠️ Lỗi từ Server: " + (result.message || result));
            window.closeQRScanner(); // Đóng để quét lại
        }

    } catch (error) {
        console.error("Lỗi kết nối:", error);
        alert("Lỗi kết nối đến máy chủ (Kiểm tra Console F12).");
        window.closeQRScanner();
    }
}

function onScanFailure(error) {
    // Không làm gì cả, cứ tiếp tục quét
}