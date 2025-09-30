// Pages/js/hoSoBaoCao.js

const API_BASE_URL = 'https://localhost:7080/api/HoSos'; // KIỂM TRA LẠI CỔNG CỦA API BACKEND CỦA EM

$(document).ready(function() {
    const currentDoanVienId = $('#doanVienId').val();

    if (!currentDoanVienId) {
        alert('Lỗi: Không thể xác định ID Đoàn viên. Vui lòng kiểm tra lại cấu hình hoặc đăng nhập.');
        $('#hoSoListContainer').html('<p style="color: red;">Không thể tải danh sách hồ sơ vì không xác định được Đoàn viên.</p>');
        return;
    }

    // Tải danh sách hồ sơ khi trang được tải lần đầu
    loadHoSoTaiLieu(currentDoanVienId);

    $('#uploadForm').on('submit', async function(event) {
        event.preventDefault(); 

        const fileInput = $('#fileInput')[0]; 
        const tenHoSo = $('#tenHoSo').val();
        const moTa = $('#moTa').val();

        if (!fileInput.files.length) {
            alert('Vui lòng chọn một file để nộp.');
            return;
        }
        // Chỉ cho phép file Excel
        const allowedTypes = [
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
        ];
        const file = fileInput.files[0];
        if (!allowedTypes.includes(file.type)) {
            alert('Chỉ cho phép nộp file Excel (.xls, .xlsx)');
            return;
        }
        if (tenHoSo.trim() === '') {
            alert('Vui lòng nhập tên hồ sơ.');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('tenHoSo', tenHoSo);
        formData.append('moTa', moTa);
        formData.append('doanVienId', currentDoanVienId);

        try {
            // SỬA ĐỂ GỌI ĐÚNG API CỦA EM: POST /api/HoSos
            const response = await fetch(`${API_BASE_URL}`, { 
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                alert('Nộp hồ sơ thành công!');
                $('#uploadForm')[0].reset(); 
                loadHoSoTaiLieu(currentDoanVienId); // Tải lại danh sách sau khi nộp thành công
            } else {
                // Thử đọc lỗi từ phản hồi JSON
                const errorData = await response.json();
                alert('Lỗi khi nộp hồ sơ: ' + (errorData.message || response.statusText));
                console.error('API Error (Upload):', errorData);
            }
        } catch (error) {
            console.error('Lỗi mạng hoặc server khi nộp hồ sơ:', error);
            alert('Không thể kết nối đến server. Vui lòng thử lại sau.');
        }
    });

    async function loadHoSoTaiLieu(doanVienId) {
        const hoSoListContainer = $('#hoSoListContainer');
        hoSoListContainer.html('<p>Đang tải danh sách hồ sơ...</p>'); 

        try {
            // SỬA ĐỂ GỌI ĐÚNG API CỦA EM: GET /api/HoSos (lấy tất cả)
            const response = await fetch(`${API_BASE_URL}`); 

            if (response.ok) {
                let hoSoList = await response.json();
                
                // Lọc danh sách hồ sơ theo doanVienId (vì API GET /HoSos trả về tất cả)
                const filteredHoSoList = hoSoList.filter(hoSo => hoSo.doanVienId == doanVienId);
                
                hoSoListContainer.empty(); 

                if (filteredHoSoList && filteredHoSoList.length > 0) {
                    // Tạo bảng để hiển thị danh sách hồ sơ
                    let tableHtml = `
                        <table class="table-custom">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên Hồ sơ</th>
                                    <th>Loại File</th>
                                    <th>Mô tả</th>
                                    <th>Kích thước</th>
                                    <th>Ngày Nộp</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;

                    filteredHoSoList.forEach((hoSo, index) => { // Sử dụng filteredHoSoList
                        const fileSizeMB = (hoSo.kichThuocFile / (1024 * 1024)).toFixed(2); 
                        const ngayNopFormatted = new Date(hoSo.ngayNop).toLocaleString('vi-VN'); 
                        
                        tableHtml += `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${hoSo.tenHoSo}</td>
                                <td><span style="text-transform: uppercase;">${hoSo.loaiFile}</span></td>
                                <td>${hoSo.moTa || 'Không có mô tả'}</td>
                                <td>${fileSizeMB} MB</td>
                                <td>${ngayNopFormatted}</td>
                                <td>
                                    <button class="btn-action-custom btn-info-custom download-btn" data-file-id="${hoSo.id}"><i class="fas fa-download"></i> Tải</button>
                                    <button class="btn-action-custom btn-danger-custom delete-btn" data-file-id="${hoSo.id}"><i class="fas fa-trash"></i> Xóa</button>
                                </td>
                            </tr>
                        `;
                    });

                    tableHtml += `
                            </tbody>
                        </table>
                    `;
                    hoSoListContainer.html(tableHtml);

                    // Gắn sự kiện cho nút Download và Delete
                    $('.download-btn').on('click', function() {
                        const fileId = $(this).data('file-id');
                        // API Download vẫn là /Download/{id}
                        window.location.href = `${API_BASE_URL}/Download/${fileId}`; 
                    });

                    $('.delete-btn').on('click', async function() {
                        const fileId = $(this).data('file-id');
                        if (confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
                            try {
                                const response = await fetch(`${API_BASE_URL}/${fileId}`, { // API DELETE là /{id}
                                    method: 'DELETE'
                                });
                                if (response.ok) {
                                    alert('Xóa hồ sơ thành công!');
                                    loadHoSoTaiLieu(currentDoanVienId); // Tải lại danh sách
                                } else {
                                    const errorData = await response.json();
                                    alert('Lỗi khi xóa hồ sơ: ' + (errorData.message || response.statusText));
                                    console.error('API Error (Delete):', errorData);
                                }
                            } catch (error) {
                                console.error('Lỗi mạng hoặc server khi xóa hồ sơ:', error);
                                alert('Không thể kết nối đến server. Vui lòng thử lại sau.');
                            }
                        }
                    });

                } else {
                    hoSoListContainer.html('<p>Không có hồ sơ nào được nộp.</p>');
                }

            } else {
                const errorData = await response.json();
                hoSoListContainer.html(`<p style="color: red;">Lỗi khi tải danh sách hồ sơ: ${errorData.message || response.statusText}</p>`);
                console.error('API Error (Load List):', errorData);
            }
        } catch (error) {
            console.error('Lỗi mạng hoặc server khi tải danh sách hồ sơ:', error);
            hoSoListContainer.html('<p style="color: red;">Không thể kết nối đến server để tải danh sách hồ sơ.</p>');
        }
    }
});