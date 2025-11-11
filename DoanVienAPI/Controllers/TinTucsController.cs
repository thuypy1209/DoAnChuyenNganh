using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TinTucsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TinTucsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // HÀM 1: Lấy Danh sách (GET /api/TinTucs)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TinTuc>>> GetTinTucs()
        {
            if (_context.TinTucs == null)
            {
                return NotFound("Entity set 'ApplicationDbContext.TinTucs' is null.");
            }
            return await _context.TinTucs.ToListAsync();
        }

        // HÀM 2: LẤY CHI TIẾT THEO ID (GET /api/TinTucs/{id}) - ĐÃ FIX LỖI 404
        [HttpGet("{id}")]
        public async Task<ActionResult<TinTuc>> GetTinTuc(int id)
        {
            if (_context.TinTucs == null)
            {
                return NotFound($"Entity set 'ApplicationDbContext.TinTucs' is null.");
            }

            // FIX LỖI CACHE: Buộc EF Core bỏ qua bộ nhớ đệm và truy vấn trực tiếp vào DB
            var tinTuc = await _context.TinTucs
                .AsNoTracking() // DÒNG CODE QUAN TRỌNG ĐỂ FIX LỖI CACHE 404
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tinTuc == null)
            {
                return NotFound($"Bài viết ID={id} không có trong Cơ sở dữ liệu.");
            }

            return tinTuc;
        }

        // HÀM 3: TẠO MỚI (POST /api/TinTucs)
        [HttpPost]
        public async Task<ActionResult<TinTuc>> PostTinTuc(TinTuc tinTuc)
        {
            if (_context.TinTucs == null)
            {
                return Problem("Entity set 'ApplicationDbContext.TinTucs' is null.");
            }

            if (tinTuc.NgayDang == default(DateTime))
            {
                tinTuc.NgayDang = DateTime.Now;
            }

            _context.TinTucs.Add(tinTuc);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTinTuc), new { id = tinTuc.Id }, tinTuc);
        }

        // HÀM 4: CẬP NHẬT (PUT /api/TinTucs/{id})
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTinTuc(int id, TinTuc tinTuc)
        {
            if (id != tinTuc.Id)
            {
                return BadRequest("ID trong URL không khớp với ID của tin tức trong body.");
            }

            _context.Entry(tinTuc).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TinTucExists(id))
                {
                    return NotFound("Tin tức không tồn tại để cập nhật.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // HÀM 5: XÓA (DELETE /api/TinTucs/{id})
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTinTuc(int id)
        {
            if (_context.TinTucs == null)
            {
                return NotFound("Entity set 'ApplicationDbContext.TinTucs' is null.");
            }
            // Dùng FirstOrDefaultAsync để tìm kiếm mạnh mẽ hơn FindAsync
            var tinTuc = await _context.TinTucs.FirstOrDefaultAsync(t => t.Id == id);

            if (tinTuc == null)
            {
                return NotFound("Tin tức không tồn tại để xóa.");
            }

            _context.TinTucs.Remove(tinTuc);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Hàm hỗ trợ (private)
        private bool TinTucExists(int id)
        {
            return (_context.TinTucs?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}