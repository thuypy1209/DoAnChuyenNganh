using System;
using System.ComponentModel.DataAnnotations;

namespace DoanVienAPI.Models
{
    public class ChungNhan
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string TenHoatDong { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string TenSinhVien { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string MSSV { get; set; } = string.Empty;

        public DateTime NgayCap { get; set; } = DateTime.Now;

        [Required]
        [StringLength(50)]
        public string MaXacThuc { get; set; } = string.Empty;
    }
}