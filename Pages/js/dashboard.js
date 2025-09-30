// dashboard.js - ĐÃ SỬA VÀ CẬP NHẬT TRƯỜNG MỚI BỞI AI

// KHÔNG KHAI BÁO LẠI CÁC BIẾN API_..._URL Ở ĐÂY NỮA
// Thay vào đó, chúng ta sẽ dùng các biến đã được định nghĩa trong window (từ globalConfig.js)

async function loadDashboardData() {
    console.log("Đang tải dữ liệu Dashboard...");
    try {
        const [
            doanViensResponse,
            tinTucsResponse,
            lichThisResponse,
            danhMucsResponse
        ] = await Promise.allSettled([ 
            // Dùng các biến từ window
            fetch(window.API_DOAN_VIEN_URL),  
            fetch(window.API_TIN_TUC_BASE_URL), 
            fetch(window.API_LICH_THI_BASE_URL), 
            fetch(window.API_DANH_MUC_BASE_URL) 
        ]);

        // Xử lý kết quả cho Tổng số Đoàn viên
        if (doanViensResponse.status === 'fulfilled' && doanViensResponse.value.ok) {
            const doanViens = await doanViensResponse.value.json();
            document.getElementById('totalDoanViens').textContent = doanViens.length;
        } else {
            console.error("Lỗi khi tải tổng số Đoàn viên:", doanViensResponse.reason || (doanViensResponse.value ? doanViensResponse.value.statusText : 'Unknown Error'));
            document.getElementById('totalDoanViens').textContent = "Lỗi!";
        }

        // Xử lý kết quả cho Tổng số Tin tức
        if (tinTucsResponse.status === 'fulfilled' && tinTucsResponse.value.ok) {
            const tinTucs = await tinTucsResponse.value.json();
            document.getElementById('totalTinTucs').textContent = tinTucs.length;
        } else {
            console.error("Lỗi khi tải tổng số Tin tức:", tinTucsResponse.reason || (tinTucsResponse.value ? tinTucsResponse.value.statusText : 'Unknown Error'));
            document.getElementById('totalTinTucs').textContent = "Lỗi!";
        }

        // Xử lý kết quả cho Tổng số Lịch thi / Lớp tín chỉ
        if (lichThisResponse.status === 'fulfilled' && lichThisResponse.value.ok) {
            const lichThis = await lichThisResponse.value.json();
            document.getElementById('totalLichThis').textContent = lichThis.length;
        } else {
            console.error("Lỗi khi tải tổng số Lịch thi:", lichThisResponse.reason || (lichThisResponse.value ? lichThisResponse.value.statusText : 'Unknown Error'));
            document.getElementById('totalLichThis').textContent = "Lỗi!";
        }

        // Xử lý kết quả cho Tổng số Danh mục
        if (danhMucsResponse.status === 'fulfilled' && danhMucsResponse.value.ok) {
            const danhMucs = await danhMucsResponse.value.json();
            document.getElementById('totalDanhMucs').textContent = danhMucs.length;
        } else {
            console.error("Lỗi khi tải tổng số Danh mục:", danhMucsResponse.reason || (danhMucsResponse.value ? danhMucsResponse.value.statusText : 'Unknown Error'));
            document.getElementById('totalDanhMucs').textContent = "Lỗi!";
        }

    } catch (error) {
        console.error("Lỗi tổng thể khi tải dữ liệu Dashboard:", error);
        
        document.getElementById('totalDoanViens').textContent = "Lỗi!";
        document.getElementById('totalTinTucs').textContent = "Lỗi!";
        document.getElementById('totalLichThis').textContent = "Lỗi!";
        document.getElementById('totalDanhMucs').textContent = "Lỗi!";
    }
}

// Gọi hàm khi script được tải
loadDashboardData();