document.addEventListener('DOMContentLoaded', async function() {
    // 1. Lấy ID từ trên thanh địa chỉ (Ví dụ: tinTucChiTiet.html?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    if (!newsId) {
        alert("Không tìm thấy bài viết!");
        window.location.href = "Home.html";
        return;
    }

    // 2. Gọi API lấy chi tiết 1 bài tin
    // Lưu ý: Cổng 5114 hoặc 7006 tùy máy em (nhớ check lại globalConfig)
    const API_URL = `http://localhost:5114/api/TinTucs/${newsId}`;

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error("Không tìm thấy bài viết trong Database");

        const data = await response.json();

        // 3. Điền dữ liệu vào HTML
        document.title = data.TieuDe + " - HUTECH"; // Đổi tên tab trình duyệt
        
        document.getElementById('newsTitle').innerText = data.TieuDe;
        document.getElementById('newsDate').innerText = new Date(data.NgayDang).toLocaleDateString('vi-VN');
        
        // Xử lý ảnh
        const img = document.getElementById('newsImage');
        img.src = data.HinhAnhUrl || data.hinhAnhUrl || 'images/banner1.jpg';

        // Xử lý nội dung (Nếu có xuống dòng thì đổi thành thẻ <br>)
        // data.NoiDung có thể là null, nên phải check
        const content = data.NoiDung || data.noiDung || "Bài viết này chưa có nội dung chi tiết.";
        // Chuyển ký tự xuống dòng (\n) thành thẻ <br> để hiển thị đẹp hơn
        document.getElementById('newsContent').innerHTML = content.replace(/\n/g, "<br>");

    } catch (error) {
        console.error(error);
        document.getElementById('newsTitle').innerText = "Lỗi tải trang";
        document.getElementById('newsContent').innerHTML = `<div class="text-center text-red-500 py-10"><i class="fas fa-exclamation-triangle text-4xl mb-3"></i><p>${error.message}</p></div>`;
    }
});