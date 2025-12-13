using System;
using System.ComponentModel.DataAnnotations;

namespace DoanVienAPI.Models
{
    public class HoSoYeuCau
    {
        [Key]
        public int Id { get; set; }
        public string TieuDe { get; set; }
        public DateTime? HanChot { get; set; }
        public bool BatBuoc { get; set; }
        public string? TrangThai { get; set; } // DangMo, DaDong
        public DateTime NgayTao { get; set; }
    }
}