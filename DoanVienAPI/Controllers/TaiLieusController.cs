using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaiLieusController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public TaiLieusController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: Lấy danh sách tài liệu
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaiLieu>>> GetTaiLieus()
        {
            return await _context.TaiLieus.OrderByDescending(t => t.NgayDang).ToListAsync();
        }

        // POST: Upload tài liệu mới
        [HttpPost]
        public async Task<ActionResult<TaiLieu>> UploadTaiLieu([FromForm] TaiLieu taiLieu, [FromForm] IFormFile? fileTaiLieu)
        {
            // 1. Xử lý file upload
            if (fileTaiLieu != null && fileTaiLieu.Length > 0)
            {
                string extension = Path.GetExtension(fileTaiLieu.FileName);
                string fileName = $"doc_{Guid.NewGuid()}{extension}";
                string uploadFolder = Path.Combine(_env.WebRootPath, "uploads", "docs");

                if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

                string filePath = Path.Combine(uploadFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await fileTaiLieu.CopyToAsync(stream);
                }

                // Lưu URL
                string baseUrl = $"{Request.Scheme}://{Request.Host}";
                taiLieu.DuongDanUrl = $"{baseUrl}/uploads/docs/{fileName}";
            }

            taiLieu.NgayDang = DateTime.Now;
            _context.TaiLieus.Add(taiLieu);
            await _context.SaveChangesAsync();

            return Ok(taiLieu);
        }

        // DELETE: Xóa tài liệu
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTaiLieu(int id)
        {
            var item = await _context.TaiLieus.FindAsync(id);
            if (item == null) return NotFound();
            _context.TaiLieus.Remove(item);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}