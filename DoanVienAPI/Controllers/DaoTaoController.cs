using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DaoTaoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DaoTaoController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- PHẦN TÀI LIỆU ---
        [HttpGet("TaiLieu")]
        public async Task<ActionResult<IEnumerable<TaiLieu>>> GetTaiLieus()
        {
            return await _context.TaiLieus.ToListAsync();
        }

        [HttpPost("TaiLieu")]
        public async Task<IActionResult> AddTaiLieu(TaiLieu tailieu)
        {
            _context.TaiLieus.Add(tailieu);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã thêm tài liệu!" });
        }

        [HttpDelete("TaiLieu/{id}")]
        public async Task<IActionResult> DeleteTaiLieu(int id)
        {
            var item = await _context.TaiLieus.FindAsync(id);
            if (item == null) return NotFound();
            _context.TaiLieus.Remove(item);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // --- PHẦN FAQ (HỎI ĐÁP) ---
        [HttpGet("FAQ")]
        public async Task<ActionResult<IEnumerable<FAQ>>> GetFAQs()
        {
            return await _context.FAQs.ToListAsync();
        }

        [HttpPost("FAQ")]
        public async Task<IActionResult> AddFAQ(FAQ faq)
        {
            _context.FAQs.Add(faq);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã thêm câu hỏi!" });
        }

        [HttpDelete("FAQ/{id}")]
        public async Task<IActionResult> DeleteFAQ(int id)
        {
            var item = await _context.FAQs.FindAsync(id);
            if (item == null) return NotFound();
            _context.FAQs.Remove(item);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}