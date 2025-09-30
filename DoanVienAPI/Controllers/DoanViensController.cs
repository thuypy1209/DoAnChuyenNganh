using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data; 
using DoanVienAPI.Models; 
using System; 
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")] 
    [ApiController]
    public class DoanViensController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DoanViensController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/DoanViens
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoanVien>>> GetDoanViens()
        {
            if (_context.DoanViens == null)
            {
                return NotFound(); 
            }
            return await _context.DoanViens.ToListAsync();
        }

        // THÊM API NÀY ĐỂ TÌM KIẾM THEO MÃ ĐOÀN VIÊN (Mã số sinh viên)
        // Đây là cách định nghĩa đúng để nó xuất hiện trong Swagger
        // GET: api/DoanViens/ByMaSo/{maSoSinhVien}
        [HttpGet("ByMaSo/{maSoSinhVien}")] // SỬA LẠI ĐƯỜNG DẪN NÀY ĐỂ KHỚP
        public async Task<ActionResult<DoanVien>> GetDoanVienByMaSo(string maSoSinhVien)
        {
            if (_context.DoanViens == null)
            {
                return NotFound("Entity set 'ApplicationDbContext.DoanViens' is null.");
            }
            // Tìm đoàn viên theo MaDoanVien
            var doanVien = await _context.DoanViens.FirstOrDefaultAsync(dv => dv.MaDoanVien == maSoSinhVien);

            if (doanVien == null)
            {
                return NotFound($"Không tìm thấy đoàn viên với mã số: {maSoSinhVien}");
            }

            return doanVien;
        }


        // GET: api/DoanViens/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DoanVien>> GetDoanVien(int id)
        {
            if (_context.DoanViens == null)
            {
                return NotFound();
            }
            var doanVien = await _context.DoanViens.FindAsync(id);

            if (doanVien == null)
            {
                return NotFound(); 
            }

            return doanVien; 
        }

        // POST: api/DoanViens
        [HttpPost]
        [Authorize(Policy = "RequireAdminOrDoanKhoa")]
        public async Task<ActionResult<DoanVien>> PostDoanVien(DoanVien doanVien)
        {
            if (_context.DoanViens == null)
            {
                return Problem("Entity set 'ApplicationDbContext.DoanViens' is null.");
            }
            
            if (doanVien.NgayTao == default(DateTime)) 
            {
                doanVien.NgayTao = DateTime.Now;
            }
            
            _context.DoanViens.Add(doanVien); 
            await _context.SaveChangesAsync(); 

           
            return CreatedAtAction(nameof(GetDoanVien), new { id = doanVien.Id }, doanVien);
        }

        // PUT: api/DoanViens/5
        [HttpPut("{id}")]
        
        public async Task<IActionResult> PutDoanVien(int id, DoanVien doanVien)
        {
            if (id != doanVien.Id)
            {
                return BadRequest(); 
            }

            _context.Entry(doanVien).State = EntityState.Modified; 

            try
            {
                await _context.SaveChangesAsync(); 
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DoanVienExists(id))
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

        // DELETE: api/DoanViens/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteDoanVien(int id)
        {
            if (_context.DoanViens == null)
            {
                return NotFound(); 
            }
            
            var doanVien = await _context.DoanViens.FindAsync(id);
            if (doanVien == null)
            {
                return NotFound(); 
            }

            _context.DoanViens.Remove(doanVien); 
            await _context.SaveChangesAsync(); 

            return NoContent();
        }

        private bool DoanVienExists(int id)
        {
            return (_context.DoanViens?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}