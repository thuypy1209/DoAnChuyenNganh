using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System;
using System.Threading.Tasks;

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

        // API: NỘP ĐƠN MỚI
        // POST: api/YeuCauChungNhans
        [HttpPost]
        public async Task<ActionResult<YeuCauChungNhan>> NopDon(YeuCauChungNhan yeuCau)
        {
            // 1. Kiểm tra dữ liệu
            if (string.IsNullOrEmpty(yeuCau.MSSV))
            {
                return BadRequest("Thiếu mã số sinh viên!");
            }

            // 2. Điền tự động các thông tin hệ thống
            yeuCau.NgayGui = DateTime.Now;        // Lấy giờ hiện tại
            yeuCau.TrangThai = "ChoDuyet";        // Mặc định là Chờ duyệt

            // 3. Nếu thiếu tên hoạt động (trường hợp xét SV5T chung chung)
            if (string.IsNullOrEmpty(yeuCau.TenHoatDong))
            {
                yeuCau.TenHoatDong = "Xét duyệt Sinh viên 5 Tốt";
            }

            // 4. Lưu vào Database
            _context.YeuCauChungNhans.Add(yeuCau);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Nộp đơn thành công!", data = yeuCau });
        }
    }
}