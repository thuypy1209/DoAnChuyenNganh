// js/tinTucChiTiet.js

// LẤY URL API BASE TỪ CẤU HÌNH TOÀN CỤC
const API_TIN_TUC_BASE_URL = window.API_TIN_TUC_BASE_URL; // Đảm bảo biến này tồn tại trong globalConfig.js

// Hàm 1: Lấy ID từ thanh địa chỉ (URL)
function getNewsIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search); 
    return urlParams.get('id'); 
}

// Hàm 2: Gọi API và hiển thị chi tiết bài viết
async function fetchAndDisplayNewsDetail() {
    const newsId = getNewsIdFromUrl();

    if (!newsId) {
        renderNewsDetail({ TieuDe: "Lỗi: Không tìm thấy ID tin tức.", NoiDung: "<p>Vui lòng quay lại Trang chủ.</p>" });
        return;
    }

    // Đường dẫn API hoàn chỉnh: ví dụ: https://localhost:7001/api/TinTucs/123
    const DETAIL_API = `${API_TIN_TUC_BASE_URL}/${newsId}`; 

    try {
        const response = await fetch(DETAIL_API); 

        if (response.ok) {
            const newsData = await response.json();
            
            // THÀNH CÔNG: Hiển thị dữ liệu THẬT từ API
            renderNewsDetail(newsData); 
        } else {
            // LỖI: Không tìm thấy bài viết trên DB
            renderNewsDetail({ TieuDe: `Lỗi ${response.status}: Bài viết không tồn tại.`, NoiDung: `<p>Mã lỗi từ máy chủ: ${response.status}. Bài viết ID=${newsId} không có trong cơ sở dữ liệu.</p>` }); 
        }
    } catch (error) {
        // LỖI: Kết nối mạng, CORS, hoặc API Back-end không chạy
        console.error("Lỗi kết nối hoặc xử lý dữ liệu:", error);
        renderNewsDetail({ TieuDe: "Lỗi kết nối", NoiDung: "<p>Không thể kết nối đến máy chủ API (kiểm tra CORS/cổng API).</p>" });
    }
}

// Hàm 3: Hiển thị dữ liệu lên giao diện
function renderNewsDetail(news) {
    // 1+1=2: Đảm bảo news.Id được dùng thay vì news.Id 
    document.getElementById('page-title').innerText = `${news.TieuDe} - QL Đoàn viên`;
    document.getElementById('news-title').innerText = news.TieuDe || 'Chưa có Tiêu đề';
    
    // Cập nhật Ngày đăng
    if (news.NgayDang) {
        const date = new Date(news.NgayDang);
        document.getElementById('news-date').innerText = date.toLocaleDateString('vi-VN');
    } else {
        document.getElementById('news-date').innerText = 'N/A';
    }
    
    // Cập nhật Hình ảnh (Giả định news.UrlHinhAnh là đường dẫn)
    const newsImage = document.getElementById('news-image');
    if (news.UrlHinhAnh) {
        newsImage.src = news.UrlHinhAnh;
        newsImage.style.display = 'block'; 
    } else {
        newsImage.style.display = 'none'; 
    }
    
    // Cập nhật Nội dung chi tiết
    document.getElementById('news-content').innerHTML = news.NoiDung || '<p>Không có nội dung chi tiết cho bài viết này.</p>'; 
    
    // Tạm thời hiển thị tác giả là Admin
    document.getElementById('news-author').innerText = news.TenTacGia || 'Admin'; 
}

// Chạy hàm chính khi trang tải xong
document.addEventListener('DOMContentLoaded', fetchAndDisplayNewsDetail);