using System;

namespace DoanVienAPI.Models
{
    public class DanhHieu
    {
        public int Id { get; set; }
        public int SinhVienId { get; set; } // Liên kết với bảng DoanVien
        public string TenDanhHieu { get; set; } // Ví dụ: Sinh viên 5 tốt
        public string NamHoc { get; set; }      // Ví dụ: 2024-2025
        public DateTime NgayDat { get; set; }
        public string Icon { get; set; }        // Ví dụ: medal
        public string Color { get; set; }       // Ví dụ: yellow
    }
}