// File: js/chungNhan.js

document.addEventListener('DOMContentLoaded', function() {
    const btnSearch = document.getElementById('btnSearch');
    const searchInput = document.getElementById('searchInput');
    const resultArea = document.getElementById('resultArea');
    const notFound = document.getElementById('notFound');

    // Cấu hình API (Dùng chung base URL với các file khác)
    // Lưu ý: Chúng ta SẼ tạo Controller này ngay sau đây
    const API_URL = 'http://localhost:5114/api/ChungNhans/TraCuu'; 

    btnSearch.addEventListener('click', async function() {
        const keyword = searchInput.value.trim();
        
        if (!keyword) {
            alert("Vui lòng nhập MSSV hoặc Mã xác thực!");
            return;
        }

        // Hiệu ứng loading...
        btnSearch.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tìm...';
        btnSearch.disabled = true;
        resultArea.classList.add('hidden');
        notFound.classList.add('hidden');

        try {
            // Gọi API Tra cứu (Gửi keyword lên)
            const response = await fetch(`${API_URL}?keyword=${keyword}`);
            
            if (response.ok) {
                const cert = await response.json(); // Lấy dữ liệu chứng nhận đầu tiên tìm thấy
                
                if (cert) {
                    // Điền dữ liệu vào Bằng khen
                    document.getElementById('certName').innerText = cert.TenSinhVien;
                    document.getElementById('certMssv').innerText = `MSSV: ${cert.MSSV}`;
                    document.getElementById('certActivity').innerText = cert.TenHoatDong;
                    document.getElementById('certCode').innerText = `Mã: ${cert.MaXacThuc}`;
                    
                    // Format ngày tháng
                    const date = new Date(cert.NgayCap);
                    document.getElementById('certDate').innerText = `ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;

                    // Hiển thị kết quả
                    resultArea.classList.remove('hidden');
                } else {
                    notFound.classList.remove('hidden');
                }
            } else {
                notFound.classList.remove('hidden');
            }

        } catch (error) {
            console.error("Lỗi:", error);
            alert("Có lỗi khi kết nối đến máy chủ.");
        } finally {
            // Reset nút bấm
            btnSearch.innerHTML = '<i class="fas fa-search mr-2"></i> TRA CỨU';
            btnSearch.disabled = false;
        }
    });
});