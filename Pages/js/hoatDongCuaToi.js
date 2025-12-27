document.addEventListener('DOMContentLoaded', async function() {
    // --- 1. LẤY MSSV TỪ AUTHEN.JS ĐÃ LƯU ---
    // (Phải dùng đúng tên 'userMssv' như trong file authen.js)
    const MSSV_HIENTAI = localStorage.getItem('userMssv'); 

    console.log("MSSV hiện tại:", MSSV_HIENTAI); // Log ra để kiểm tra

    // Kiểm tra: Nếu chưa đăng nhập thì đuổi về trang Login
    if (!MSSV_HIENTAI || MSSV_HIENTAI === "Chưa cập nhật") {
        alert("Bạn chưa đăng nhập hoặc tài khoản lỗi! Vui lòng đăng nhập lại.");
        window.location.href = "/account/login.html"; // Trỏ về đúng trang login
        return;
    }

    // Gắn MSSV vào API
    const API_URL = `http://localhost:5114/api/HoatDongs/CuaToi?mssv=${MSSV_HIENTAI}`;
    
    const container = document.getElementById('myActivitiesContainer');

    try {
        const response = await fetch(API_URL);
        
        // Xử lý lỗi 404 hoặc lỗi mạng
        if (!response.ok) {
            throw new Error(`Lỗi tải dữ liệu (${response.status})`);
        }
        
        const data = await response.json();

        // Nếu không có dữ liệu
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="p-10 text-center flex flex-col items-center">
                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" class="w-24 h-24 opacity-50 mb-4">
                    <p class="text-gray-500 text-lg">Bạn chưa đăng ký hoạt động nào.</p>
                    <a href="dangKyHoatDong.html" class="mt-4 bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800">Đăng ký ngay</a>
                </div>`;
            return;
        }

        // Xóa loading và Vẽ danh sách
        container.innerHTML = '';

        data.forEach(item => {
            // Xử lý hiển thị trạng thái
            let statusBadge = '';
            let actionBtn = '';

            if (item.TrangThaiDuyet === 'ChoDuyet') {
                statusBadge = '<span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200"><i class="fas fa-clock mr-1"></i> Chờ duyệt</span>';
                actionBtn = `<button class="text-red-500 hover:text-red-700 text-sm font-semibold" onclick="huyDangKy(${item.Id})">Hủy đăng ký</button>`;
            } else if (item.TrangThaiDuyet === 'DaDuyet') {
                statusBadge = '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200"><i class="fas fa-check-circle mr-1"></i> Đã duyệt</span>';
                actionBtn = `<button class="text-blue-600 hover:text-blue-800 text-sm font-semibold" onclick="showQRCode(${item.Id}, '${item.TenHoatDong}')"><i class="fas fa-qrcode"></i> Mã QR</button>`;
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
                            <p class="text-xs text-gray-500">Mã: #${item.Id}</p>
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
        container.innerHTML = '<div class="p-10 text-center text-red-500">Không thể tải dữ liệu. Vui lòng kiểm tra lại kết nối.</div>';
    }
});

// Hàm Hủy đăng ký
function huyDangKy(id) {
    if(confirm('Bạn có chắc chắn muốn hủy đăng ký hoạt động này không?')) {
        alert('Tính năng đang phát triển!');
    }
}

// --- XỬ LÝ QUÉT QR (Cũng phải sửa đúng tên biến) ---
let html5QrcodeScanner = null;

window.openQRScanner = function() {
    const qrModal = document.getElementById('qrModal');
    if(qrModal) qrModal.classList.remove('hidden');
    
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: { width: 250, height: 250 } }
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

window.closeQRScanner = function() {
    const qrModal = document.getElementById('qrModal');
    if(qrModal) qrModal.classList.add('hidden');
    
    if(html5QrcodeScanner) {
        html5QrcodeScanner.clear();
    }
}

async function onScanSuccess(decodedText, decodedResult) {
    html5QrcodeScanner.clear();
    
    // 🔥 LẤY ĐÚNG BIẾN userMssv TỪ AUTHEN.JS
    const currentMssv = localStorage.getItem('userMssv');

    try {
        console.log("Đang điểm danh hoạt động:", decodedText);

        const response = await fetch('http://localhost:5114/api/HoatDongs/DiemDanhQR', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                hoatDongId: parseInt(decodedText), 
                mssv: currentMssv // Gửi MSSV chuẩn lên
            })
        });

        // Xử lý kết quả trả về (Text hoặc JSON)
        const text = await response.text(); 
        let result;
        try { result = JSON.parse(text); } catch (e) { result = { message: text }; }

        if (response.ok) {
            // Ẩn camera, hiện thông báo thành công
            const reader = document.getElementById('reader');
            if(reader) reader.parentElement.classList.add('hidden');
            
            const resultDiv = document.getElementById('qrResult');
            if(resultDiv) resultDiv.classList.remove('hidden');
        } else {
            alert("⚠️ Lỗi: " + (result.message || result));
            window.closeQRScanner();
        }

    } catch (error) {
        console.error("Lỗi:", error);
        alert("Lỗi kết nối Server.");
        window.closeQRScanner();
    }
}

function onScanFailure(error) {
    // Không làm gì để nó quét tiếp
}