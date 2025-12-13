using System.ComponentModel.DataAnnotations;
using System;

namespace DoanVienAPI.Models
{
    public class TinTuc
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string TieuDe { get; set; } = string.Empty; // Tiêu đề tin tức

        [StringLength(1000)]
        public string? NoiDungTomTat { get; set; } // Tóm tắt nội dung, có thể null


        // --- CHÚNG TA THÊM DÒNG NÀY VÀO ---
        // Đây chính là cột Nội dung CHI TIẾT
        
        // ------------------------------------


        [StringLength(100)]
        public string? TenTacGia { get; set; } // Tên tác giả, có thể null

        public DateTime NgayDang { get; set; } // Ngày đăng

        [StringLength(500)]
        public string? UrlHinhAnh { get; set; } // URL hình ảnh, có thể null

        // --- CÁC CỘT MỚI THÊM ---
        public string? TomTat { get; set; }

        public string? HinhAnhUrl { get; set; }

        public string? NoiDung { get; set; }
    }
}