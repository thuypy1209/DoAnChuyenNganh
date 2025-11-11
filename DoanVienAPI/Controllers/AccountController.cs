using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using DoanVienAPI.Areas.Identity.Data;
using DoanVienAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Diagnostics.Eventing.Reader;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Identity.UI.Services;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;

        public AccountController(UserManager<ApplicationUser> userManager,
                                     RoleManager<IdentityRole> roleManager,
                                     IConfiguration configuration)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                // SỬA LỖI CS8604: user.UserName và user.Id có thể là null
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty)
            };

            // Thêm vai trò (Giữ nguyên logic phân quyền)
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
                throw new InvalidOperationException("JWT Key is missing in configuration.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // HÀM REGISTER (Đăng ký)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Register model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors });
            }
            var existingEmail = await _userManager.FindByEmailAsync(model.Email);

            if (existingEmail != null)
                return BadRequest("Email này đã được sử dụng");

            if (model.Password != model.ConfirmPassword)
                return BadRequest("Password and Confirm Password do not match");

            var allowedRoles = new List<string> { "Admin", "Đoàn Trường", "Đoàn Khoa", "Đoàn Viên" };

            // XỬ LÝ LỖI NULL
            if (model.Role == null || !allowedRoles.Contains(model.Role))
                return BadRequest(new { success = false, message = "Vai trò không hợp lệ." });

            var user = new ApplicationUser
            {
                UserName = model.UserName,
                Email = model.Email,
                FullName = model.FullName
            };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            if (!await _roleManager.RoleExistsAsync(model.Role))
                await _roleManager.CreateAsync(new IdentityRole(model.Role));

            await _userManager.AddToRoleAsync(user, model.Role);
            return Ok(new { message = "User registered successfully" });

        }

        // HÀM LOGIN (Đăng nhập)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Login model)
        {
            // SỬA LỖI CS8604: model.UserName có thể là null
            if (string.IsNullOrEmpty(model.UserName) || string.IsNullOrEmpty(model.Password))
                return Unauthorized("Tên đăng nhập và mật khẩu không được để trống.");

            var user = await _userManager.FindByNameAsync(model.UserName);

            if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
                return Unauthorized("Tên đăng nhập hoặc mật khẩu không đúng.");

            var userRoles = await _userManager.GetRolesAsync(user);
            Console.WriteLine("User roles from DB: " + string.Join(", ", userRoles));

            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
                return BadRequest("JWT Key is not configured properly.");

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.UtcNow.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo
            });
        }

        // HÀM GET PROFILE
        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            // SỬA LỖI CS8604: User.FindFirstValue(ClaimTypes.Name) có thể là null
            var userName = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(userName))
                return Unauthorized("Không xác định được người dùng đăng nhập.");

            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
                return NotFound("Không tìm thấy người dùng");

            var role = await _userManager.GetRolesAsync(user);
            var userRole = role.FirstOrDefault() ?? "Đoàn Viên";

            return Ok(new
            {
                user.FullName,
                user.UserName,
                user.Email,
                Role = userRole
            });
        }

        // HÀM CHANGE PASSWORD
        [Authorize]
        [HttpPost("changepassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePassword model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors });
            }

            var userName = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrEmpty(userName))
                return Unauthorized(new { message = "Không xác định được người dùng đăng nhập" });

            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng" });

            if (model.CurrentPassword == model.NewPassword)
                return BadRequest(new { message = "Mật khẩu mới không được trùng với mật khẩu hiện tại" });

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return BadRequest(new { message = "Đổi mật khẩu thất bại", errors });
            }

            return Ok(new { success = true, message = "Đổi mật khẩu thành công" });

        }
    }
}