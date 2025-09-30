// layout.js - ĐÃ SỬA ĐƯỜNG DẪN TẢI CÁC PHẦN LAYOUT VÀ LOGIC ĐIỀU HƯỚNG
// Tải các phần layout (header, sidebar, footer) và nội dung chính của trang
fetch('header.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header').innerHTML = data;
  });
fetch('sidebar.html')
  .then(res => res.text())
  .then(html => document.getElementById('sidebar').innerHTML = html);
fetch('footer.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('footer').innerHTML = data;
  });

// Hàm tải nội dung chính của trang vào #main-content-area
async function loadMainContent(pageName) {
    const contentArea = document.getElementById('main-content-area');
    if (!contentArea) {
        console.error('Không tìm thấy element với ID "main-content-area" trong Home.html. Vui lòng thêm <div id="main-content-area"></div> vào Home.html.');
        return;
    }
    
    // Xóa nội dung cũ và các script động cũ
    contentArea.innerHTML = ''; 
    const oldDynamicScripts = document.querySelectorAll('script[data-dynamic-script="true"]');
    oldDynamicScripts.forEach(script => script.remove());

    try {
        // Đã cấu hình Live Server root là /Pages, nên giờ dùng đường dẫn tuyệt đối từ gốc đó.
        const response = await fetch('/' + pageName + '.html'); // ĐÃ SỬA: từ '../' thành '/'
        if (!response.ok) {
            throw new Error(`Không thể tải ${'/' + pageName + '.html'}: ${response.statusText} (${response.status})`);
        }
        const htmlContent = await response.text();
        contentArea.innerHTML = htmlContent;

        // Xử lý các thẻ script được nhúng trong HTML động
        const scriptElements = contentArea.querySelectorAll('script');
        scriptElements.forEach(oldScript => {
            const newScript = document.createElement('script');
            if (oldScript.src) {
                // Các script này cũng cần đường dẫn tuyệt đối từ gốc của Live Server (là /Pages/)
                // Dựa vào cách em đã sửa trong HTML, chúng ta giữ nguyên oldScript.src
                newScript.src = oldScript.src; 
                newScript.async = false; 
            }
            if (oldScript.textContent) {
                newScript.textContent = oldScript.textContent;
            }
            newScript.setAttribute('data-dynamic-script', 'true'); 
            document.body.appendChild(newScript); 
            oldScript.remove(); 
        });

    } catch (error) {
        console.error('Lỗi khi tải nội dung chính:', error);
        contentArea.innerHTML = `<p style="color: red;">Không thể tải trang: ${pageName}. Lỗi: ${error.message}</p>`;
    }
}

// Gán hàm loadMainContent vào window để các link trong sidebar có thể gọi được
window.loadMainContent = loadMainContent;

// Các hàm addNewXxx() - Giữ nguyên logic gọi loadMainContent và sau đó mở modal
window.addNewDoanVien = function() { loadMainContent('QLDV'); setTimeout(function(){ if(typeof window.addNewDoanVienOriginal === 'function') window.addNewDoanVienOriginal(); else if(typeof addNewDoanVien === 'function') addNewDoanVien(); }, 100); };
window.addNewTinTuc = function() { loadMainContent('TinTuc'); setTimeout(function(){ if(typeof window.addNewTinTucOriginal === 'function') window.addNewTinTucOriginal(); else if(typeof addNewTinTuc === 'function') addNewTinTuc(); }, 100); };
window.addNewLichThi = function() { loadMainContent('LichThi'); setTimeout(function(){ if(typeof window.addNewLichThiOriginal === 'function') window.addNewLichThiOriginal(); else if(typeof addNewLichThi === 'function') addNewLichThi(); }, 100); };
window.addNewDanhMuc = function() { loadMainContent('DanhMuc'); setTimeout(function(){ if(typeof window.addNewDanhMucOriginal === 'function') window.addNewDanhMucOriginal(); else if(typeof addNewDanhMuc === 'function') addNewDanhMuc(); }, 100); };

// Thêm hàm load cho Hồ sơ/Tài liệu
window.loadHoSoBaoCaoPage = function() { loadMainContent('hosobaocao'); }; // Tên trang là 'hosobaocao'

// Đảm bảo DOM đã tải xong trước khi chạy loadLayoutAndDefaultPage
document.addEventListener('DOMContentLoaded', loadLayoutAndDefaultPage);