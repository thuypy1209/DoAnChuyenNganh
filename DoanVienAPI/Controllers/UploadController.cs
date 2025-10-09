using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

[Route("api/[controller]")]
[ApiController]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public UploadController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpPost]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Không có file nào được chọn.");
        }

        // Tạo một tên file ngẫu nhiên, độc nhất để tránh bị trùng
        var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";

        // Xác định đường dẫn để lưu file
        var uploadsFolderPath = Path.Combine(_environment.WebRootPath, "images", "avatars");
        var filePath = Path.Combine(uploadsFolderPath, uniqueFileName);

        // Đảm bảo thư mục tồn tại
        if (!Directory.Exists(uploadsFolderPath))
        {
            Directory.CreateDirectory(uploadsFolderPath);
        }

        // Lưu file vào server
        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Trả về đường dẫn tương đối của file để lưu vào CSDL
        var relativePath = $"/images/avatars/{uniqueFileName}";

        return Ok(new { filePath = relativePath });
    }
}