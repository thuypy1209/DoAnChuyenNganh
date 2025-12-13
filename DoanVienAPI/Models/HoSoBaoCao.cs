using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoanVienAPI.Models
{
    [Table("HoSos")] // Đảm bảo trỏ đúng bảng HoSos trong SQL
    public class HoSoBaoCao
    {
        [Key]
        public int Id { get; set; }

        public string? TenHoSo { get; set; }      // Khớp SQL
        public string? MSSV { get; set; }         // Khớp SQL
        public string? TenSinhVien { get; set; }  // Khớp SQL
        public string? DuongDanTep { get; set; }  // Khớp SQL
        public DateTime NgayNop { get; set; }     // Khớp SQL
        public DateTime? NgayTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string? TrangThai { get; set; }
    }
}