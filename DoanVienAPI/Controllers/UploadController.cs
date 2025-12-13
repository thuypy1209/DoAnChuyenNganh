using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DoanVienAPI.Data;
using System.IO;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env; // Người quản lý thư mục server

        public UploadController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // API: ĐỔI ẢNH ĐẠI DIỆN
        // POST: api/Upload/Avatar/1 (Số 1 là ID sinh viên)
        [HttpPost("Avatar/{id}")]
        public async Task<IActionResult> UploadAvatar(int id, IFormFile file)
        {
            // 1. Kiểm tra xem có file gửi lên không
            if (file == null || file.Length == 0)
                return BadRequest("Chưa chọn ảnh nào cả!");

            // 2. Tìm sinh viên trong Database
            var sv = await _context.DoanViens.FindAsync(id);
            if (sv == null) return NotFound("Không tìm thấy sinh viên này.");

            // 3. Xử lý lưu ảnh vào ổ cứng (Thư mục wwwroot/uploads)
            // Tạo tên file mới để không bị trùng (Ví dụ: avatar_1_xyz.jpg)
            string extension = Path.GetExtension(file.FileName);
            string newFileName = $"avatar_{id}_{Guid.NewGuid()}{extension}";

            // Đường dẫn đến thư mục lưu trữ
            string folderPath = Path.Combine(_env.WebRootPath, "uploads");

            // Nếu thư mục chưa có thì tạo mới
            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            // Đường dẫn file đầy đủ
            string filePath = Path.Combine(folderPath, newFileName);

            // Lưu file vào ổ cứng
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 4. Lưu đường dẫn ảnh vào Database (Đường dẫn web: https://localhost.../uploads/...)
            // Lấy địa chỉ gốc của server hiện tại
            string baseUrl = $"{Request.Scheme}://{Request.Host}";
            string webUrl = $"{baseUrl}/uploads/{newFileName}";

            sv.AnhDaiDien = webUrl; // Cập nhật cột AnhDaiDien
            await _context.SaveChangesAsync(); // Lưu vào SQL

            // 5. Trả kết quả về cho Frontend vui
            return Ok(new { message = "Đổi ảnh thành công!", link = webUrl });
        }
    }
}