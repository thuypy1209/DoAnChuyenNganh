// C:\Users\VIỆT\DoanQuanLyDoanVien\Pages\js\globalConfig.js

// 1. KHAI BÁO BASE URL CỦA BẠN (Dùng cổng 5114)
window.API_BASE_URL = 'http://localhost:5114/api';

// 2. KHAI BÁO CÁC CHỨC NĂNG KHÁC (GIỮ NGUYÊN)
window.API_DOAN_VIEN_URL = `${window.API_BASE_URL}/DoanViens`;
window.API_LICH_THI_BASE_URL = `${window.API_BASE_URL}/LichThis`;
window.API_BANG_DIEM_BASE_URL = `${window.API_BASE_URL}/BangDiems`;
window.API_HO_SO_BASE_URL = `${window.API_BASE_URL}/HoSos`;
window.API_DANH_MUC_BASE_URL = `${window.API_BASE_URL}/DanhMucs`;

// 3. ĐỊNH NGHĨA URL MỚI CHO TIN TỨC (Dùng Controller Mới TinTucMoi)
// Dòng này sẽ thay thế đường dẫn API Tin tức cũ
window.API_TIN_TUC_BASE_URL = `${window.API_BASE_URL}/TinTucMoi`; 

// 4. XÓA CẤU HÌNH THỪA (export const)
// XÓA TẤT CẢ CODE BÊN DƯỚI NÀY:
// export const BASE_API_URL = 'https://localhost:7006/api'; 
// export const API_TIN_TUC_BASE_URL = `${BASE_API_URL}/TinTucMoi`; 

console.log("Global config loaded successfully! Using new API: TinTucMoi");