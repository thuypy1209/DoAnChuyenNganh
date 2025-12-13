using System;
using System.ComponentModel.DataAnnotations;

namespace DoanVienAPI.Models
{
    public class TaiLieu
    {
        [Key]
        public int Id { get; set; }
        public string TenTaiLieu { get; set; }
        public string? MoTa { get; set; }
        public string? LoaiTaiLieu { get; set; } // Biểu mẫu, Hướng dẫn...
        public string? DuongDanUrl { get; set; }
        public DateTime NgayDang { get; set; }
    }
}