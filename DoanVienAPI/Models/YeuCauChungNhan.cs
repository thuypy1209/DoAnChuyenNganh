using System;
using System.ComponentModel.DataAnnotations;

namespace DoanVienAPI.Models
{
    public class YeuCauChungNhan
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(20)]
        public string MSSV { get; set; } = string.Empty;
        public string? TenSinhVien { get; set; }

        [Required]
        [StringLength(255)]
        public string TenHoatDong { get; set; } = string.Empty;

        public string? LoaiChungNhan { get; set; } // Tình nguyện, Học thuật...
        public string? LyDo { get; set; }
        public string? MinhChungUrl { get; set; } // Link ảnh

        public DateTime NgayGui { get; set; } = DateTime.Now;
        public string TrangThai { get; set; } = "ChoDuyet";
    }
}