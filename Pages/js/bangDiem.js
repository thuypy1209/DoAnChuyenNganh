// bangDiem.js - ĐÃ HOÀN THIỆN HIỂN THỊ DỮ LIỆU BẢNG ĐIỂM VÀ THÔNG TIN SINH VIÊN BỞI AI

// KHÔNG KHAI BÁO LẠI API_BANG_DIEM_BASE_URL Ở ĐÂY NỮA
// Thay vào đó, chúng ta sẽ dùng window.API_BANG_DIEM_BASE_URL đã được định nghĩa trong globalConfig.js

// Hàm tải thông tin sinh viên
async function loadStudentInfo(maSoSinhVien) {
    try {
        // GỌI API THEO MÃ SỐ SINH VIÊN CỤ THỂ
        const response = await fetch(`${window.API_DOAN_VIEN_URL}/ByMaSo/${maSoSinhVien}`); 
        if (!response.ok) {
            // Nếu không tìm thấy sinh viên, xóa thông tin hiện tại
            document.getElementById('infoMaSoSinhVien').textContent = 'N/A';
            document.getElementById('infoTenSinhVien').textContent = 'N/A';
            document.getElementById('infoEmail').textContent = 'N/A';
            document.getElementById('infoKhoa').textContent = 'N/A';
            document.getElementById('infoNganh').textContent = 'N/A';
            document.getElementById('infoKhoaHoc').textContent = 'N/A';
            // Không ném lỗi nữa mà chỉ log warn
            console.warn(`Không tìm thấy thông tin sinh viên với mã số: ${maSoSinhVien}. Có thể sinh viên chưa được thêm vào bảng Đoàn viên.`);
            return; // Dừng hàm nếu không tìm thấy
        }
        const student = await response.json(); // API trả về 1 đối tượng sinh viên

        if (student) {
            document.getElementById('infoMaSoSinhVien').textContent = student.MaDoanVien || 'N/A';
            document.getElementById('infoTenSinhVien').textContent = student.HoTen || 'N/A';
            document.getElementById('infoEmail').textContent = student.Email || 'N/A';
            document.getElementById('infoKhoa').textContent = student.Khoa || 'N/A';
            document.getElementById('infoNganh').textContent = student.Nganh || 'N/A';
            document.getElementById('infoKhoaHoc').textContent = student.KhoaHoc || 'N/A';
        } else { // Trường hợp API trả về null hoặc không tìm thấy nhưng không ném lỗi HTTP
            document.getElementById('infoMaSoSinhVien').textContent = 'N/A';
            document.getElementById('infoTenSinhVien').textContent = 'N/A';
            document.getElementById('infoEmail').textContent = 'N/A';
            document.getElementById('infoKhoa').textContent = 'N/A';
            document.getElementById('infoNganh').textContent = 'N/A';
            document.getElementById('infoKhoaHoc').textContent = 'N/A';
        }

    } catch (error) {
        console.error("Lỗi khi tải thông tin sinh viên:", error);
        // Hiển thị N/A nếu có lỗi
        document.getElementById('infoMaSoSinhVien').textContent = 'Lỗi!';
        document.getElementById('infoTenSinhVien').textContent = 'Lỗi!';
        document.getElementById('infoEmail').textContent = 'Lỗi!';
        document.getElementById('infoKhoa').textContent = 'Lỗi!';
        document.getElementById('infoNganh').textContent = 'Lỗi!';
        document.getElementById('infoKhoaHoc').textContent = 'Lỗi!';
    }
}

// Hàm tải bảng điểm (có tham số mã số sinh viên)
async function loadBangDiems(maSoSinhVienToSearch = '') { // Thêm tham số mặc định
    try {
        // GỌI API BANGDIEMS VỚI THAM SỐ LỌC MA_SO_SINH_VIEN
        const response = await fetch(`${window.API_BANG_DIEM_BASE_URL}?maSoSinhVien=${maSoSinhVienToSearch}`); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let bangDiems = await response.json(); 

        const gradeTablesContainer = document.getElementById('gradeTablesContainer');
        if (!gradeTablesContainer) {
            console.warn("Không tìm thấy element có ID 'gradeTablesContainer'.");
            return;
        }
        gradeTablesContainer.innerHTML = ''; // Xóa nội dung cũ
        
        // Đặt lại thông tin sinh viên về N/A trước khi tải
        // (Sẽ được điền lại bởi loadStudentInfo nếu tìm thấy)
        document.getElementById('infoMaSoSinhVien').textContent = 'N/A';
        document.getElementById('infoTenSinhVien').textContent = 'N/A';
        document.getElementById('infoEmail').textContent = 'N/A';
        document.getElementById('infoKhoa').textContent = 'N/A';
        document.getElementById('infoNganh').textContent = 'N/A';
        document.getElementById('infoKhoaHoc').textContent = 'N/A';

        // Đặt lại điểm trung bình về N/A
        document.getElementById('currentSemesterAvg').textContent = 'N/A'; 
        document.getElementById('cumulativeAvg').textContent = 'N/A'; 
        document.getElementById('totalCreditsAchieved').textContent = 'N/A'; 


        if (bangDiems.length === 0) {
            gradeTablesContainer.innerHTML = `<div class="card p-6 text-center text-gray-500">Chưa có bảng điểm nào cho mã số sinh viên này.</div>`;
            // Nếu không có điểm, cũng phải gọi loadStudentInfo để điền thông tin sinh viên
            if (maSoSinhVienToSearch) {
                loadStudentInfo(maSoSinhVienToSearch);
            }
            return; 
        }

        // Tải thông tin sinh viên của bản ghi điểm đầu tiên (nếu có)
        const firstStudentMaSo = bangDiems[0].MaSoSinhVien;
        if (firstStudentMaSo) {
            loadStudentInfo(firstStudentMaSo); // Tải thông tin sinh viên dựa trên MSVV từ bản ghi điểm đầu tiên
        }

        // Nhóm bảng điểm theo học kỳ
        const bangDiemsByHocKy = bangDiems.reduce((acc, bd) => {
            const hocKy = bd.HocKy || 'Học kỳ không xác định'; // Xử lý nếu Học kỳ là null
            if (!acc[hocKy]) {
                acc[hocKy] = [];
            }
            acc[hocKy].push(bd);
            return acc;
        }, {});

        // Sắp xếp các học kỳ (ví dụ: theo thứ tự ABC hoặc theo logic năm học)
        const sortedHocKys = Object.keys(bangDiemsByHocKy).sort();

        let totalCumulativeCredits = 0;
        let totalCumulativeWeightedPoints = 0;
        
        for (const hocKy of sortedHocKys) { 
            const semesterGrades = bangDiemsByHocKy[hocKy];
            semesterGrades.sort((a, b) => (a.TenMonHoc || '').localeCompare(b.TenMonHoc || '')); // Sắp xếp môn học theo tên

            const semesterTableHtml = `
                <div class="card overflow-x-auto mb-4"> <h3 class="text-xl font-bold text-gray-800 mb-4 hutech-font-title">
                        <i class="fas fa-book-reader text-blue-500 mr-3"></i> ${hocKy}
                    </h3>
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="table-header-bg text-white">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tl-lg">STT</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Mã HP</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tên học phần</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">TC</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">% KT</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">% Thi</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Điểm KT1</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Điểm KT2</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Điểm TL1</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Điểm TL2</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Điểm TBHP</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Điểm Chữ</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Điểm 4</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider rounded-tr-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${semesterGrades.map((bd, index) => {
                                const diemFormatted = bd.Diem !== null && bd.Diem !== undefined ? bd.Diem.toFixed(2) : 'N/A';
                                const maHP = bd.MaMonHoc || 'N/A'; 
                                const tc = bd.TinChi !== null && bd.TinChi !== undefined ? bd.TinChi : 'N/A'; 
                                const phanTramKT = bd.PhanTramKiemTra !== null && bd.PhanTramKiemTra !== undefined ? bd.PhanTramKiemTra : 'N/A'; 
                                const phanTramThi = bd.PhanTramThi !== null && bd.PhanTramThi !== undefined ? bd.PhanTramThi : 'N/A'; 
                                const diemKT1 = bd.DiemKT1 !== null && bd.DiemKT1 !== undefined ? bd.DiemKT1.toFixed(2) : 'N/A'; 
                                const diemKT2 = bd.DiemKT2 !== null && bd.DiemKT2 !== undefined ? bd.DiemKT2.toFixed(2) : 'N/A'; 
                                const diemTL1 = bd.DiemTL1 !== null && bd.DiemTL1 !== undefined ? bd.DiemTL1.toFixed(2) : 'N/A'; 
                                const diemTL2 = bd.DiemTL2 !== null && bd.DiemTL2 !== undefined ? bd.DiemTL2.toFixed(2) : 'N/A'; 
                                const diemTBHP = bd.DiemTrungBinhHocPhan !== null && bd.DiemTrungBinhHocPhan !== undefined ? bd.DiemTrungBinhHocPhan.toFixed(2) : 'N/A'; 
                                const diemChu = bd.DiemChu || 'N/A'; 
                                const diem4 = bd.DiemHe4 !== null && bd.DiemHe4 !== undefined ? bd.DiemHe4.toFixed(2) : 'N/A'; 

                                // Tính toán cho tổng kết điểm trung bình
                                if (bd.DiemHe4 !== null && bd.DiemHe4 !== undefined && bd.TinChi !== null && bd.TinChi !== undefined) {
                                    totalCumulativeWeightedPoints += bd.DiemHe4 * bd.TinChi;
                                    totalCumulativeCredits += bd.TinChi;
                                }

                                return `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${maHP}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${bd.TenMonHoc || ''}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${tc}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${phanTramKT}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${phanTramThi}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${diemKT1}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${diemKT2}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${diemTL1}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${diemTL2}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${diemTBHP}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${diemChu}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${diem4}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a href="#" class="text-blue-600 hover:text-blue-900 mr-3" onclick="editBangDiem(${bd.Id})"><i class="fas fa-edit"></i></a>
                                            <a href="#" class="text-red-600 hover:text-red-900" onclick="deleteBangDiem(${bd.Id})"><i class="fas fa-trash-alt"></i></a>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            gradeTablesContainer.innerHTML += semesterTableHtml; 
        }

        // Cập nhật tổng kết điểm trung bình
        if (totalCumulativeCredits > 0) {
            document.getElementById('cumulativeAvg').textContent = (totalCumulativeWeightedPoints / totalCumulativeCredits).toFixed(2);
            document.getElementById('totalCreditsAchieved').textContent = totalCumulativeCredits;
        } else {
            document.getElementById('cumulativeAvg').textContent = 'N/A';
            document.getElementById('totalCreditsAchieved').textContent = 'N/A';
        }
        // Điểm trung bình học kỳ này cần logic riêng để xác định "học kỳ này"
        document.getElementById('currentSemesterAvg').textContent = 'N/A'; 

    } catch (error) {
        console.error("Lỗi khi tải danh sách bảng điểm:", error);
        const gradeTablesContainer = document.getElementById('gradeTablesContainer');
        if (gradeTablesContainer) {
            gradeTablesContainer.innerHTML = `<div class="card p-6 text-center text-red-500">Không thể tải dữ liệu bảng điểm. Vui lòng kiểm tra API Backend và CORS.</div>`;
        }
        // Đặt thông tin sinh viên về trống nếu lỗi
        document.getElementById('infoMaSoSinhVien').textContent = 'N/A';
        document.getElementById('infoTenSinhVien').textContent = 'N/A';
        document.getElementById('infoEmail').textContent = 'N/A';
        document.getElementById('infoKhoa').textContent = 'N/A';
        document.getElementById('infoNganh').textContent = 'N/A';
        document.getElementById('infoKhoaHoc').textContent = 'N/A';
    }
}

// Hàm được gọi khi nhấn nút "Tìm kiếm"
function searchBangDiemByMaSoSinhVien() {
    const maSoSinhVien = document.getElementById('searchMaSoSinhVien').value;
    if (maSoSinhVien) {
        loadBangDiems(maSoSinhVien); // Tải bảng điểm chỉ cho MSVV này
    } else {
        alert("Vui lòng nhập Mã số sinh viên để tìm kiếm.");
        // Đặt thông tin sinh viên về N/A và xóa bảng điểm nếu input rỗng
        document.getElementById('infoMaSoSinhVien').textContent = 'N/A';
        document.getElementById('infoTenSinhVien').textContent = 'N/A';
        document.getElementById('infoEmail').textContent = 'N/A';
        document.getElementById('infoKhoa').textContent = 'N/A';
        document.getElementById('infoNganh').textContent = 'N/A';
        document.getElementById('infoKhoaHoc').textContent = 'N/A';
        document.getElementById('gradeTablesContainer').innerHTML = `<div class="card p-6 text-center text-gray-500">Vui lòng nhập Mã số sinh viên để xem bảng điểm.</div>`;
    }
}


function addNewBangDiem() {
    document.getElementById('bangDiemModalTitle').textContent = 'Thêm Điểm mới';
    document.getElementById('bangDiemForm').reset(); 
    document.getElementById('bangDiemId').value = ''; 
    document.getElementById('bangDiemModal').classList.remove('hidden'); 
    document.getElementById('bangDiemModal').classList.add('flex');
}

function closeBangDiemModal() {
    document.getElementById('bangDiemModal').classList.add('hidden'); 
    document.getElementById('bangDiemModal').classList.remove('flex');
    document.getElementById('bangDiemForm').reset(); 
}

async function saveBangDiem(event) {
    event.preventDefault(); 
    const bangDiemId = document.getElementById('bangDiemId').value;
    const tenSinhVien = document.getElementById('tenSinhVien').value;
    const maSoSinhVien = document.getElementById('maSoSinhVien').value;
    const tenMonHoc = document.getElementById('tenMonHoc').value;
    const diem = parseFloat(document.getElementById('diem').value); 
    const hocKy = document.getElementById('hocKy').value;

    // Lấy giá trị các trường điểm chi tiết
    const maMonHoc = document.getElementById('maMonHoc').value;
    // Sử dụng || 0 để đảm bảo giá trị là số nếu rỗng
    const tinChi = parseInt(document.getElementById('tinChi').value) || 0;
    const phanTramKiemTra = parseInt(document.getElementById('phanTramKiemTra').value) || 0;
    const phanTramThi = parseInt(document.getElementById('phanTramThi').value) || 0;
    const diemKT1 = parseFloat(document.getElementById('diemKT1').value) || 0;
    const diemKT2 = parseFloat(document.getElementById('diemKT2').value) || 0;
    const diemTL1 = parseFloat(document.getElementById('diemTL1').value) || 0;
    const diemTL2 = parseFloat(document.getElementById('diemTL2').value) || 0;
    const diemTBHP = parseFloat(document.getElementById('diemTBHP').value) || 0;
    const diemChu = document.getElementById('diemChu').value;
    const diem4 = parseFloat(document.getElementById('diem4').value) || 0;

    const bangDiemData = {
        TenSinhVien: tenSinhVien, 
        MaSoSinhVien: maSoSinhVien,
        TenMonHoc: tenMonHoc,
        Diem: diem,
        HocKy: hocKy,
        // THÊM CÁC TRƯỜNG MỚI VÀO DATA GỬI ĐI
        MaMonHoc: maMonHoc,
        TinChi: tinChi,
        PhanTramKiemTra: phanTramKiemTra,
        PhanTramThi: phanTramThi,
        DiemKT1: diemKT1,
        DiemKT2: diemKT2,
        DiemTL1: diemTL1,
        DiemTL2: diemTL2,
        DiemTrungBinhHocPhan: diemTBHP,
        DiemChu: diemChu,
        DiemHe4: diem4
    };

    let url = window.API_BANG_DIEM_BASE_URL;
    let method = 'POST'; 

    if (bangDiemId) { 
        url = `${window.API_BANG_DIEM_BASE_URL}/${bangDiemId}`;
        method = 'PUT';
        bangDiemData.Id = parseInt(bangDiemId); 
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bangDiemData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
        }

        alert(`Điểm đã được ${bangDiemId ? 'cập nhật' : 'thêm mới'} thành công!`);
        closeBangDiemModal(); 
        // Sau khi lưu, tải lại bảng điểm cho MSVV đang được tìm kiếm
        const currentSearchMaSo = document.getElementById('searchMaSoSinhVien').value;
        loadBangDiems(currentSearchMaSo); 
    } catch (error) {
        console.error("Lỗi khi lưu bảng điểm:", error);
        alert(`Không thể ${bangDiemId ? 'cập nhật' : 'thêm mới'} điểm. Lỗi: ` + error.message);
    }
}

async function editBangDiem(id) {
    try {
        const response = await fetch(`${window.API_BANG_DIEM_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bangDiem = await response.json();

        document.getElementById('bangDiemModalTitle').textContent = 'Sửa Bảng điểm';
        document.getElementById('bangDiemId').value = bangDiem.Id; 
        document.getElementById('tenSinhVien').value = bangDiem.TenSinhVien; 
        document.getElementById('maSoSinhVien').value = bangDiem.MaSoSinhVien; 
        document.getElementById('tenMonHoc').value = bangDiem.TenMonHoc; 
        document.getElementById('diem').value = bangDiem.Diem; 
        document.getElementById('hocKy').value = bangDiem.HocKy; 
        // ĐIỀN GIÁ TRỊ CÁC TRƯỜNG ĐIỂM CHI TIẾT
        document.getElementById('maMonHoc').value = bangDiem.MaMonHoc || '';
        document.getElementById('tinChi').value = bangDiem.TinChi || '';
        document.getElementById('phanTramKiemTra').value = bangDiem.PhanTramKiemTra || '';
        document.getElementById('phanTramThi').value = bangDiem.PhanTramThi || '';
        document.getElementById('diemKT1').value = bangDiem.DiemKT1 || '';
        document.getElementById('diemKT2').value = bangDiem.DiemKT2 || '';
        document.getElementById('diemTL1').value = bangDiem.DiemTL1 || '';
        document.getElementById('diemTL2').value = bangDiem.DiemTL2 || '';
        document.getElementById('diemTBHP').value = bangDiem.DiemTrungBinhHocPhan || '';
        document.getElementById('diemChu').value = bangDiem.DiemChu || '';
        document.getElementById('diem4').value = bangDiem.DiemHe4 || '';

        document.getElementById('bangDiemModal').classList.remove('hidden');
        document.getElementById('bangDiemModal').classList.add('flex');

    } catch (error) {
        console.error("Lỗi khi tải thông tin bảng điểm để sửa:", error);
        alert("Không thể tải thông tin bảng điểm để sửa. Vui lòng kiểm tra API Backend.");
    }
} 

async function deleteBangDiem(id) {
    if (confirm(`Bạn có chắc chắn muốn xóa điểm ID: ${id} không?`)) {
        try {
            const response = await fetch(`${window.API_BANG_DIEM_BASE_URL}/${id}`, {
                method: 'DELETE' 
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert('Xóa điểm thành công!');
            const currentSearchMaSo = document.getElementById('searchMaSoSinhVien').value;
            loadBangDiems(currentSearchMaSo); 
        } catch (error) {
            console.error("Lỗi khi xóa điểm:", error);
            alert("Không thể xóa điểm. Vui lòng kiểm tra API Backend và CORS.");
        }
    }
}

// Lắng nghe sự kiện DOMContentLoaded để khởi tạo trạng thái ban đầu
document.addEventListener('DOMContentLoaded', () => {
    const bangDiemForm = document.getElementById('bangDiemForm');
    if (bangDiemForm) {
        bangDiemForm.addEventListener('submit', saveBangDiem);
    } else {
        console.warn("Element with ID 'bangDiemForm' not found. Ensure BangDiem.html is loaded and the form exists.");
    }
    // Không gọi loadBangDiems() mặc định khi DOMContentLoaded để trang hiển thị trống ban đầu
    // Mà gọi loadBangDiems với MSVV rỗng để reset giao diện
    loadBangDiems(''); // Gọi với MSVV rỗng để hiển thị trang trắng ban đầu
});