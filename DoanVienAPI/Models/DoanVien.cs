using System.ComponentModel.DataAnnotations;
using System;

namespace DoanVienAPI.Models
{
    public class DoanVien
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string MaDoanVien { get; set; } // Mã số sinh viên

        [Required]
        [StringLength(255)]
        public string HoTen { get; set; }

        public DateTime? NgaySinh { get; set; } // Có thể null nếu không nhập

        [StringLength(20)]
        public string? SoDienThoai { get; set; } // Có thể null

        [StringLength(255)]
        [EmailAddress]
        public string? Email { get; set; } // Có thể null, thêm EmailAddress cho validation

        public DateTime NgayTao { get; set; } // Tự động tạo khi thêm mới

        // THÊM CÁC THUỘC TÍNH MỚI NÀY
        [StringLength(100)]
        public string? Khoa { get; set; } // Tên khoa, có thể null

        [StringLength(100)]
        public string? Nganh { get; set; } // Tên ngành, có thể null

        [StringLength(50)]
        public string? KhoaHoc { get; set; } // Khóa học (ví dụ: K20, K21), có thể null
    }
}