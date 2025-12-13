using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models; // Quan trọng: Dòng này giúp nó nhận diện được Model vừa tạo
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoSoYeuCauController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HoSoYeuCauController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. LẤY DANH SÁCH
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HoSoYeuCau>>> GetYeuCaus()
        {
            return await _context.HoSoYeuCaus.OrderByDescending(x => x.Id).ToListAsync();
        }

        // 2. TẠO MỚI
        [HttpPost]
        public async Task<ActionResult<HoSoYeuCau>> CreateYeuCau(HoSoYeuCau yeuCau)
        {
            yeuCau.NgayTao = DateTime.Now;
            yeuCau.TrangThai = "DangMo";
            _context.HoSoYeuCaus.Add(yeuCau);
            await _context.SaveChangesAsync();
            return Ok(yeuCau);
        }

        // 3. XÓA
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteYeuCau(int id)
        {
            var item = await _context.HoSoYeuCaus.FindAsync(id);
            if (item == null) return NotFound();
            _context.HoSoYeuCaus.Remove(item);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}