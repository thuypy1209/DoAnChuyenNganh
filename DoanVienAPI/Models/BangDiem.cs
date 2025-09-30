using System.ComponentModel.DataAnnotations;
using System;

namespace DoanVienAPI.Models
{
    public class BangDiem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string TenSinhVien { get; set; } = string.Empty; 

        [Required]
        [StringLength(50)]
        public string MaSoSinhVien { get; set; } = string.Empty; 

        [Required]
        [StringLength(255)]
        public string TenMonHoc { get; set; } = string.Empty; 

        public double Diem { get; set; } 

        [Required]
        [StringLength(50)]
        public string HocKy { get; set; } = string.Empty; 

        // THÊM CÁC TRƯỜNG NÀY (nếu chưa có) để hiển thị thông tin sinh viên từ bảng điểm
        public string? Email { get; set; } 
        public string? Khoa { get; set; } 
        public string? Nganh { get; set; } 
        public string? KhoaHoc { get; set; } 

        // Các trường điểm chi tiết (nếu chưa có)
        [StringLength(50)]
        public string? MaMonHoc { get; set; }

        public int? TinChi { get; set; }

        public int? PhanTramKiemTra { get; set; }

        public int? PhanTramThi { get; set; }

        public double? DiemKT1 { get; set; }

        public double? DiemKT2 { get; set; }

        public double? DiemTL1 { get; set; }

        public double? DiemTL2 { get; set; }

        public double? DiemTrungBinhHocPhan { get; set; }

        [StringLength(10)]
        public string? DiemChu { get; set; }

        public double? DiemHe4 { get; set; }

        public DateTime NgayCapNhat { get; set; } 
    }
}