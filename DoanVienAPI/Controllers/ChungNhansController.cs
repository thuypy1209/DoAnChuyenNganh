using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System.Threading.Tasks;
using System.Linq;

[Route("api/[controller]")]
[ApiController]
public class ChungNhansController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ChungNhansController(ApplicationDbContext context)
    {
        _context = context;
    }

    // API TRA CỨU: api/ChungNhans/TraCuu?keyword=...
    // Cho phép tìm bằng MSSV hoặc Mã xác thực
    [HttpGet("TraCuu")]
    public async Task<ActionResult<ChungNhan>> TraCuu(string keyword)
    {
        if (string.IsNullOrEmpty(keyword))
        {
            return BadRequest("Vui lòng nhập từ khóa tìm kiếm.");
        }

        // Tìm trong CSDL xem có ai trùng MSSV hoặc Mã xác thực không
        var chungNhan = await _context.ChungNhans
            .FirstOrDefaultAsync(c => c.MSSV == keyword || c.MaXacThuc == keyword);

        if (chungNhan == null)
        {
            return NotFound("Không tìm thấy chứng nhận nào.");
        }

        return chungNhan;
    }

    // API LẤY DANH SÁCH CHỨNG NHẬN CỦA 1 SINH VIÊN
    // GET: api/ChungNhans/CuaToi?mssv=...
    [HttpGet("CuaToi")]
    public async Task<ActionResult<IEnumerable<ChungNhan>>> GetChungNhanCuaToi(string mssv)
    {
        if (string.IsNullOrEmpty(mssv)) return BadRequest("Thiếu MSSV.");

        var danhSach = await _context.ChungNhans
            .Where(c => c.MSSV == mssv)
            .OrderByDescending(c => c.NgayCap)
            .ToListAsync();

        return Ok(danhSach);
    }

    // --- API NỘP YÊU CẦU CẤP CHỨNG NHẬN ---
    // POST: api/ChungNhans/YeuCau
    [HttpPost("YeuCau")]
    public async Task<IActionResult> GuiYeuCau([FromBody] YeuCauChungNhan yeuCau)
    {
        if (yeuCau == null) return BadRequest("Dữ liệu không hợp lệ.");

        // Gán thời gian và trạng thái mặc định
        yeuCau.NgayGui = DateTime.Now;
        yeuCau.TrangThai = "ChoDuyet";

        _context.YeuCauChungNhans.Add(yeuCau);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã gửi yêu cầu thành công! Vui lòng chờ cán bộ duyệt." });
    }
    // ---------------------------------------------------------
    // PHẦN DÀNH CHO ADMIN - QUẢN LÝ YÊU CẦU CẤP CHỨNG NHẬN
    // ---------------------------------------------------------

    // 1. LẤY DANH SÁCH YÊU CẦU (Lọc theo trạng thái)
    // GET: api/ChungNhans/DanhSachYeuCau?status=ChoDuyet
    [HttpGet("DanhSachYeuCau")]
    public async Task<ActionResult<IEnumerable<YeuCauChungNhan>>> GetDanhSachYeuCau(string status = "ChoDuyet")
    {
        var list = await _context.YeuCauChungNhans
            .Where(y => y.TrangThai == status)
            .OrderByDescending(y => y.NgayGui)
            .ToListAsync();
        return Ok(list);
    }

    // 2. DUYỆT YÊU CẦU -> TẠO CHỨNG NHẬN THẬT
    // POST: api/ChungNhans/Duyet/{id}
    [HttpPost("Duyet/{id}")]
    public async Task<IActionResult> DuyetYeuCau(int id)
    {
        // Tìm đơn yêu cầu
        var yeuCau = await _context.YeuCauChungNhans.FindAsync(id);
        if (yeuCau == null) return NotFound("Không tìm thấy yêu cầu.");

        if (yeuCau.TrangThai == "DaDuyet") return BadRequest("Yêu cầu này đã được duyệt rồi.");

        // 1. Cập nhật trạng thái đơn
        yeuCau.TrangThai = "DaDuyet";

        // 2. TẠO CHỨNG NHẬN MỚI (Copy dữ liệu sang bảng ChungNhans)
        var chungNhanMoi = new ChungNhan
        {
            TenHoatDong = yeuCau.TenHoatDong,
            TenSinhVien = yeuCau.TenSinhVien ?? "Sinh viên",
            MSSV = yeuCau.MSSV,
            NgayCap = DateTime.Now,
            // Tạo mã xác thực ngẫu nhiên
            MaXacThuc = $"CERT-{DateTime.Now.Year}-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}"
        };

        _context.ChungNhans.Add(chungNhanMoi);

        // Lưu cả 2 thay đổi cùng lúc
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã duyệt và cấp chứng nhận thành công!", maXacThuc = chungNhanMoi.MaXacThuc });
    }

    // 3. TỪ CHỐI YÊU CẦU
    // POST: api/ChungNhans/TuChoi/{id}
    [HttpPost("TuChoi/{id}")]
    public async Task<IActionResult> TuChoiYeuCau(int id)
    {
        var yeuCau = await _context.YeuCauChungNhans.FindAsync(id);
        if (yeuCau == null) return NotFound();

        yeuCau.TrangThai = "TuChoi";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã từ chối yêu cầu." });
    }
}