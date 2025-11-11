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

// js/homeDefault.js

// Lấy URL API Base từ cấu hình toàn cục
const API_TIN_TUC_BASE_URL = window.API_TIN_TUC_BASE_URL;

// Hàm mới để tải danh sách tin tức lên trang chủ
async function loadHomeNews() {
    const NEWS_COUNT = 3; // Lấy 3 bài tin tức mới nhất

    // Khu vực hiển thị tin tức chính (Ví dụ: tin-chinh-area)
    const mainNewsContainer = document.getElementById('main-news-area'); 
    // Khu vực hiển thị tin tức phụ (Ví dụ: tin-phu-area)
    const subNewsContainer = document.getElementById('sub-news-area'); 

    if (!mainNewsContainer || !subNewsContainer) return; // Đảm bảo các thẻ HTML tồn tại

    try {
        const response = await fetch(API_TIN_TUC_BASE_URL); // Gọi GET /api/TinTucs

        if (response.ok) {
            const allNews = await response.json();

            // 1. Sắp xếp: Giả sử tin mới nhất có ID lớn nhất, hoặc sắp xếp theo NgayDang
            const sortedNews = allNews.sort((a, b) => new Date(b.NgayDang) - new Date(a.NgayDang));
            const latestNews = sortedNews.slice(0, NEWS_COUNT);

            if (latestNews.length > 0) {
                // HIỂN THỊ BÀI ĐẦU TIÊN LÀ TIN CHÍNH
                renderMainNews(mainNewsContainer, latestNews[0]); 
                
                // HIỂN THỊ CÁC BÀI CÒN LẠI LÀ TIN PHỤ
                renderSubNews(subNewsContainer, latestNews.slice(1)); 
            } else {
                 mainNewsContainer.innerHTML = "<p>Hiện chưa có tin tức nào được đăng tải.</p>";
            }

        } else {
            console.error("Lỗi tải danh sách tin tức:", response.status);
        }
    } catch (error) {
        console.error("Lỗi kết nối API tin tức:", error);
    }
}

// Hàm hiển thị Tin tức Chính (Bài đầu tiên)
function renderMainNews(container, news) {
    const detailUrl = `tinTucChiTiet.html?id=${news.Id}`;
    container.innerHTML = `
        <a href="${detailUrl}" class="group cursor-pointer block">
            <img src="${news.UrlHinhAnh || 'images/default-news.jpg'}" alt="${news.TieuDe}" class="w-full rounded-lg mb-2 object-cover">
            <h3 class="text-xl font-bold group-hover:text-blue-700">${news.TieuDe}</h3>
            <div class="text-sm text-gray-500 mt-2">${news.NoiDungTomTat || 'Đang cập nhật tóm tắt...'}</div>
        </a>
    `;
}

// Hàm hiển thị Tin tức Phụ (Các bài tiếp theo)
function renderSubNews(container, newsList) {
    container.innerHTML = ''; // Xóa dữ liệu tĩnh cũ
    newsList.forEach(news => {
        const detailUrl = `tinTucChiTiet.html?id=${news.Id}`;
        const newsItem = `
            <a href="${detailUrl}" class="group flex items-start space-x-4 cursor-pointer">
                <img src="${news.UrlHinhAnh || 'images/default-sub.jpg'}" alt="${news.TieuDe}" class="flex-shrink-0 w-32 h-20 object-cover rounded-md">
                <div><h4 class="font-semibold group-hover:text-blue-700">${news.TieuDe}</h4></div>
            </a>
        `;
        container.innerHTML += newsItem;
    });
}

// Bổ sung: Gọi hàm loadHomeNews
document.addEventListener('DOMContentLoaded', loadHomeNews); // Sẽ gọi khi trang tải xong