using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System; // Thêm using System; để dùng DateTime

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhMucsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DanhMucsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/DanhMucs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DanhMuc>>> GetDanhMucs()
        {
            if (_context.DanhMucs == null)
            {
                return NotFound("Entity set 'ApplicationDbContext.DanhMucs' is null.");
            }
            return await _context.DanhMucs.ToListAsync();
        }

        // GET: api/DanhMucs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DanhMuc>> GetDanhMuc(int id)
        {
            if (_context.DanhMucs == null)
            {
                return NotFound();
            }
            var danhMuc = await _context.DanhMucs.FindAsync(id);

            if (danhMuc == null)
            {
                return NotFound();
            }

            return danhMuc;
        }

        // PUT: api/DanhMucs/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDanhMuc(int id, DanhMuc danhMuc)
        {
            if (id != danhMuc.Id)
            {
                return BadRequest();
            }

            danhMuc.NgayCapNhat = DateTime.Now; // Cập nhật ngày cập nhật khi sửa

            _context.Entry(danhMuc).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DanhMucExists(id))
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

        // POST: api/DanhMucs
        [HttpPost]
        public async Task<ActionResult<DanhMuc>> PostDanhMuc(DanhMuc danhMuc)
        {
            if (_context.DanhMucs == null)
            {
                return Problem("Entity set 'ApplicationDbContext.DanhMucs' is null.");
            }

            danhMuc.NgayTao = DateTime.Now; // Đặt ngày tạo khi thêm mới
            danhMuc.NgayCapNhat = DateTime.Now; // Đặt ngày cập nhật khi thêm mới

            _context.DanhMucs.Add(danhMuc);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDanhMuc", new { id = danhMuc.Id }, danhMuc);
        }

        // DELETE: api/DanhMucs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDanhMuc(int id)
        {
            if (_context.DanhMucs == null)
            {
                return NotFound();
            }
            var danhMuc = await _context.DanhMucs.FindAsync(id);
            if (danhMuc == null)
            {
                return NotFound();
            }

            _context.DanhMucs.Remove(danhMuc);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DanhMucExists(int id)
        {
            return (_context.DanhMucs?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}