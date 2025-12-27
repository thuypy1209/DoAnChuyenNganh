function changeLanguage(lang) {
    // 1. Lưu lựa chọn vào localStorage để F5 không bị mất
    localStorage.setItem('preferred_lang', lang);

    // 2. Tìm tất cả phần tử có thuộc tính data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // Thay đổi nội dung chữ
            if (el.tagName === 'INPUT') {
                el.placeholder = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });
}

// Khi vừa load trang, kiểm tra xem trước đó dùng tiếng gì
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferred_lang') || 'vi';
    changeLanguage(savedLang);
});