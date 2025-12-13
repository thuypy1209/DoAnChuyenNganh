const CONFIG = {
    // Địa chỉ Backend (Bộ não) - Đang chạy cổng 5114
    API_BASE_URL: 'http://localhost:5114/api',
    
    // Đường dẫn gốc để lấy ảnh (nếu cần sau này)
    IMAGE_URL: 'http://localhost:5114',
};

// Log ra màn hình console để biết file này đã chạy
console.log("Global Config đã tải thành công! Kết nối tới: " + CONFIG.API_BASE_URL);