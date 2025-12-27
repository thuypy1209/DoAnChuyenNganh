// dashboard.js - ĐÃ SỬA (Thêm xác thực JWT)

// 1. Kiểm tra đăng nhập ngay lập tức
function checkLoginStatus() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        // Chưa có token thì đá về trang login ngay
        window.location.href = '/account/login.html'; 
    }
    return token; // Trả về token để dùng ở dưới
}

// Gọi hàm kiểm tra
const currentToken = checkLoginStatus(); 

// 2. Chặn trường hợp Back từ cache (tránh lỗi hiển thị khi đã logout)
window.addEventListener('pageshow', function (event) {
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
         window.location.reload(); 
    }
});

// 3. Hàm tải dữ liệu Dashboard
async function loadDashboardData() {
    console.log("Đang tải dữ liệu Dashboard...");

    // LẤY TOKEN ĐỂ GỬI KÈM REQUEST
    const token = localStorage.getItem('accessToken');
    
    // Tạo Header chứa Token (Cái này quan trọng nhất nè)
    const myHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };

    try {
        // Gọi song song các API để tiết kiệm thời gian
        const [
            doanViensResponse,
            tinTucsResponse,
            lichThisResponse,
            danhMucsResponse
        ] = await Promise.allSettled([ 
            // Thêm { headers: myHeaders } vào từng lệnh fetch
            fetch(window.API_DOAN_VIEN_URL, { headers: myHeaders }),  
            fetch(window.API_TIN_TUC_BASE_URL, { headers: myHeaders }), 
            fetch(window.API_LICH_THI_BASE_URL, { headers: myHeaders }), 
            fetch(window.API_DANH_MUC_BASE_URL, { headers: myHeaders }) 
        ]);

        // --- XỬ LÝ KẾT QUẢ ---

        // 1. Tổng số Đoàn viên
        if (doanViensResponse.status === 'fulfilled' && doanViensResponse.value.ok) {
            const doanViens = await doanViensResponse.value.json();
            document.getElementById('totalDoanViens').textContent = doanViens.length;
        } else {
            console.error("Lỗi tải Đoàn viên:", doanViensResponse);
            document.getElementById('totalDoanViens').textContent = "Lỗi";
        }

        // 2. Tổng số Tin tức
        if (tinTucsResponse.status === 'fulfilled' && tinTucsResponse.value.ok) {
            const tinTucs = await tinTucsResponse.value.json();
            document.getElementById('totalTinTucs').textContent = tinTucs.length;
        } else {
            console.error("Lỗi tải Tin tức:", tinTucsResponse);
            document.getElementById('totalTinTucs').textContent = "Lỗi";
        }

        // 3. Tổng số Lịch thi
        if (lichThisResponse.status === 'fulfilled' && lichThisResponse.value.ok) {
            const lichThis = await lichThisResponse.value.json();
            document.getElementById('totalLichThis').textContent = lichThis.length;
        } else {
            console.error("Lỗi tải Lịch thi:", lichThisResponse);
            document.getElementById('totalLichThis').textContent = "Lỗi";
        }

        // 4. Tổng số Danh mục
        if (danhMucsResponse.status === 'fulfilled' && danhMucsResponse.value.ok) {
            const danhMucs = await danhMucsResponse.value.json();
            document.getElementById('totalDanhMucs').textContent = danhMucs.length;
        } else {
            console.error("Lỗi tải Danh mục:", danhMucsResponse);
            document.getElementById('totalDanhMucs').textContent = "Lỗi";
        }

    } catch (error) {
        console.error("Lỗi tổng thể khi tải dữ liệu Dashboard:", error);
        // Reset về hiển thị lỗi nếu crash toàn tập
        document.getElementById('totalDoanViens').textContent = "---";
        document.getElementById('totalTinTucs').textContent = "---";
        document.getElementById('totalLichThis').textContent = "---";
        document.getElementById('totalDanhMucs').textContent = "---";
    }
}

// Chạy hàm tải dữ liệu
loadDashboardData();