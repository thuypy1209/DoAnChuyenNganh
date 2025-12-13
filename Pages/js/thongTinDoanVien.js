document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('doanVienForm');
    const modalTitle = document.querySelector('h1'); // Giả sử tiêu đề trang là h1
    const doanVienIdInput = document.createElement('input'); // Tạo input ẩn để lưu id
    doanVienIdInput.type = 'hidden';
    doanVienIdInput.id = 'doanVienId';
    form.appendChild(doanVienIdInput);

    // Lấy id từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const doanVienId = urlParams.get('id');

    if (doanVienId) {
        // --- Chế độ SỬA ---
        modalTitle.textContent = 'Cập nhật Thông tin Đoàn viên';
        loadDoanVienForEdit(doanVienId);
    } else {
        // --- Chế độ THÊM MỚI ---
        modalTitle.textContent = 'Thêm mới Đoàn viên';
    }

    form.addEventListener('submit', saveDoanVien);
});

async function loadDoanVienForEdit(id) {
    
    try {
        const response = await fetch(`http://localhost:7006/api/DoanViens/${id}`);
        if (!response.ok) throw new Error('Không tìm thấy đoàn viên.');

        const dv = await response.json();

        // Điền dữ liệu vào form
        document.getElementById('doanVienId').value = dv.Id;
        document.getElementById('maDinhDanh').value = dv.MaDoanVien;
        document.getElementById('hoTen').value = dv.HoTen;
        document.getElementById('ngaySinh').value = new Date(dv.NgaySinh).toISOString().split('T')[0];
        // Điền các trường khác...

    } catch (error) {
        alert(error.message);
    }
}

async function saveDoanVien(event) {
    event.preventDefault();

    const doanVienId = document.getElementById('doanVienId').value;

    const doanVienData = {
        Id: doanVienId ? parseInt(doanVienId) : 0,
        MaDoanVien: document.getElementById('maDinhDanh').value,
        HoTen: document.getElementById('hoTen').value,
        NgaySinh: document.getElementById('ngaySinh').value
        // Lấy các trường khác...
    };

    const method = doanVienId ? 'PUT' : 'POST';
    let url = 'http://localhost:5114/api/DoanViens';
    if (doanVienId) {
        url += `/${doanVienId}`;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doanVienData)
        });

        if (!response.ok) {
            throw new Error(doanVienId ? 'Cập nhật thất bại.' : 'Thêm mới thất bại.');
        }

        alert(doanVienId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        window.location.href = 'QLDV_DanhSach.html';

    } catch (error) {
        alert(error.message);
    }
    
}
// ==========================================================================================
// DỮ LIỆU MẪU CHO CÁC Ô LỰA CHỌN
// ==========================================================================================

// Dữ liệu địa chính chi tiết hơn, có cả Phường/Xã
// ==========================================================================================
// DỮ LIỆU MẪU CHO CÁC Ô LỰA CHỌN (GIỮ NGUYÊN)
// ==========================================================================================
const dataDiaChinh = {
    "Thành phố Hồ Chí Minh": {
        "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Cầu Kho", "Phường Cầu Ông Lãnh", "Phường Cô Giang", "Phường Đa Kao", "Phường Nguyễn Cư Trinh", "Phường Nguyễn Thái Bình", "Phường Phạm Ngũ Lão", "Phường Tân Định"],
        "Quận 3": ["Phường 01", "Phường 02", "Phường 03", "Phường 04", "Phường 05", "Phường Võ Thị Sáu", "Phường 09", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
        "Thành phố Thủ Đức": ["Phường An Khánh", "Phường An Lợi Đông", "Phường An Phú", "Phường Bình Chiểu", "Phường Bình Thọ", "Phường Cát Lái", "Phường Hiệp Bình Chánh", "Phường Hiệp Bình Phước", "Phường Hiệp Phú", "Phường Linh Chiểu", "Phường Linh Đông", "Phường Linh Tây", "Phường Linh Trung", "Phường Linh Xuân", "Phường Long Bình", "Phường Long Phước", "Phường Long Thạnh Mỹ", "Phường Long Trường", "Phường Phú Hữu", "Phường Phước Bình", "Phường Phước Long A", "Phường Phước Long B", "Phường Tam Bình", "Phường Tam Phú", "Phường Tăng Nhơn Phú A", "Phường Tăng Nhơn Phú B", "Phường Tân Phú", "Phường Thảo Điền", "Phường Thạnh Mỹ Lợi", "Phường Thủ Thiêm", "Phường Trường Thạnh", "Phường Trường Thọ"],
    }
};
const dataTrinhDoTinHoc = ["Chứng chỉ A", "Chứng chỉ B", "MOS", "IC3", "Khác"];
const dataNgoaiNgu = ["Tiếng Anh", "Tiếng Pháp", "Tiếng Nhật", "Tiếng Trung", "Khác"];
const dataHeDaoTao = ["Đại học chính quy", "Cao đẳng", "Tại chức", "Liên thông"];
const dataNgheNghiep = ["Sinh viên", "Giảng viên", "Nhân viên văn phòng", "Khác"];
const dataChucVu = ["Bí thư", "Phó Bí thư", "Ủy viên Ban chấp hành", "Đoàn viên"];

// ==========================================================================================
// CÁC HÀM XỬ LÝ (GIỮ NGUYÊN)
// ==========================================================================================
function populateSelect(selectElement, options) {
    selectElement.innerHTML = '<option value="">-- Chọn --</option>';
    options.forEach(optionText => {
        const option = document.createElement('option');
        option.textContent = optionText;
        option.value = optionText;
        selectElement.appendChild(option);
    });
}

function updatePhuongXaOptions(quanHuyenSelect, phuongXaSelect) {
    const selectedQuanHuyen = quanHuyenSelect.value;
    const selectedTinhThanh = "Thành phố Hồ Chí Minh"; 
    
    if (selectedTinhThanh && selectedQuanHuyen && dataDiaChinh[selectedTinhThanh] && dataDiaChinh[selectedTinhThanh][selectedQuanHuyen]) {
        const danhSachPhuongXa = dataDiaChinh[selectedTinhThanh][selectedQuanHuyen];
        populateSelect(phuongXaSelect, danhSachPhuongXa);
    } else {
        phuongXaSelect.innerHTML = '<option value="">-- Chọn Quận/Huyện trước --</option>';
    }
}

// ==========================================================================================
// HÀM XỬ LÝ CHÍNH (ĐÃ ĐƯỢC GỘP LẠI VÀ DỌN DẸP)
// ==========================================================================================

document.addEventListener('DOMContentLoaded', function() {
    // --- PHẦN 1: CHUẨN BỊ FORM VÀ CÁC Ô LỰA CHỌN ---
    const form = document.getElementById('doanVienForm');
    if (!form) {
        console.error("Không tìm thấy form với id='doanVienForm'");
        return;
    }

    // Lấy các element cần thiết
    const modalTitle = document.querySelector('h1');
    const queQuanTinhSelect = document.getElementById('que-quan-tinh');
    const queQuanHuyenSelect = document.getElementById('que-quan-huyen');
    const queQuanXaSelect = document.getElementById('que-quan-xa');
    const thuongTruTinhSelect = document.getElementById('thuong-tru-tinh');
    const thuongTruHuyenSelect = document.getElementById('thuong-tru-huyen');
    const thuongTruXaSelect = document.getElementById('thuong-tru-xa');
    const trinhDoTinHocSelect = document.getElementById('trinh-do-tin-hoc');
    const ngoaiNguSelect = document.getElementById('ngoai-ngu');
    const heDaoTaoSelect = document.getElementById('he-dao-tao');
    const ngheNghiepSelect = document.getElementById('nghe-nghiep-hien-nay');
    const chucVuSelect = document.getElementById('chuc-vu-trong-chi-doan');

    // Điền dữ liệu cho các ô dropdown
    populateSelect(trinhDoTinHocSelect, dataTrinhDoTinHoc);
    populateSelect(ngoaiNguSelect, dataNgoaiNgu);
    populateSelect(heDaoTaoSelect, dataHeDaoTao);
    populateSelect(ngheNghiepSelect, dataNgheNghiep);
    populateSelect(chucVuSelect, dataChucVu);

    const danhSachTinhThanh = Object.keys(dataDiaChinh);
    populateSelect(queQuanTinhSelect, danhSachTinhThanh);
    populateSelect(thuongTruTinhSelect, danhSachTinhThanh);
    
    queQuanTinhSelect.value = "Thành phố Hồ Chí Minh";
    thuongTruTinhSelect.value = "Thành phố Hồ Chí Minh";
    const danhSachQuanHuyenHCM = Object.keys(dataDiaChinh["Thành phố Hồ Chí Minh"]);
    populateSelect(queQuanHuyenSelect, danhSachQuanHuyenHCM);
    populateSelect(thuongTruHuyenSelect, danhSachQuanHuyenHCM);

    updatePhuongXaOptions(queQuanHuyenSelect, queQuanXaSelect);
    updatePhuongXaOptions(thuongTruHuyenSelect, thuongTruXaSelect);
    
    queQuanHuyenSelect.addEventListener('change', () => updatePhuongXaOptions(queQuanHuyenSelect, queQuanXaSelect));
    thuongTruHuyenSelect.addEventListener('change', () => updatePhuongXaOptions(thuongTruHuyenSelect, thuongTruXaSelect));

    // --- PHẦN 2: XỬ LÝ CHẾ ĐỘ THÊM MỚI HOẶC SỬA ---
    const urlParams = new URLSearchParams(window.location.search);
    const doanVienId = urlParams.get('id');

    // Tạo input ẩn để lưu id (nếu có)
    let doanVienIdInput = document.getElementById('doanVienId');
    if (!doanVienIdInput) {
        doanVienIdInput = document.createElement('input');
        doanVienIdInput.type = 'hidden';
        doanVienIdInput.id = 'doanVienId';
        form.appendChild(doanVienIdInput);
    }

    if (doanVienId) {
        // Chế độ SỬA
        modalTitle.textContent = 'Cập nhật Thông tin Đoàn viên';
        loadDoanVienForEdit(doanVienId);
    } else {
        // Chế độ THÊM MỚI
        modalTitle.textContent = 'Thêm mới Đoàn viên';
    }

    // Gắn sự kiện submit cho form
    form.addEventListener('submit', saveDoanVien);
    // --- THÊM ĐOẠN CODE NÀY VÀO ---
    const avatarInput = document.getElementById('avatar-input');
    const avatarPreview = document.getElementById('avatar-preview');

    avatarInput.addEventListener('change', function() {
        // Lấy file người dùng đã chọn
        const file = this.files[0];

        if (file) {
            // Tạo một URL tạm thời cho file ảnh và hiển thị nó
            avatarPreview.src = URL.createObjectURL(file);
        }
    });
});

async function loadDoanVienForEdit(id) {
    try {
        const response = await fetch(`https://localhost:7006/api/DoanViens/${id}`); // ⚠️ Nhớ thay đúng số cổng
        if (!response.ok) throw new Error('Không tìm thấy đoàn viên.');
        const dv = await response.json();

        // Điền dữ liệu vào form
        document.getElementById('doanVienId').value = dv.Id;
        document.getElementById('ma-dinh-danh').value = dv.MaDinhDanh;
        document.getElementById('ho-ten').value = dv.HoTen;
        // ... điền đầy đủ các trường khác tương tự ...
        
    } catch (error) {
        alert(error.message);
    }
}

async function saveDoanVien(event) {
    event.preventDefault(); // Ngăn form tự tải lại trang

    const doanVienId = document.getElementById('doanVienId').value;

    // Thu thập đầy đủ dữ liệu từ form
    const doanVienData = {
        id: doanVienId ? parseInt(doanVienId) : 0,
        maDinhDanh: document.getElementById('ma-dinh-danh').value,
        hoTen: document.getElementById('ho-ten').value,
        ngaySinh: document.getElementById('ngay-sinh').value,
        gioiTinh: document.getElementById('gioi-tinh').value,
        danToc: document.getElementById('dan-toc').value,
        cmnd: document.getElementById('chung-minh-nhan-dan').value,
        ngayCap: document.getElementById('ngay-cap').value,
        noiCap: document.getElementById('noi-cap').value,
        tonGiao: document.getElementById('ton-giao').value,
        trinhDoVanHoa: document.getElementById('trinh-do-van-hoa').value,
        trinhDoChuyenMon: document.getElementById('trinh-do-chuyen-mon').value,
        lyLuanChinhTri: document.getElementById('ly-luan-chinh-tri').value,
        queQuan: `${document.getElementById('que-quan-xa').value}, ${document.getElementById('que-quan-huyen').value}, ${document.getElementById('que-quan-tinh').value}`,
        thuongTru: `${document.getElementById('thuong-tru-xa').value}, ${document.getElementById('thuong-tru-huyen').value}, ${document.getElementById('thuong-tru-tinh').value}`,
        trinhDoTinHoc: document.getElementById('trinh-do-tin-hoc').value,
        ngoaiNgu: document.getElementById('ngoai-ngu').value,
        nghiQuyetKetNap: document.getElementById('nghi-quyet').value,
        soTheDoan: document.getElementById('so-the-doan').value,
        ngayVaoDoan: document.getElementById('thoi-gian-vao-doan').value,
        chucVu: document.getElementById('chuc-vu-trong-chi-doan').value,
        ngayVaoDang: document.getElementById('thoi-gian-vao-dang').value,
        ngheNghiep: document.getElementById('nghe-nghiep-hien-nay').value,
        email: document.getElementById('email').value,
        sodienThoai: document.getElementById('dien-thoai').value,
        heDaoTao: document.getElementById('he-dao-tao').value
    };

    const method = doanVienId ? 'PUT' : 'POST';
    let url = `https://localhost:7006/api/DoanViens`; // ⚠️ Nhớ thay đúng số cổng
    if (doanVienId) {
        url += `/${doanVienId}`;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doanVienData)
        });

        if (!response.ok) {
            throw new Error(doanVienId ? 'Cập nhật thất bại.' : 'Thêm mới thất bại.');
        }

        alert(doanVienId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        window.location.href = 'QLDV_DanhSach.html';

    } catch (error) {
        alert(error.message);
    }
}