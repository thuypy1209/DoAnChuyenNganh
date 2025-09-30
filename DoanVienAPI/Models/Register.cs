using System.ComponentModel.DataAnnotations;

namespace DoanVienAPI.Models
{
    public class Register
     {
        [Required(ErrorMessage = "Họ tên không được để trống.")]
        public string FullName { get; set; }
        [Required]
        public string UserName { get; set; }
        [Required]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string Email { get; set; } = string.Empty;
        [Required]
        [MinLength(6, ErrorMessage = "Yêu cầu mật khẩu có độ dài 16 ký tự .")]
        public string Password { get; set; } = string.Empty;
        [Required]
        [Compare("Password", ErrorMessage = "Mật khẩu xác nhận không khớp.")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required]

        public string Role { get; set; } = "Đoàn viên";
    }
}
