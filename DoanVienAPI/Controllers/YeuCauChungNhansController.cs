using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class YeuCauChungNhansController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public YeuCauChungNhansController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- 1. API: SINH VIÊN NỘP ĐƠN (GIỮ NGUYÊN CỦA BẠN) ---
        [HttpPost]
        public async Task<ActionResult<YeuCauChungNhan>> NopDon(YeuCauChungNhan yeuCau)
        {
            if (string.IsNullOrEmpty(yeuCau.MSSV)) return BadRequest("Thiếu mã số sinh viên!");

            yeuCau.NgayGui = DateTime.Now;
            yeuCau.TrangThai = "ChoDuyet";

            if (string.IsNullOrEmpty(yeuCau.TenHoatDong))
            {
                yeuCau.TenHoatDong = "Xét duyệt Sinh viên 5 Tốt";
                yeuCau.LoaiChungNhan = "DanhHieu"; // Mặc định là danh hiệu
            }

            _context.YeuCauChungNhans.Add(yeuCau);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Nộp đơn thành công!", data = yeuCau });
        }

        // --- 2. API: ADMIN DUYỆT ĐƠN (BỔ SUNG CÁI NÀY ĐỂ FIX LỖI) ---
        // POST: api/YeuCauChungNhans/Duyet/5
        [HttpPost("Duyet/{id}")]
        public async Task<IActionResult> DuyetDon(int id)
        {
            // A. Tìm yêu cầu trong Database
            var yeuCau = await _context.YeuCauChungNhans.FindAsync(id);
            if (yeuCau == null) return NotFound("Không tìm thấy yêu cầu này.");

            // B. Cập nhật trạng thái thành Đã Duyệt
            yeuCau.TrangThai = "DaDuyet";

            // C. Tự động tạo Chứng nhận (Để hiện trong Ví)
            var chungNhan = new ChungNhan
            {
                MSSV = yeuCau.MSSV,
                TenSinhVien = yeuCau.TenSinhVien,
                TenHoatDong = yeuCau.TenHoatDong,
                NgayCap = DateTime.Now,
                MaXacThuc = "SV5T-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                Loai = "DanhHieu"
            };
            _context.ChungNhans.Add(chungNhan);

            // D. 👇 QUAN TRỌNG: TỰ ĐỘNG THÊM VÀO BẢNG DANH HIỆU (Để hiện trong Sổ tay)
            if (yeuCau.LoaiChungNhan == "DanhHieu" || yeuCau.TenHoatDong.Contains("Sinh viên 5 Tốt"))
            {
                // Tìm thông tin sinh viên để lấy ID (Vì bảng DanhHieu thường liên kết theo ID)
                var sv = await _context.DoanViens.FirstOrDefaultAsync(x => x.MSSV == yeuCau.MSSV);

                if (sv != null)
                {
                    // Kiểm tra xem đã có danh hiệu này chưa để tránh trùng
                    bool daCoDanhHieu = await _context.DanhHieus.AnyAsync(d => d.SinhVienId == sv.Id && d.TenDanhHieu == "Sinh viên 5 Tốt");

                    if (!daCoDanhHieu)
                    {
                        var danhHieuMoi = new DanhHieu
                        {
                            SinhVienId = sv.Id,          // Link với sinh viên
                            TenDanhHieu = "Sinh viên 5 Tốt",
                            NamHoc = "2024-2025",        // Có thể lấy động theo năm hiện tại
                            NgayDat = DateTime.Now,
                            Icon = "medal",              // Icon mặc định
                            Color = "yellow"             // Màu mặc định
                        };
                        _context.DanhHieus.Add(danhHieuMoi);
                    }
                }
            }

            // E. Lưu tất cả thay đổi vào Database
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã duyệt đơn và cấp danh hiệu thành công!" });
        }
    }
}