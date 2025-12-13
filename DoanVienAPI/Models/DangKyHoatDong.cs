using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoanVienAPI.Models
{
    public class DangKyHoatDong
    {
        [Key]
        public int Id { get; set; }

        public int HoatDongId { get; set; } // Mã hoạt động

        [Required]
        public string MSSV { get; set; } = string.Empty;
        public string? TenSinhVien { get; set; }

        public DateTime NgayDangKy { get; set; } = DateTime.Now;
        public string TrangThaiDuyet { get; set; } = "ChoDuyet"; // ChoDuyet, DaDuyet...

        public string? MinhChungUrl { get; set; } // Link ảnh minh chứng
        public bool DaDiemDanh { get; set; } = false; // Đã quét QR chưa
        public DateTime? ThoiGianDiemDanh { get; set; }

        // Tạo liên kết ảo để dễ truy vấn thông tin hoạt động sau này
        [ForeignKey("HoatDongId")]
        public virtual HoatDong? HoatDong { get; set; }

        public string? LyDoTuChoi { get; set; }
    }
}