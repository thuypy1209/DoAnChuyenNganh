using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BangDiemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BangDiemsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/BangDiems
        // Có thể thêm tham số optional để lọc theo MaSoSinhVien
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BangDiem>>> GetBangDiems([FromQuery] string maSoSinhVien = null)
        {
            if (_context.BangDiems == null)
            {
                return NotFound("Entity set 'ApplicationDbContext.BangDiems' is null.");
            }

            IQueryable<BangDiem> query = _context.BangDiems;

            if (!string.IsNullOrEmpty(maSoSinhVien))
            {
                query = query.Where(bd => bd.MaSoSinhVien == maSoSinhVien);
            }
            
            return await query.ToListAsync();
        }

        // GET: api/BangDiems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BangDiem>> GetBangDiem(int id)
        {
            if (_context.BangDiems == null)
            {
                return NotFound();
            }
            var bangDiem = await _context.BangDiems.FindAsync(id);

            if (bangDiem == null)
            {
                return NotFound();
            }

            return bangDiem;
        }

        // PUT: api/BangDiems/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBangDiem(int id, BangDiem bangDiem)
        {
            if (id != bangDiem.Id)
            {
                return BadRequest();
            }
            
            bangDiem.NgayCapNhat = DateTime.Now; // Cập nhật ngày cập nhật khi sửa

            _context.Entry(bangDiem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BangDiemExists(id))
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

        // POST: api/BangDiems
        [HttpPost]
        public async Task<ActionResult<BangDiem>> PostBangDiem(BangDiem bangDiem)
        {
            if (_context.BangDiems == null)
            {
                return Problem("Entity set 'ApplicationDbContext.BangDiems' is null.");
            }

            bangDiem.NgayCapNhat = DateTime.Now; // Đặt ngày cập nhật khi thêm mới

            _context.BangDiems.Add(bangDiem);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetBangDiem", new { id = bangDiem.Id }, bangDiem);
        }

        // DELETE: api/BangDiems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBangDiem(int id)
        {
            if (_context.BangDiems == null)
            {
                return NotFound();
            }
            var bangDiem = await _context.BangDiems.FindAsync(id);
            if (bangDiem == null)
            {
                return NotFound();
            }

            _context.BangDiems.Remove(bangDiem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BangDiemExists(int id)
        {
            return (_context.BangDiems?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}