// File: js/viChungNhan.js - ĐÃ NÂNG CẤP JWT

document.addEventListener('DOMContentLoaded', async function() {
    
    // 1. LẤY TOKEN VÀ MSSV TỪ LOCAL STORAGE
    const token = localStorage.getItem('accessToken');
    const currentUserMssv = localStorage.getItem('userMssv');
    const currentUserName = localStorage.getItem('userName');
    
    // Lấy cấu hình API
    const API_BASE = (typeof CONFIG !== 'undefined') ? CONFIG.API_BASE_URL : "http://localhost:5114/api";

    // 2. KIỂM TRA ĐĂNG NHẬP
    if (!token || !currentUserMssv) {
        alert("Phiên đăng nhập hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại!");
        window.location.href = '/account/login.html';
        return;
    }

    console.log("Đang tải ví của MSSV:", currentUserMssv);
    
    // Gọi API lấy chứng nhận (Vẫn giữ mssv trên URL để Backend lọc nhanh)
    const API_URL = `${API_BASE}/ChungNhans/CuaToi?mssv=${currentUserMssv}`;
    
    const container = document.getElementById('walletContainer');
    if (!container) return; 
    
    // 3. TẢI DỮ LIỆU (CÓ GỬI KÈM TOKEN)
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // 🔥 QUAN TRỌNG: Gửi vé thông hành
                'Content-Type': 'application/json'
            }
        });

        // Nếu Server báo 401 (Hết hạn Token) -> Đuổi về đăng nhập
        if (response.status === 401) {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            localStorage.clear();
            window.location.href = '/account/login.html';
            return;
        }

        if (!response.ok) throw new Error("Lỗi tải ví chứng nhận");
        
        const data = await response.json();

        // Nếu ví trống
        if (!data || data.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                    <i class="fas fa-folder-open text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">Ví của bạn đang trống.</p>
                    <p class="text-sm text-gray-400 mt-1">Hãy tham gia hoạt động để nhận chứng nhận nhé!</p>
                </div>`;
            return;
        }

        container.innerHTML = ''; // Xóa loading cũ

        // Vẽ danh sách chứng nhận
        data.forEach(cert => {
            const colors = ['blue', 'green', 'purple', 'red', 'yellow'];
            const color = colors[(cert.id || 0) % colors.length]; 
            const date = new Date(cert.NgayCap);

            const cardHtml = `
                <div class="cert-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group relative"
                     onclick='openCertModal(${JSON.stringify(cert)})'>
                    
                    <div class="h-40 bg-${color}-50 p-4 relative border-b border-gray-100 flex flex-col justify-center items-center text-center bg-pattern">
                        <i class="fas fa-award text-4xl text-${color}-600 mb-2 drop-shadow-sm group-hover:scale-110 transition-transform"></i>
                        <h3 class="font-certificate font-bold text-gray-800 text-lg line-clamp-2 px-2">${cert.TenHoatDong}</h3>
                        <div class="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow animate-pulse">MỚI</div>
                    </div>

                    <div class="p-4">
                        <div class="flex justify-between items-end">
                            <div>
                                <p class="text-xs text-gray-400 uppercase font-bold">Ngày cấp</p>
                                <p class="text-sm font-semibold text-gray-700">${date.toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-gray-400 uppercase font-bold">Mã xác thực</p>
                                <p class="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">${cert.MaXacThuc}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors flex items-center justify-center">
                        <span class="bg-white text-blue-900 px-4 py-2 rounded-full font-bold shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            <i class="fas fa-eye mr-1"></i> Xem chi tiết
                        </span>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<div class="col-span-full text-center text-red-500">Lỗi kết nối server (Kiểm tra xem Backend chạy chưa).</div>';
    }
});

// 4. Xử lý Modal (Xem chi tiết)
window.openCertModal = function(cert) {
    const modal = document.getElementById('certModal');
    const date = new Date(cert.NgayCap);

    document.getElementById('modalCertName').innerText = cert.TenSinhVien;
    document.getElementById('modalCertMssv').innerText = `MSSV: ${cert.MSSV}`;
    document.getElementById('modalCertActivity').innerText = cert.TenHoatDong;
    document.getElementById('modalCertCode').innerText = `Mã: ${cert.MaXacThuc}`;
    document.getElementById('modalCertDate').innerText = `ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;

    modal.classList.remove('hidden');
}

window.closeModal = function() {
    document.getElementById('certModal').classList.add('hidden');
}

// --- XỬ LÝ YÊU CẦU CẤP MỚI ---

window.openRequestModal = function() {
    document.getElementById('requestModal').classList.remove('hidden');
}

window.submitRequest = async function() {
    const token = localStorage.getItem('accessToken'); // Lấy lại token cho chắc
    const currentUserMssv = localStorage.getItem('userMssv');
    const currentUserName = localStorage.getItem('userName');
    const API_BASE = (typeof CONFIG !== 'undefined') ? CONFIG.API_BASE_URL : "http://localhost:5114/api";

    const tenHoatDong = document.getElementById('reqTenHoatDong').value;
    const loai = document.getElementById('reqLoai').value;
    const minhChung = document.getElementById('reqMinhChung').value;
    const lyDo = document.getElementById('reqLyDo').value;

    if (!tenHoatDong) {
        alert("Vui lòng nhập tên hoạt động!");
        return;
    }

    const data = {
        mssv: currentUserMssv,
        tenSinhVien: currentUserName,
        tenHoatDong: tenHoatDong,
        loaiChungNhan: loai,
        minhChungUrl: minhChung,
        lyDo: lyDo
    };

    try {
        const response = await fetch(`${API_BASE}/ChungNhans/YeuCau`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 🔥 THÊM TOKEN VÀO ĐÂY NỮA
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("✅ Gửi yêu cầu thành công! Cán bộ sẽ xem xét sớm.");
            document.getElementById('requestModal').classList.add('hidden');
            // Reset form
            document.getElementById('reqTenHoatDong').value = '';
            document.getElementById('reqMinhChung').value = '';
            document.getElementById('reqLyDo').value = '';
        } else {
            const errData = await response.json();
            alert("❌ Lỗi: " + (errData.message || "Không gửi được yêu cầu"));
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối server.");
    }
}

// --- CHỨC NĂNG TẢI ẢNH (GIỮ NGUYÊN) ---
window.downloadCertImage = function() {
    const element = document.getElementById('printArea'); 
    const btn = document.querySelector('button[onclick="downloadCertImage()"]');
    
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    btn.disabled = true;

    const options = {
        scale: 2, 
        useCORS: true, 
        allowTaint: true,
        backgroundColor: '#ffffff', 
        logging: true, 
    };

    html2canvas(element, options).then(canvas => {
        const link = document.createElement('a');
        link.download = `ChungNhan_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        btn.innerHTML = oldText;
        btn.disabled = false;
    }).catch(err => {
        console.error("Lỗi chụp ảnh:", err);
        alert("Lỗi khi tạo ảnh. Vui lòng thử lại!");
        btn.innerHTML = oldText;
        btn.disabled = false;
    });
}