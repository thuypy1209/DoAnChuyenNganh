document.addEventListener("DOMContentLoaded", function() {
    // Tải và chèn Navbar từ thư mục "components"
    fetch('components/_navbar.html') // <-- Đã sửa lại thành 'components'
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById('navbar-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;

                // Logic cho Dropdown Menu
                const dropdownButton = document.getElementById('dropdown-button');
                const dropdownMenu = document.getElementById('dropdown-menu');

                if (dropdownButton) {
                    dropdownButton.addEventListener('click', function(event) {
                        event.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                        dropdownMenu.classList.toggle('hidden');
                    });
                }
            }
        });

    // Tải và chèn Footer từ thư mục "components"
    fetch('components/_footer.html') // <-- Đã sửa lại thành 'components'
        .then(response => response.text())
        .then(data => {
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) {
                placeholder.innerHTML = data;
            }
        });
});

// Bấm ra ngoài để đóng dropdown
window.addEventListener('click', function() {
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (dropdownMenu && !dropdownMenu.classList.contains('hidden')) {
        dropdownMenu.classList.add('hidden');
    }
});