// File: js/phongTrao.js (ĐÃ NÂNG CẤP JWT)

document.addEventListener('DOMContentLoaded', async function() {
    
    // 1. LẤY TOKEN (Nếu có)
    const token = localStorage.getItem('accessToken');
    
    // Tạo Header chuẩn (Nếu đã đăng nhập thì gửi Token, chưa thì thôi)
    const requestHeaders = {
        'Content-Type': 'application/json'
    };
    if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // 2. CẤU HÌNH API
    // (Ưu tiên dùng CONFIG toàn cục nếu có)
    const API_BASE = (typeof CONFIG !== 'undefined') ? CONFIG.API_BASE_URL : "http://localhost:5114/api";
    const API_HOATDONG = `${API_BASE}/HoatDongs`;
    const API_TINTUC = `${API_BASE}/TinTucs`;

    // --- PHẦN 1: TẢI HOẠT ĐỘNG CHO SLIDER VÀ LỊCH ---
    try {
        const res = await fetch(`${API_HOATDONG}?tab=DangMo`, {
            method: 'GET',
            headers: requestHeaders // 🔥 GỬI KÈM TOKEN
        });

        if(res.ok) {
            const data = await res.json();
            renderSlider(data);
            renderCalendar(data);
        } else {
            console.warn("API Hoạt động lỗi:", res.status);
        }
    } catch (e) {
        console.error("Lỗi tải hoạt động:", e);
        const cal = document.getElementById('calendarContainer');
        if(cal) cal.innerHTML = '<p class="text-red-500 text-center">Lỗi kết nối.</p>';
    }

    // --- PHẦN 2: TẢI TIN TỨC ---
    try {
        const resNews = await fetch(API_TINTUC, {
            method: 'GET',
            headers: requestHeaders // 🔥 GỬI KÈM TOKEN
        });

        if(resNews.ok) {
            const newsData = await resNews.json();
            renderNews(newsData);
        } else {
            console.warn("API Tin tức trả về lỗi:", resNews.status);
        }
    } catch (e) {
        console.error("Lỗi tải tin tức:", e);
    }

    // --- HÀM VẼ SLIDER (GIỮ NGUYÊN) ---
    function renderSlider(activities) {
        const container = document.getElementById('featuredContainer');
        if(!container) return;

        const featured = activities.slice(0, 3);
        
        if (featured.length > 0) {
            container.innerHTML = '';
            featured.forEach(act => {
                const imgUrl = act.PosterUrl || act.posterUrl || 'images/banner1.jpg';
                
                const slideHtml = `
                    <div class="swiper-slide relative h-[400px] group cursor-pointer" onclick="window.location.href='dangKyHoatDong.html'">
                        <img src="${imgUrl}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                        <div class="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-transparent to-transparent flex items-end p-8">
                            <div class="text-white max-w-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                <span class="bg-red-600 px-3 py-1 rounded text-xs font-bold mb-3 inline-block shadow-sm">SỰ KIỆN HOT</span>
                                <h3 class="text-3xl md:text-4xl font-bold mb-3 leading-tight shadow-sm">${act.TenHoatDong || act.tenHoatDong}</h3>
                                <button class="bg-yellow-400 text-blue-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-300 transition-colors shadow-lg">
                                    Xem chi tiết & Đăng ký <i class="fas fa-arrow-right ml-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', slideHtml);
            });

            new Swiper(".phongTraoSwiper", {
                loop: true,
                autoplay: { delay: 4000 },
                pagination: { el: ".swiper-pagination", clickable: true },
                navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            });
        }
    }

    // --- HÀM VẼ LỊCH (GIỮ NGUYÊN) ---
    function renderCalendar(activities) {
        const container = document.getElementById('calendarContainer');
        if(!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">Không có sự kiện nào sắp tới.</p>';
            return;
        }

        container.innerHTML = '';
        activities.forEach(act => {
            const date = new Date(act.NgayBatDau || act.ngayBatDau);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const diaDiem = act.DiaDiem || act.diaDiem || 'HUTECH';
            const diem = act.DiemRenLuyen || act.diemRenLuyen;

            const html = `
                <div class="date-card bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:border-blue-300 transition-colors">
                    <div class="flex-shrink-0 w-20 h-20 bg-blue-50 rounded-xl flex flex-col items-center justify-center border border-blue-100 text-blue-900">
                        <span class="text-xs font-bold uppercase text-blue-500">Tháng ${month}</span>
                        <span class="text-3xl font-extrabold">${day}</span>
                    </div>
                    <div class="flex-grow">
                        <h3 class="text-lg font-bold text-gray-800 hover:text-blue-700 line-clamp-1">${act.TenHoatDong || act.tenHoatDong}</h3>
                        <div class="text-sm text-gray-500 mt-1 flex items-center gap-4">
                            <span><i class="far fa-clock mr-1"></i> ${date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                            <span><i class="fas fa-map-marker-alt mr-1 text-red-500"></i> ${diaDiem}</span>
                        </div>
                        <div class="mt-2 flex items-center gap-2">
                            <span class="text-xs text-blue-600 font-bold">+${diem} điểm</span>
                        </div>
                    </div>
                    <a href="dangKyHoatDong.html" class="hidden md:block px-4 py-2 bg-blue-900 text-white text-sm font-bold rounded-lg hover:bg-blue-800 shadow-sm whitespace-nowrap">
                        Đăng ký ngay
                    </a>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    }

    // --- HÀM VẼ TIN TỨC (GIỮ NGUYÊN) ---
    function renderNews(newsList) {
        const container = document.getElementById('newsContainer');
        if(!container) return;

        if(newsList.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-4">Chưa có tin tức.</p>';
            return;
        }

        container.innerHTML = '';
        const latestNews = newsList.sort((a, b) => new Date(b.NgayDang) - new Date(a.NgayDang)).slice(0, 5);

        latestNews.forEach(news => {
            const imgUrl = news.HinhAnhUrl || news.hinhAnhUrl || 'images/banner1.jpg';
            const date = new Date(news.NgayDang);

            const html = `
                <a href="#" class="flex gap-3 group border-b border-gray-100 pb-3 last:border-0 last:pb-0 mb-3" onclick="window.location.href='tinTucChiTiet.html?id=${news.Id}'">
                    <div class="w-20 h-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img src="${imgUrl}" class="w-full h-full object-cover transition-transform group-hover:scale-110">
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-gray-800 group-hover:text-blue-700 line-clamp-2 leading-snug">${news.TieuDe}</h4>
                        <p class="text-xs text-gray-400 mt-1">${date.toLocaleDateString('vi-VN')}</p>
                    </div>
                </a>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    }

    window.viewImage = function(src) {
        document.getElementById('modalImage').src = src;
        document.getElementById('imageModal').classList.remove('hidden');
    }
});