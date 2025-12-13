using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.IO; // Thêm thư viện xử lý file
using Microsoft.AspNetCore.Hosting; // Thêm thư viện môi trường
using Microsoft.AspNetCore.Http; // Thêm thư viện HTTP

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TinTucsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env; // Biến để lấy đường dẫn lưu ảnh

        public TinTucsController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // HÀM 1: Lấy Danh sách (Sắp xếp tin mới nhất lên đầu)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TinTuc>>> GetTinTucs()
        {
            if (_context.TinTucs == null) return NotFound();

            // OrderByDescending: Tin mới đăng sẽ hiện lên trước
            return await _context.TinTucs
                                 .OrderByDescending(t => t.NgayDang)
                                 .ToListAsync();
        }

        // HÀM 2: Lấy Chi tiết
        [HttpGet("{id}")]
        public async Task<ActionResult<TinTuc>> GetTinTuc(int id)
        {
            var tinTuc = await _context.TinTucs.FindAsync(id);
            if (tinTuc == null) return NotFound();
            return tinTuc;
        }

        // HÀM 3: TẠO MỚI (NÂNG CẤP: CÓ UPLOAD ẢNH)
        [HttpPost]
        public async Task<ActionResult<TinTuc>> PostTinTuc([FromForm] TinTuc tinTuc, [FromForm] IFormFile? fileHinhAnh)
        {
            // 1. Xử lý Upload ảnh (Nếu Admin có chọn ảnh)
            if (fileHinhAnh != null && fileHinhAnh.Length > 0)
            {
                // Tạo tên file không trùng: news_abc123.jpg
                string extension = Path.GetExtension(fileHinhAnh.FileName);
                string fileName = $"news_{Guid.NewGuid()}{extension}";

                // Đường dẫn lưu: wwwroot/uploads/news
                string uploadFolder = Path.Combine(_env.WebRootPath, "uploads", "news");

                // Nếu thư mục chưa có thì tự tạo
                if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

                string filePath = Path.Combine(uploadFolder, fileName);

                // Lưu file vào ổ cứng Server
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await fileHinhAnh.CopyToAsync(stream);
                }

                // Lưu đường dẫn web vào Database
                string baseUrl = $"{Request.Scheme}://{Request.Host}";
                tinTuc.HinhAnhUrl = $"{baseUrl}/uploads/news/{fileName}";
            }
            else
            {
                // Nếu không chọn ảnh, dùng ảnh mặc định
                if (string.IsNullOrEmpty(tinTuc.HinhAnhUrl))
                {
                    tinTuc.HinhAnhUrl = "images/banner1.jpg";
                }
            }

            // 2. Cập nhật ngày đăng hiện tại
            tinTuc.NgayDang = DateTime.Now;

            // 3. Lưu vào Database
            _context.TinTucs.Add(tinTuc);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTinTuc), new { id = tinTuc.Id }, tinTuc);
        }

        // HÀM 4: CẬP NHẬT
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTinTuc(int id, TinTuc tinTuc)
        {
            if (id != tinTuc.Id) return BadRequest();

            _context.Entry(tinTuc).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TinTucExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // HÀM 5: XÓA
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTinTuc(int id)
        {
            if (_context.TinTucs == null) return NotFound();

            var tinTuc = await _context.TinTucs.FindAsync(id);
            if (tinTuc == null) return NotFound();

            _context.TinTucs.Remove(tinTuc);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TinTucExists(int id)
        {
            return (_context.TinTucs?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}