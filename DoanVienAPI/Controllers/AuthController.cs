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

        // 1. ĐĂNG NHẬP -> KIỂM TRA PASS -> GỬI OTP
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Tìm user trong DB
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);

            if (user == null)
                return BadRequest(new { message = "Sai email hoặc mật khẩu!" });

            // Tạo mã OTP ngẫu nhiên 6 số
            string otp = new Random().Next(100000, 999999).ToString();

            // Lưu OTP vào DB
            user.OtpCode = otp;
            user.OtpExpiry = DateTime.Now.AddMinutes(5); // Hết hạn sau 5 phút
            await _context.SaveChangesAsync();

            // Gửi Email
            // ⚠️ QUAN TRỌNG: Cậu nhớ sửa email và mật khẩu ứng dụng ở hàm SendEmail bên dưới nhé!
            bool emailSent = SendEmail(user.Email, "Mã đăng nhập HUTECH",
                $"<h1>Xin chào {user.FullName}</h1><p>Mã OTP của bạn là: <b style='color:red; font-size: 20px;'>{otp}</b></p><p>Mã này hết hạn sau 5 phút.</p>");

            if (!emailSent)
                return StatusCode(500, new { message = "Lỗi gửi mail. Hãy kiểm tra lại cấu hình Gmail trong code." });

            return Ok(new { message = "OTP đã gửi về email!", step = "verify_otp" });
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