// File: js/vanBanChiDao.js

document.addEventListener('DOMContentLoaded', function() {
    
    // Lấy ra tất cả các nút tab và các vùng nội dung
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Lắng nghe sự kiện click trên mỗi nút tab
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            
            // 1. Xóa trạng thái "active" khỏi tất cả các nút
            tabButtons.forEach(btn => {
                btn.classList.remove('border-blue-500', 'text-blue-600');
                btn.classList.add('border-transparent', 'text-gray-500');
            });

            // 2. Thêm trạng thái "active" cho nút vừa được nhấn
            this.classList.add('border-blue-500', 'text-blue-600');
            this.classList.remove('border-transparent', 'text-gray-500');

            // 3. Ẩn tất cả các vùng nội dung
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });

            // 4. Hiển thị vùng nội dung tương ứng với nút vừa được nhấn
            const contentId = this.getAttribute('data-content-id');
            const activeContent = document.getElementById(contentId);
            if (activeContent) {
                activeContent.classList.remove('hidden');
            }
        });
    });

    // Code để tải dữ liệu cho các bảng sẽ được thêm vào đây sau
});