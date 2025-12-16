using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DoanVienAPI.Models // ⚠️ Lưu ý: Đổi namespace nếu tên project của ông khác
{
    [Table("Users")] // Đây sẽ là tên bảng trong SQL Server
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required] // Bắt buộc phải có
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty; // Mật khẩu

        public string FullName { get; set; } = string.Empty; // Họ tên sinh viên

        // --- PHẦN QUAN TRỌNG CHO PHÂN QUYỀN & OTP ---

        // Vai trò: Mặc định là "Student", ông có thể sửa thành "Admin" trong Database
        public string Role { get; set; } = "Student";

        // Mã OTP (Cho phép null vì lúc bình thường không có mã)
        public string? OtpCode { get; set; }

        // Thời gian hết hạn OTP
        public DateTime? OtpExpiry { get; set; }

        public string? Mssv { get; set; }      // Mã số sinh viên
        public string? Lop { get; set; }       // Lớp (VD: 22DTHC1)
        public string? Khoa { get; set; }      // Khoa (VD: CNTT)
        public string? AvatarUrl { get; set; }
    }
}