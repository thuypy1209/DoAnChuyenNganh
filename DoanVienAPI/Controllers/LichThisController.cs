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
    public class LichThisController : ControllerBase // <--- ĐÃ ĐỔI TÊN CLASS Ở ĐÂY
    {
        private readonly ApplicationDbContext _context;

        public LichThisController(ApplicationDbContext context) // <--- ĐÃ ĐỔI TÊN CONSTRUCTOR Ở ĐÂY
        {
            _context = context;
        }

        // Các hàm bên dưới (Get, Post, Put, Delete) KHÔNG THAY ĐỔI nội dung,
        // chỉ có tên class và constructor là đổi.

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LichThi>>> GetLichThis()
        {
            if (_context.LichThis == null)
            {
                return NotFound("Entity set 'ApplicationDbContext.LichThis' is null.");
            }
            return await _context.LichThis.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LichThi>> GetLichThi(int id)
        {
            if (_context.LichThis == null)
            {
                return NotFound();
            }
            var lichThi = await _context.LichThis.FindAsync(id);

            if (lichThi == null)
            {
                return NotFound();
            }

            return lichThi;
        }

        [HttpPost]
        public async Task<ActionResult<LichThi>> PostLichThi(LichThi lichThi)
        {
            if (_context.LichThis == null)
            {
                return Problem("Entity set 'ApplicationDbContext.LichThis' is null.");
            }
            
            _context.LichThis.Add(lichThi);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetLichThi), new { id = lichThi.Id }, lichThi);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutLichThi(int id, LichThi lichThi)
        {
            if (id != lichThi.Id)
            {
                return BadRequest("ID trong URL không khớp với ID của lịch thi trong body.");
            }

            _context.Entry(lichThi).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LichThiExists(id))
                {
                    return NotFound("Lịch thi không tồn tại để cập nhật.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent(); 
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLichThi(int id)
        {
            if (_context.LichThis == null)
            {
                return NotFound("Entity set 'ApplicationDbContext.LichThis' is null.");
            }
            var lichThi = await _context.LichThis.FindAsync(id);
            if (lichThi == null)
            {
                return NotFound("Lịch thi không tồn tại để xóa.");
            }

            _context.LichThis.Remove(lichThi);
            await _context.SaveChangesAsync();

            return NoContent(); 
        }

        private bool LichThiExists(int id)
        {
            return (_context.LichThis?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}