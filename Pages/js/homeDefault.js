// homeDefault.js - ĐÃ SỬA BỞI AI

// KHÔNG KHAI BÁO LẠI CÁC BIẾN API_..._URL Ở ĐÂY NỮA
// Thay vào đó, chúng ta sẽ dùng các biến đã được định nghĩa trong window (từ globalConfig.js)

async function loadHomeSummaryData() {
    console.log("Đang tải dữ liệu Dashboard...");
    try {
        const [
            doanViensResponse,
            tinTucsResponse,
            lichThisResponse
            
        ] = await Promise.allSettled([ 
            // Dùng các biến từ window
            fetch(window.API_DOAN_VIEN_URL),  // Sử dụng API_DOAN_VIEN_URL (như trong globalConfig.js)
            fetch(window.API_TIN_TUC_BASE_URL), // Sử dụng API_TIN_TUC_BASE_URL
            fetch(window.API_LICH_THI_BASE_URL), // Sử dụng API_LICH_THI_BASE_URL
        ]);

        // Xử lý kết quả cho Tổng số Đoàn viên
        if (doanViensResponse.status === 'fulfilled' && doanViensResponse.value.ok) {
            const doanViens = await doanViensResponse.value.json();
            document.getElementById('homeDoanViensCount').textContent = doanViens.length;
        } else {
            console.error("Lỗi khi tải tổng số Đoàn viên (Home):", doanViensResponse.reason || (doanViensResponse.value ? doanViensResponse.value.statusText : 'Unknown Error'));
            document.getElementById('homeDoanViensCount').textContent = "Lỗi!";
        }

        // Cập nhật Tổng số Tin tức
        if (tinTucsResponse.status === 'fulfilled' && tinTucsResponse.value.ok) {
            const tinTucs = await tinTucsResponse.value.json();
            document.getElementById('homeTinTucsCount').textContent = tinTucs.length;
        } else {
            console.error("Lỗi khi tải tổng số Tin tức (Home):", tinTucsResponse.reason || (tinTucsResponse.value ? tinTucsResponse.value.statusText : 'Unknown Error'));
            document.getElementById('homeTinTucsCount').textContent = "Lỗi!";
        }

        // Cập nhật Tổng số Lịch thi / Lớp tín chỉ (dùng cho "Sự kiện sắp tới")
        if (lichThisResponse.status === 'fulfilled' && lichThisResponse.value.ok) {
            const lichThis = await lichThisResponse.value.json();
            document.getElementById('homeEventsCount').textContent = lichThis.length; 
        } else {
            document.getElementById('homeEventsCount').textContent = "Lỗi!";
            console.error("Lỗi khi tải tổng số Lịch thi (Home):", lichThisResponse.reason || (lichThisResponse.value ? lichThisResponse.value.statusText : 'Unknown Error'));
        }

    } catch (error) {
        console.error("Lỗi tổng thể khi tải dữ liệu Trang chủ:", error);
        
        document.getElementById('homeDoanViensCount').textContent = "Lỗi!";
        document.getElementById('homeTinTucsCount').textContent = "Lỗi!";
        document.getElementById('homeEventsCount').textContent = "Lỗi!";
    }
}

// Gọi hàm khi script được tải
loadHomeSummaryData();