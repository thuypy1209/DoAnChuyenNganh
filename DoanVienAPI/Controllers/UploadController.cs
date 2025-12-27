using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting; // Để lấy đường dẫn thư mục lưu ảnh
using System.IO;
using System.Threading.Tasks;
using System;
using DoanVienAPI.Data; // Nhớ sửa lại namespace nếu khác
using Microsoft.EntityFrameworkCore;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ApplicationDbContext _context;

        public UploadController(IWebHostEnvironment environment, ApplicationDbContext context)
        {
            _environment = environment;
            _context = context;
        }

        // 👇 ĐÂY LÀ CÁI CỬA MÀ FRONTEND ĐANG TÌM KIẾM
        [HttpPost("Avatar/{studentId}")]
        public async Task<IActionResult> UploadAvatar(string studentId, IFormFile file)
        {
            // 1. Kiểm tra file có hợp lệ không
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Chưa chọn file hoặc file bị lỗi." });

            try
            {
                // 2. Tạo tên file mới (để tránh trùng lặp)
                // Ví dụ: avatar_17_20241212.jpg
                var fileExtension = Path.GetExtension(file.FileName);
                var newFileName = $"avatar_{studentId}_{DateTime.Now.Ticks}{fileExtension}";

                // 3. Tìm đường dẫn lưu file (Lưu vào thư mục wwwroot/images)
                // Đảm bảo bạn đã có thư mục 'wwwroot/images' trong dự án Backend
                var uploadFolder = Path.Combine(_environment.WebRootPath, "images");
                if (!Directory.Exists(uploadFolder))
                    Directory.CreateDirectory(uploadFolder); // Chưa có thì tự tạo

                var filePath = Path.Combine(uploadFolder, newFileName);

                // 4. Lưu file vật lý vào ổ cứng
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // 5. Tạo đường dẫn URL để Web truy cập được
                // Ví dụ: http://localhost:5114/images/avatar_17_...
                var serverUrl = $"{this.Request.Scheme}://{this.Request.Host}";
                var fileUrl = $"{serverUrl}/images/{newFileName}";

                // Trong UploadController.cs, sửa lại đoạn update Database:

                // ... đoạn lưu file ở trên giữ nguyên ...

                // 6. Cập nhật link ảnh vào Database (SỬA LẠI ĐOẠN NÀY)
                // Tìm sinh viên bất chấp (theo ID hoặc theo MSSV)
                var doanVien = await _context.DoanViens
                    .FirstOrDefaultAsync(d => d.MSSV == studentId || d.Id.ToString() == studentId);

                if (doanVien != null)
                {
                    doanVien.AnhDaiDien = fileUrl;

                    // Đánh dấu là dữ liệu đã thay đổi
                    _context.Entry(doanVien).State = EntityState.Modified;

                    // Lưu ngay lập tức
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Nếu không tìm thấy thì báo lỗi để mình biết
                    return BadRequest(new { message = $"Không tìm thấy sinh viên có ID hoặc MSSV là: {studentId}" });
                }

                return Ok(new { link = fileUrl, message = "Upload thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi Server: " + ex.Message });
            }
        }
    }
}