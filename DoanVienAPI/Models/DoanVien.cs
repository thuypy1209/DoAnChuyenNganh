// File: Models/DoanVien.cs
using System;
using System.ComponentModel.DataAnnotations;

public class DoanVien
{
    [Key]
    public int Id { get; set; }

    public string? MaDinhDanh { get; set; } // Sẽ khớp với doanVienData.maDinhDanh

    [Required]
    public string HoTen { get; set; } // Sẽ khớp với doanVienData.hoTen

    public DateTime? NgaySinh { get; set; }
    public string? GioiTinh { get; set; }
    public string? DanToc { get; set; }
    public string? TonGiao { get; set; }
    public string? Email { get; set; }
    public string? SoDienThoai { get; set; }
    public string? Cmnd { get; set; }
    public DateTime? NgayCap { get; set; }
    public string? NoiCap { get; set; }
    public string? QueQuan { get; set; }
    public string? ThuongTru { get; set; }
    public string? TrinhDoVanHoa { get; set; }
    public string? TrinhDoChuyenMon { get; set; }
    public string? LyLuanChinhTri { get; set; }
    public string? TrinhDoTinHoc { get; set; }
    public string? NgoaiNgu { get; set; }
    public string? SoTheDoan { get; set; }
    public DateTime? NgayVaoDoan { get; set; }
    public DateTime? NgayVaoDang { get; set; }
    public string? ChucVu { get; set; }
    public string? NghiQuyetKetNap { get; set; }
    public string? NgheNghiep { get; set; }
    public string? HeDaoTao { get; set; }
    public DateTime NgayTao { get; set; }
    public string? AnhDaiDien { get; set; } // Để lưu đường dẫn tới file ảnh
}