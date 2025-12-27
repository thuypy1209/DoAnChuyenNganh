using System;
using System.ComponentModel.DataAnnotations;

namespace DoanVienAPI.Models
{
    public class HoatDong
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string TenHoatDong { get; set; } = string.Empty;

        public string? MoTa { get; set; }
        public string? PosterUrl { get; set; }
        public string? DiaDiem { get; set; }

        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }

        public int SoLuongToiDa { get; set; }
        public int SoLuongDaDangKy { get; set; }

        public string? TieuChiSV5T { get; set; } // Ví dụ: Tình nguyện tốt
        public int DiemRenLuyen { get; set; }

        public string? LoaiHoatDong { get; set; } // Tình nguyện, Học thuật...
        public string? KhoaToChuc { get; set; }   // Khoa CNTT...

        public string TrangThai { get; set; } = "DangMo"; // DangMo, SapDienRa, DaKetThuc

        public string? TieuChi { get; set; }
    }
}