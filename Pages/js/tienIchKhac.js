// File: js/tienIchKhac.js

document.addEventListener('DOMContentLoaded', function() {
    
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            
            tabButtons.forEach(btn => {
                btn.classList.remove('border-blue-500', 'text-blue-600');
                btn.classList.add('border-transparent', 'text-gray-500');
            });

            this.classList.add('border-blue-500', 'text-blue-600');
            this.classList.remove('border-transparent', 'text-gray-500');

            tabContents.forEach(content => {
                content.classList.add('hidden');
            });

            const contentId = this.getAttribute('data-content-id');
            const activeContent = document.getElementById(contentId);
            if (activeContent) {
                activeContent.classList.remove('hidden');
            }
        });
    });
});