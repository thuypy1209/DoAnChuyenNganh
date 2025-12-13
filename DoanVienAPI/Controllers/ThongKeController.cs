using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThongKeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ThongKeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. THỐNG KÊ TOP KHOA THAM GIA (Bar Chart)
        [HttpGet("TopKhoa")]
        public async Task<ActionResult<IEnumerable<object>>> GetTopKhoa()
        {
            // Join bảng Đăng ký với bảng Đoàn viên để lấy Khoa
            var data = await _context.DangKyHoatDongs
                .Join(_context.DoanViens,
                      dk => dk.MSSV,
                      dv => dv.MSSV,
                      (dk, dv) => new { dv.Khoa })
                .GroupBy(x => x.Khoa)
                .Select(g => new {
                    Khoa = g.Key,
                    SoLuot = g.Count()
                })
                .OrderByDescending(x => x.SoLuot)
                .Take(10) // Lấy top 10
                .ToListAsync();

            return Ok(data);
        }

        // 2. THỐNG KÊ THAM GIA THEO THÁNG (Line Chart/Heatmap)
        [HttpGet("XuHuongThang")]
        public async Task<ActionResult<IEnumerable<object>>> GetXuHuongThang()
        {
            var data = await _context.DangKyHoatDongs
                .GroupBy(x => x.NgayDangKy.Month)
                .Select(g => new {
                    Thang = "Tháng " + g.Key,
                    SoLuot = g.Count()
                })
                .OrderBy(x => x.Thang) // Sắp xếp theo tháng
                .ToListAsync();

            return Ok(data);
        }

        // 3. THỐNG KÊ SV5T (Tỷ lệ & Top Sinh viên)
        [HttpGet("SV5T")]
        public async Task<ActionResult<object>> GetThongKeSV5T()
        {
            var sinhViens = await _context.DoanViens.ToListAsync();
            int totalSV = sinhViens.Count;
            int countCapTruong = 0;
            int countCapThanh = 0;
            var topStudents = new List<object>();

            // Tính điểm từng sinh viên (Logic giống SinhViensController)
            foreach (var sv in sinhViens)
            {
                var diem = await _context.DangKyHoatDongs
                    .Where(d => d.MSSV == sv.MSSV && (d.TrangThaiDuyet == "DaDuyet" || d.DaDiemDanh))
                    .Include(d => d.HoatDong)
                    .SumAsync(d => d.HoatDong.DiemRenLuyen);

                if (diem >= 80) countCapTruong++;
                if (diem >= 90) countCapThanh++;

                if (diem >= 80) // Chỉ lấy top những người đạt chuẩn
                {
                    topStudents.Add(new { sv.HoTen, sv.MSSV, sv.Khoa, Diem = diem });
                }
            }

            // Sắp xếp lấy Top 5 xuất sắc nhất
            topStudents = topStudents.OrderByDescending(s => (int)s.GetType().GetProperty("Diem").GetValue(s, null)).Take(5).ToList();

            return Ok(new
            {
                Total = totalSV,
                DatCapTruong = countCapTruong,
                DatCapThanh = countCapThanh,
                TyLeTruong = totalSV > 0 ? (double)countCapTruong / totalSV * 100 : 0,
                TyLeThanh = totalSV > 0 ? (double)countCapThanh / totalSV * 100 : 0,
                TopSinhVien = topStudents
            });
        }


    }
}