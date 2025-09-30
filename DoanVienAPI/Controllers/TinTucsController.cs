using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data; 
using DoanVienAPI.Models; 
using System; 
using System.Collections.Generic; 
using System.Linq; 

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

        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TinTuc>>> GetTinTucs()
        {
            if (_context.TinTucs == null)
            {
                
                return NotFound("Entity set 'ApplicationDbContext.TinTucs' is null.");
            }
            return await _context.TinTucs.ToListAsync();
        }

        
        [HttpGet("{id}")]
        public async Task<ActionResult<TinTuc>> GetTinTuc(int id)
        {
            if (_context.TinTucs == null)
            {
                return NotFound("Entity set 'ApplicationDbContext.TinTucs' is null.");
            }
            var tinTuc = await _context.TinTucs.FindAsync(id);

            if (tinTuc == null)
            {
                return NotFound(); 
            }

            return tinTuc;
        }

        
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

        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTinTuc(int id) 
        {
            if (_context.TinTucs == null)
            {
                return NotFound("Entity set 'ApplicationDbContext.TinTucs' is null.");
            }
            var tinTuc = await _context.TinTucs.FindAsync(id); 
            if (tinTuc == null)
            {
                return NotFound("Tin tức không tồn tại để xóa."); 
            }

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