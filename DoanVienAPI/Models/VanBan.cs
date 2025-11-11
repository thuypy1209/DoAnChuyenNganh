// File: Models/VanBan.cs
using System;
using System.ComponentModel.DataAnnotations;

public class VanBan
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(255)]
    public string TenVanBan { get; set; }

    [StringLength(100)]
    public string? LoaiVanBan { get; set; }

    [StringLength(255)]
    public string? DonViBanHanh { get; set; }

    public DateTime? NgayBanHanh { get; set; }

    public string? NoiDung { get; set; }

    // Dùng để lưu đường dẫn tới file đã upload, ví dụ: /documents/ten_file.pdf
    public string? DuongDanFile { get; set; }

    // Thêm các thuộc tính khác nếu cần...
}