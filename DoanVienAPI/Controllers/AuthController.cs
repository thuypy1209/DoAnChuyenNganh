using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;   // Namespace chứa ApplicationDbContext
using DoanVienAPI.Models; // Namespace chứa User
using System.Net;
using System.Net.Mail;

namespace DoanVienAPI.Controllers
{
    // Class hứng dữ liệu gửi lên
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class VerifyRequest
    {
        public string Email { get; set; }
        public string OtpCode { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // 1. Kiểm tra tài khoản
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);

            if (user == null)
                return BadRequest(new { message = "Sai email hoặc mật khẩu!" });

            // 2. BỎ QUA OTP -> TRẢ VỀ QUYỀN LUÔN
            return Ok(new
            {
                message = "Đăng nhập thành công!",
                role = user.Role,      // Trả về "Admin" hoặc "Student"
                userId = user.Id,
                fullName = user.FullName
            });
        }

        // 2. XÁC THỰC OTP -> TRẢ VỀ QUYỀN (ROLE)
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null) return BadRequest(new { message = "User không tồn tại" });

            // Kiểm tra OTP
            if (user.OtpCode != request.OtpCode)
                return BadRequest(new { message = "Mã OTP sai rồi!" });

            if (user.OtpExpiry < DateTime.Now)
                return BadRequest(new { message = "Mã OTP đã hết hạn!" });

            // Xóa OTP sau khi dùng xong
            user.OtpCode = null;
            user.OtpExpiry = null;
            await _context.SaveChangesAsync();

            // ✅ Thành công -> Trả về Role để Frontend điều hướng
            return Ok(new
            {
                message = "Đăng nhập thành công!",
                role = user.Role,      // "Admin" hoặc "Student"
                userId = user.Id,
                fullName = user.FullName
            });
        }

        // --- HÀM GỬI EMAIL (Dùng Gmail) ---
        private bool SendEmail(string toEmail, string subject, string body)
        {
            try
            {
                // 👇 CẤU HÌNH GMAIL CỦA CẬU Ở ĐÂY 👇
                var fromEmail = "";  // Điền Email thật của cậu
                var appPassword = ""; // Điền Mật khẩu ứng dụng 16 ký tự

                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential(fromEmail, appPassword),
                    EnableSsl = true,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(toEmail);

                smtpClient.Send(mailMessage);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi gửi mail: " + ex.Message);
                return false;
            }
        }

        // ... (Các đoạn code cũ giữ nguyên)

        // 👇 THÊM ĐOẠN NÀY VÀO TRONG AUTHCONTROLLER
        [HttpGet("tao-admin-nhanh")]
        public async Task<IActionResult> TaoAdminNhanh()
        {
            // 1. Kiểm tra xem đã có Admin chưa
            var emailAdmin = ""; // ⚠️ SỬA THÀNH EMAIL THẬT CỦA ÔNG
            var daCoAdmin = await _context.Users.AnyAsync(u => u.Email == emailAdmin);

            if (daCoAdmin)
            {
                return Ok(new { message = "Tài khoản Admin này đã có rồi! Đăng nhập thôi." });
            }

            // 2. Nếu chưa có thì tạo mới
            var admin = new User
            {
                Email = emailAdmin,
                Password = "123456",       // Mật khẩu mặc định
                FullName = "Admin Việt",
                Role = "Admin",            // Cấp quyền Admin
                OtpCode = null,
                OtpExpiry = null
            };

            _context.Users.Add(admin);
            await _context.SaveChangesAsync();

            return Ok(new { message = "✅ ĐÃ TẠO XONG ADMIN! Bạn có thể dùng email này để đăng nhập ngay." });
        }
    }


}