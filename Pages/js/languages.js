const translations = {
    "vi": {
        "nav_home": "Trang chủ",
        "nav_profile": "Hồ sơ cá nhân",
        "nav_activity": "Hoạt động",
        "title_update": "Cập nhật thông tin",
        "lbl_mssv": "Mã số sinh viên",
        "lbl_name": "Họ và tên",
        "lbl_birthday": "Ngày sinh",
        "lbl_phone": "Số điện thoại",
        "lbl_khoa": "Khoa / Viện",
        "lbl_score": "Tổng điểm rèn luyện",
        "btn_save": "Lưu thay đổi",
        "btn_cancel": "Hủy bỏ",
        "msg_success": "✅ Cập nhật thành công!"
    },
    "en": {
        "nav_home": "Home",
        "nav_profile": "User Profile",
        "nav_activity": "Activities",
        "title_update": "Update Information",
        "lbl_mssv": "Student ID",
        "lbl_name": "Full Name",
        "lbl_birthday": "Date of Birth",
        "lbl_phone": "Phone Number",
        "lbl_khoa": "Faculty / Institute",
        "lbl_score": "Total Training Points",
        "btn_save": "Save Changes",
        "btn_cancel": "Cancel",
        "msg_success": "✅ Update successful!"
    }
};

// Hàm xử lý chuyển đổi
function translateTo(lang) {
    localStorage.setItem('current_lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // Nếu là thẻ input thì dịch placeholder
            if (el.tagName === 'INPUT') {
                el.placeholder = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });
}

// Tự động chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('current_lang') || 'vi';
    translateTo(savedLang);
});