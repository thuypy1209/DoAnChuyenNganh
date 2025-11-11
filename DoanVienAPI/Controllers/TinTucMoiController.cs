using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System.Threading.Tasks;
using System.Linq;

[Route("api/TinTucMoi")] // ĐƯỜNG DẪN MỚI
[ApiController]
public class TinTucMoiController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TinTucMoiController(ApplicationDbContext context)
    {
        _context = context;
    }

    // HÀM LẤY CHI TIẾT THEO ID (Sử dụng đường dẫn API hoàn toàn mới)
    // GET /api/TinTucMoi/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TinTuc>> GetTinTucMoi(int id)
    {
        if (_context.TinTucs == null)
        {
            return NotFound($"Entity set 'TinTucs' is null.");
        }

        // SỬ DỤNG PHƯƠNG PHÁP TÌM KIẾM MỚI MẠNH MẼ VÀ BỎ QUA CACHE
        var tinTuc = await _context.TinTucs
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tinTuc == null)
        {
            return NotFound($"Mã lỗi 404: Bài viết ID={id} không có trong cơ sở dữ liệu.");
        }

        return tinTuc;
    }
}