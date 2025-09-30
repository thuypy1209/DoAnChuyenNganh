using System.ComponentModel.DataAnnotations;
using System; // Thêm using System; để dùng DateTime

namespace DoanVienAPI.Models
{
    public class DanhMuc
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string TenDanhMuc { get; set; } = string.Empty; 

        [StringLength(1000)]
        public string? MoTa { get; set; } 

        // THÊM CÁC THUỘC TÍNH MỚI NÀY
        public DateTime NgayTao { get; set; } // Ngày tạo danh mục
        public DateTime NgayCapNhat { get; set; } // Ngày cập nhật danh mục
    }
}