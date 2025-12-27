using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using BCrypt.Net;
using System.Net;
using System.Net.Mail;

//  CÁC THƯ VIỆN ĐỂ DÙNG JWT
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DoanVienAPI.Controllers
{
    // Class hứng dữ liệu Đăng ký
    public class RegisterRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Mssv { get; set; }
        public string Lop { get; set; }
        public string Khoa { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

  

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration; // Thêm cái này để đọc AppSettings

        // Inject thêm IConfiguration vào Constructor
        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // --- HÀM PHỤ: TẠO TOKEN JWT (Lấy từ AccountController sang) ---
        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            if (string.IsNullOrEmpty(jwtKey))
                throw new InvalidOperationException("JWT Key chưa được cấu hình trong appsettings.json");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Tạo các thông tin (Claims) chứa trong Token
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("userId", user.Id.ToString()), // Lưu ID
                new Claim("fullName", user.FullName),    // Lưu Tên
                new Claim("mssv", user.Mssv ?? ""),      // Lưu MSSV
                new Claim(ClaimTypes.Role, user.Role)    // Lưu Quyền (Admin/Student)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3), // Token sống 3 tiếng
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // --- 1. ĐĂNG KÝ (GIỮ NGUYÊN LOGIC LƯU 2 BẢNG) ---
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "Email này đã được đăng ký rồi!" });

            if (await _context.DoanViens.AnyAsync(d => d.MSSV == request.Mssv))
                return BadRequest(new { message = "Mã số sinh viên này đã tồn tại trong hệ thống!" });

            // A. TẠO USER
            var newUser = new User
            {
                Email = request.Email,
                FullName = request.FullName,
                Role = "Student",
                Mssv = request.Mssv,
                Lop = request.Lop,
                Khoa = request.Khoa,
                AvatarUrl = "default.png"
            };
            newUser.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // B. TẠO HỒ SƠ DOANVIEN
            var newProfile = new DoanVien
            {
                MSSV = request.Mssv,
                HoTen = request.FullName,
                Lop = request.Lop,
                Khoa = request.Khoa,
                Email = request.Email,
                NgayTao = DateTime.Now,
                AnhDaiDien = "default.png"
            };

            // C. LƯU DATABASE
            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    _context.Users.Add(newUser);
                    _context.DoanViens.Add(newProfile);

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new { message = "Đăng ký thành công! Đã tạo tài khoản và hồ sơ." });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    var innerMsg = ex.InnerException != null ? ex.InnerException.Message : "";
                    return StatusCode(500, new { message = "Lỗi lưu Database: " + ex.Message + " " + innerMsg });
                }
            }
        }

        // --- 2. ĐĂNG NHẬP (ĐÃ SỬA: TRẢ VỀ TOKEN XỊN) ---
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            // Kiểm tra mật khẩu
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return BadRequest(new { message = "Sai email hoặc mật khẩu!" });
            }

            // TẠO TOKEN JWT THẬT
            var tokenString = GenerateJwtToken(user);

            return Ok(new
            {
                message = "Đăng nhập thành công!",
                token = tokenString, // Token này giờ là hàng thật
                role = user.Role,
                userId = user.Id,
                fullName = user.FullName,
                mssv = user.Mssv,
                lop = user.Lop,
                khoa = user.Khoa,
                email = user.Email
            });
        }

        // --- 3. TẠO ADMIN NHANH (Giữ nguyên) ---
        [HttpGet("tao-admin-nhanh")]
        public async Task<IActionResult> TaoAdminNhanh()
        {
            var emailAdmin = "";

            if (await _context.Users.AnyAsync(u => u.Email == emailAdmin))
                return Ok(new { message = "Admin đã có rồi." });

            var admin = new User
            {
                Email = emailAdmin,
                FullName = "Admin Việt",
                Role = "Admin",
                Mssv = "ADMIN001",
                Lop = "ALL",
                Khoa = "CNTT"
            };

            admin.Password = BCrypt.Net.BCrypt.HashPassword("123456");

            _context.Users.Add(admin);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã tạo Admin thành công (Pass: 123456)" });
        }
    }
}