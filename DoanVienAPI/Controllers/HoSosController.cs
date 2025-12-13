using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.IO; // Thêm để làm việc với Path
using Microsoft.AspNetCore.Http; // Thêm để làm việc với IFormFile
using Microsoft.AspNetCore.Hosting; // Thêm để inject IWebHostEnvironment

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoSosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _hostingEnvironment; // Để lấy đường dẫn thư mục wwwroot

        public HoSosController(ApplicationDbContext context, IWebHostEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        // GET: api/HoSos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HoSoBaoCao>>> GetHoSos()
        {
            if (_context.HoSos == null)
            {
                return NotFound("Entity set 'ApplicationDbContext.HoSos' is null.");
            }
            return await _context.HoSos.ToListAsync();
        }

        // GET: api/HoSos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HoSoBaoCao>> GetHoSo(int id)
        {
            if (_context.HoSos == null)
            {
                return NotFound();
            }
            var hoSo = await _context.HoSos.FindAsync(id);

            if (hoSo == null)
            {
                return NotFound();
            }

            return hoSo;
        }

        // PUT: api/HoSos/5 (Cập nhật hồ sơ và có thể cập nhật tệp mới)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHoSo(int id, [FromForm] HoSoBaoCao hoSo, IFormFile? file) // [FromForm] để nhận dữ liệu từ FormData
        {
            if (id != hoSo.Id)
            {
                return BadRequest("ID trong URL không khớp với ID của hồ sơ trong body.");
            }

            // Kiểm tra nếu có tệp mới được tải lên
            if (file != null && file.Length > 0)
            {
                // Xóa tệp cũ nếu có (chỉ khi có đường dẫn tệp cũ)
                if (!string.IsNullOrEmpty(hoSo.DuongDanTep))
                {
                    var oldFilePath = Path.Combine(_hostingEnvironment.WebRootPath, hoSo.DuongDanTep.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                // Lưu tệp mới
                var uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                hoSo.DuongDanTep = "/uploads/" + uniqueFileName; // Lưu đường dẫn tương đối
            }
            // Nếu không có file mới được upload, nhưng đang sửa và DuongDanTep truyền vào là null/empty
            else if (string.IsNullOrEmpty(hoSo.DuongDanTep) && HoSoExists(id))
            {
                // Lấy DuongDanTep cũ từ database để tránh bị null nếu người dùng không upload file mới
                var existingHoSo = await _context.HoSos.AsNoTracking().FirstOrDefaultAsync(h => h.Id == id);
                if (existingHoSo != null)
                {
                    hoSo.DuongDanTep = existingHoSo.DuongDanTep;
                }
            }


            hoSo.NgayCapNhat = DateTime.Now; // Cập nhật ngày cập nhật khi sửa

            _context.Entry(hoSo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HoSoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/HoSos (Thêm hồ sơ và tải tệp lên)
        [HttpPost]
        public async Task<ActionResult<HoSoBaoCao>> PostHoSo([FromForm] HoSoBaoCao hoSo, IFormFile? file)
        {
            if (_context.HoSos == null)
            {
                return Problem("Entity set 'ApplicationDbContext.HoSos' is null.");
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest("Vui lòng tải lên một tệp tin.");
            }

            // 1. Chuẩn bị thư mục
            var uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 👇👇👇 SỬA QUAN TRỌNG Ở ĐÂY 👇👇👇
            // Lấy đuôi file (vd: .pdf)
            var extension = Path.GetExtension(file.FileName);

            // Đặt tên mới: Chỉ gồm mã số + đuôi (KHÔNG DÙNG TÊN TIẾNG VIỆT CŨ NỮA)
            var uniqueFileName = $"file_{Guid.NewGuid()}{extension}";
            // 👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆

            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Lưu thông tin vào DB
            hoSo.DuongDanTep = $"/uploads/{uniqueFileName}"; // Lưu đường dẫn
            hoSo.NgayNop = DateTime.Now;
            hoSo.NgayTao = DateTime.Now;
            hoSo.NgayCapNhat = DateTime.Now;

            // Đảm bảo trạng thái
            if (string.IsNullOrEmpty(hoSo.TrangThai)) hoSo.TrangThai = "ChoDuyet";

            _context.HoSos.Add(hoSo);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetHoSo", new { id = hoSo.Id }, hoSo);
        }

        // DELETE: api/HoSos/5 (Xóa hồ sơ và xóa cả tệp trên server)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHoSo(int id)
        {
            if (_context.HoSos == null)
            {
                return NotFound();
            }
            var hoSo = await _context.HoSos.FindAsync(id);
            if (hoSo == null)
            {
                return NotFound();
            }

            // Xóa tệp khỏi thư mục wwwroot/uploads
            if (!string.IsNullOrEmpty(hoSo.DuongDanTep))
            {
                var filePath = Path.Combine(_hostingEnvironment.WebRootPath, hoSo.DuongDanTep.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.HoSos.Remove(hoSo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HoSoExists(int id)
        {
            return (_context.HoSos?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}