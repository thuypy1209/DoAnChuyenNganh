// File: js/dangKyHoatDong.js - ĐÃ SỬA LỖI GÁN CỨNG

document.addEventListener('DOMContentLoaded', function() {
    // 1. CẤU HÌNH & LẤY THÔNG TIN NGƯỜI DÙNG THẬT
    // Nếu có biến CONFIG toàn cục thì dùng, không thì dùng link cứng
    const API_URL = (typeof CONFIG !== 'undefined') 
        ? CONFIG.API_BASE_URL + '/HoatDongs' 
        : 'http://localhost:5114/api/HoatDongs';

    // --- QUAN TRỌNG: LẤY THÔNG TIN TỪ TÚI (LocalStorage) ---
    const currentUserMssv = localStorage.getItem('userMssv');
    const currentUserName = localStorage.getItem('userName');

    // Kiểm tra nếu chưa đăng nhập thì nhắc nhở (tùy chọn)
    if (!currentUserMssv) {
        console.warn("Chưa đăng nhập! Chức năng đăng ký có thể không hoạt động.");
    }

    let currentTab = 'DangMo'; // Tab mặc định

    // --- DOM ELEMENTS ---
    const container = document.getElementById('activitiesContainer');
    const tabs = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('searchInput');
    const btnFilter = document.getElementById('btnFilter');
    
    // Modal Elements
    const modal = document.getElementById('registerModal');
    const modalContent = document.getElementById('modalContent');
    const closeModalBtn = document.getElementById('closeModal');
    const btnCancel = document.getElementById('btnCancel');
    const btnConfirm = document.getElementById('btnConfirm');

    // (ĐÃ XÓA: Không cần hàm loadStudentInfo và biến CURRENT_STUDENT_ID nữa)

    // --- 1. HÀM TẢI DỮ LIỆU TỪ API ---
    async function loadActivities() {
        container.innerHTML = '<div class="col-span-full text-center py-10"><i class="fas fa-spinner fa-spin text-3xl text-blue-900"></i><p class="mt-2">Đang tải hoạt động...</p></div>';
        
        try {
            const keyword = searchInput.value.trim();
            const url = `${API_URL}?tab=${currentTab}&keyword=${encodeURIComponent(keyword)}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error("Lỗi tải dữ liệu");
            
            const data = await response.json();
            renderActivities(data);

        } catch (error) {
            console.error(error);
            container.innerHTML = '<div class="col-span-full text-center text-red-500 py-10">Không thể kết nối đến máy chủ.</div>';
        }
    }

    // --- 2. HÀM VẼ GIAO DIỆN ---
    function renderActivities(activities) {
        container.innerHTML = '';

        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <i class="fas fa-calendar-times text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">Không tìm thấy hoạt động nào.</p>
                </div>`;
            return;
        }

        activities.forEach(act => {
            const id = act.Id || act.id;
            const ten = act.TenHoatDong || act.tenHoatDong;
            const poster = act.PosterUrl || act.posterUrl || 'images/banner1.jpg';
            const diem = act.DiemRenLuyen || act.diemRenLuyen;
            const loai = act.LoaiHoatDong || act.loaiHoatDong || 'Hoạt động';
            const diaDiem = act.DiaDiem || act.diaDiem || 'Đang cập nhật';
            const ngayBatDau = act.NgayBatDau || act.ngayBatDau;
            
            const slToiDa = act.SoLuongToiDa || act.soLuongToiDa || 0;
            const slDaDK = act.SoLuongDaDangKy || act.soLuongDaDangKy || 0;
            const trangThaiBackend = act.TrangThaiHienTai || act.trangThaiHienTai;

            const percent = slToiDa > 0 ? (slDaDK / slToiDa) * 100 : 0;
            const isFull = slDaDK >= slToiDa;
            const isEnded = (trangThaiBackend === 'KetThuc');

            let btnText = 'ĐĂNG KÝ NGAY';
            let btnClass = 'bg-blue-900 text-white hover:bg-blue-800';
            let isDisabled = '';

            if (isEnded) {
                btnText = 'ĐÃ KẾT THÚC';
                btnClass = 'bg-gray-500 text-white cursor-not-allowed';
                isDisabled = 'disabled';
            } else if (isFull) {
                btnText = 'ĐÃ ĐỦ SỐ LƯỢNG';
                btnClass = 'bg-gray-300 text-gray-500 cursor-not-allowed';
                isDisabled = 'disabled';
            }

            // Gọi hàm mở modal với đúng ID và Tên
            const cardHtml = `
                <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full">
                    <div class="relative h-48 overflow-hidden group">
                        <img src="${poster}" alt="${ten}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                        <div class="absolute top-2 right-2 bg-yellow-400 text-blue-900 text-xs font-bold px-2 py-1 rounded shadow">+${diem} ĐIỂM</div>
                        <div class="absolute bottom-0 left-0 bg-gradient-to-t from-black to-transparent w-full p-3">
                            <span class="text-white text-xs font-bold bg-blue-600 px-2 py-0.5 rounded">${loai}</span>
                        </div>
                    </div>

                    <div class="p-5 flex-grow">
                        <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2" title="${ten}">${ten}</h3>
                        <div class="space-y-2 text-sm text-gray-600 mb-4">
                            <div class="flex items-center"><i class="far fa-calendar-alt w-5 text-blue-500"></i> <span>${new Date(ngayBatDau).toLocaleDateString('vi-VN')}</span></div>
                            <div class="flex items-center"><i class="fas fa-map-marker-alt w-5 text-red-500"></i> <span class="line-clamp-1">${diaDiem}</span></div>
                            <div class="flex items-center"><i class="fas fa-user-friends w-5 text-green-500"></i> 
                                <span class="${isFull ? 'text-red-500 font-bold' : ''}">
                                    ${isFull ? 'Đã hết chỗ' : `Còn ${slToiDa - slDaDK} chỗ`}
                                </span>
                            </div>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                            <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${percent}%"></div>
                        </div>
                    </div>

                    <div class="p-4 border-t bg-gray-50">
                        <button onclick="openRegisterModal(${id}, '${ten}')" 
                                class="w-full py-2 rounded-lg font-bold transition-colors ${btnClass}"
                                ${isDisabled}>
                            ${btnText}
                        </button>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    // --- 3. XỬ LÝ CHUYỂN TAB ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('text-blue-900', 'border-b-2', 'border-blue-900');
                t.classList.add('text-gray-500');
            });
            tab.classList.remove('text-gray-500');
            tab.classList.add('text-blue-900', 'border-b-2', 'border-blue-900');

            currentTab = tab.dataset.tab;
            loadActivities();
        });
    });

    btnFilter.addEventListener('click', loadActivities);

    // --- 4. XỬ LÝ MODAL ĐĂNG KÝ (ĐÃ SỬA: TỰ ĐIỀN THÔNG TIN) ---
    window.openRegisterModal = (id, name) => {
        // 1. Điền thông tin hoạt động
        document.getElementById('modalActivityId').value = id;
        document.getElementById('modalActivityName').innerText = name;
        
        // 2. TỰ ĐỘNG ĐIỀN THÔNG TIN SINH VIÊN (Từ LocalStorage)
        const inputMssv = document.getElementById('modalMssv');
        const inputName = document.getElementById('modalStudentName'); // ⚠️ Kiểm tra lại ID này bên HTML nhé (có thể là modalTenSv)
        
        if (inputMssv) {
            inputMssv.value = currentUserMssv || ""; 
            // inputMssv.disabled = true; // Bỏ comment dòng này nếu muốn khóa không cho sửa
        }
        
        if (inputName) {
            inputName.value = currentUserName || "";
            // inputName.disabled = true;
        }

        // Hiệu ứng hiện modal
        modal.classList.remove('hidden');
        setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    };

    const hideModal = () => {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 200);
    };

    closeModalBtn.addEventListener('click', hideModal);
    btnCancel.addEventListener('click', hideModal);

    // --- 5. GỬI ĐĂNG KÝ ---
    btnConfirm.addEventListener('click', async () => {
        const actId = document.getElementById('modalActivityId').value;
        const mssv = document.getElementById('modalMssv').value; // Lấy giá trị vừa điền
        const fileInput = document.getElementById('fileMinhChung'); 

        btnConfirm.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        btnConfirm.disabled = true;

        try {
            const formData = new FormData();
            formData.append('hoatDongId', actId);
            formData.append('mssv', mssv);
            
            if (fileInput && fileInput.files[0]) {
                formData.append('minhChung', fileInput.files[0]);
            }

            const response = await fetch(`${API_URL}/DangKy`, {
                method: 'POST',
                body: formData 
            });

            const result = await response.json();

            if (response.ok) {
                alert("🎉 " + result.message);
                hideModal();
                loadActivities(); 
            } else {
                console.log(result);
                alert("⚠️ Lỗi: " + (result.title || result.message || "Vui lòng kiểm tra lại thông tin"));
            }

        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối server.");
        } finally {
            btnConfirm.innerHTML = 'GỬI ĐĂNG KÝ';
            btnConfirm.disabled = false;
        }
    });

    // Hàm xem trước ảnh
    window.previewMinhChung = function(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.getElementById('imgMinhChungPreview');
                const icon = document.getElementById('iconUploadPlaceholder');
                
                if(img) {
                    img.src = e.target.result;
                    img.classList.remove('hidden');
                }
                if(icon) icon.classList.add('hidden');
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    // CHẠY LẦN ĐẦU
    loadActivities();
});