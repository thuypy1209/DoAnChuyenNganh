using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace DoanVienAPI.Controllers
{
    [Route("api/QuanLySinhVien")]
    [ApiController]
    [Authorize]
    public class SinhViensController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SinhViensController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. LẤY DANH SÁCH SINH VIÊN
        [HttpGet]
        public async Task<IActionResult> GetSinhViens(string khoa = "", string lop = "", string keyword = "")
        {
            try
            {
                var query = _context.DoanViens.AsQueryable();

                if (!string.IsNullOrEmpty(khoa) && khoa != "undefined") query = query.Where(s => s.Khoa == khoa);
                if (!string.IsNullOrEmpty(lop) && lop != "undefined") query = query.Where(s => s.Lop == lop);
                if (!string.IsNullOrEmpty(keyword))
                    query = query.Where(s => s.HoTen.Contains(keyword) || s.MSSV.Contains(keyword));

                var sinhViens = await query.ToListAsync();
                var result = new List<SinhVienDisplayModel>();

                var tatCaDiem = await _context.DangKyHoatDongs
                    .Include(d => d.HoatDong)
                    .Where(d => d.TrangThaiDuyet == "DaDuyet")
                    .GroupBy(d => d.MSSV)
                    .Select(g => new {
                        MSSV = g.Key,
                        TongDiem = g.Sum(x => x.HoatDong.DiemRenLuyen)
                    })
                    .ToListAsync();

                foreach (var sv in sinhViens)
                {
                    var diemRecord = tatCaDiem.FirstOrDefault(x => x.MSSV == sv.MSSV);
                    double diemRL = diemRecord != null ? diemRecord.TongDiem : 0;

                    string xl = "Yếu";
                    if (diemRL >= 90) xl = "Xuất sắc";
                    else if (diemRL >= 80) xl = "Giỏi";
                    else if (diemRL >= 65) xl = "Khá";
                    else if (diemRL >= 50) xl = "Trung bình";

                    result.Add(new SinhVienDisplayModel
                    {
                        Id = sv.Id,
                        MSSV = sv.MSSV,
                        HoTen = sv.HoTen,
                        Lop = sv.Lop,
                        Khoa = sv.Khoa,
                        DiemRenLuyen = diemRL,
                        XepLoai = xl,
                        DatSV5T = diemRL >= 80
                    });
                }

                return Ok(result.OrderByDescending(x => x.DiemRenLuyen).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // 2. LẤY CHI TIẾT (Đã sửa để lấy thêm danh hiệu)
        [HttpGet("GetByMssv/{mssv}")]
        public async Task<ActionResult<object>> GetByMssv(string mssv)
        {
            var sv = await _context.DoanViens.FirstOrDefaultAsync(s => s.MSSV == mssv);
            if (sv == null) return NotFound(new { message = "Không tìm thấy sinh viên." });

            // Lấy lịch sử hoạt động
            var lichSu = await _context.DangKyHoatDongs
                .Where(d => d.MSSV == sv.MSSV)
                .Include(d => d.HoatDong)
                .OrderByDescending(d => d.NgayDangKy)
                .Select(d => new {
                    d.HoatDong.TenHoatDong,
                    d.HoatDong.NgayBatDau,
                    d.HoatDong.DiemRenLuyen,
                    d.HoatDong.TieuChiSV5T,
                    d.TrangThaiDuyet
                })
                .ToListAsync();

            // --- ĐOẠN THÊM MỚI: Lấy danh sách danh hiệu từ bảng ChungNhans ---
            var danhHieu = await _context.ChungNhans
                .Where(c => c.MSSV == mssv)
                .Select(c => new {
                    TenChungNhan = c.TenHoatDong, // Khớp với tên biến ở file js/homeDashboard.js
                    NgayCap = c.NgayCap
                })
                .ToListAsync();

            double tongDiemThucTe = lichSu
                .Where(d => d.TrangThaiDuyet == "DaDuyet")
                .Sum(d => d.DiemRenLuyen);

            var diemTieuChi = lichSu
                .Where(d => d.TrangThaiDuyet == "DaDuyet")
                .GroupBy(d => d.TieuChiSV5T)
                .Select(g => new {
                    name = g.Key,
                    score = g.Sum(x => x.DiemRenLuyen),
                    max = 20
                }).ToList();

            return Ok(new
            {
                ThongTin = sv,
                LichSu = lichSu,
                TieuChi = diemTieuChi,
                DiemRenLuyen = tongDiemThucTe,
                TongDiem = tongDiemThucTe,
                DanhHieu = danhHieu // Trả thêm mảng này về cho Frontend vẽ
            });
        }

        // 3. LẤY DANH SÁCH ĐẠT CHUẨN
        [HttpGet("DatChuan")]
        public async Task<IActionResult> GetSinhVienDatChuan()
        {
            try
            {
                var sinhVienDuDiem = await _context.DangKyHoatDongs
                    .Include(d => d.HoatDong)
                    .Where(d => d.TrangThaiDuyet == "DaDuyet")
                    .GroupBy(d => d.MSSV)
                    .Select(g => new {
                        MSSV = g.Key,
                        TongDiem = g.Sum(x => x.HoatDong.DiemRenLuyen)
                    })
                    .Where(x => x.TongDiem >= 80)
                    .ToListAsync();

                var listMSSV = sinhVienDuDiem.Select(x => x.MSSV).ToList();
                var thongTinSV = await _context.DoanViens
                    .Where(s => listMSSV.Contains(s.MSSV))
                    .ToListAsync();

                var result = new List<SinhVienDisplayModel>();

                foreach (var item in sinhVienDuDiem)
                {
                    var sv = thongTinSV.FirstOrDefault(s => s.MSSV == item.MSSV);
                    if (sv != null)
                    {
                        result.Add(new SinhVienDisplayModel
                        {
                            Id = sv.Id,
                            MSSV = sv.MSSV,
                            HoTen = sv.HoTen,
                            Lop = sv.Lop,
                            Khoa = sv.Khoa,
                            DiemRenLuyen = item.TongDiem,
                            XepLoai = item.TongDiem >= 90 ? "Xuất sắc" : "Giỏi"
                        });
                    }
                }

                return Ok(result.OrderByDescending(s => s.DiemRenLuyen));
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }

        // 4. CẤP DANH HIỆU
        [HttpPost("CapDanhHieu")]
        public async Task<IActionResult> CapDanhHieuHangLoat([FromBody] CapDanhHieuRequest request)
        {
            if (request.DanhSachMSSV == null || request.DanhSachMSSV.Count == 0)
                return BadRequest("Chưa chọn sinh viên nào.");

            int count = 0;
            foreach (var mssv in request.DanhSachMSSV)
            {
                var sv = await _context.DoanViens.FirstOrDefaultAsync(s => s.MSSV == mssv);
                if (sv == null) continue;

                var namNay = DateTime.Now.Year;
                var daCap = await _context.ChungNhans.AnyAsync(c =>
                    c.MSSV == mssv &&
                    c.TenHoatDong == request.TenDanhHieu &&
                    c.NgayCap.Year == namNay);

                if (!daCap)
                {
                    var chungNhan = new ChungNhan
                    {
                        TenHoatDong = request.TenDanhHieu,
                        TenSinhVien = sv.HoTen,
                        MSSV = sv.MSSV,
                        NgayCap = DateTime.Now,
                        MaXacThuc = $"CERT-{DateTime.Now.Year}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}"
                    };

                    _context.ChungNhans.Add(chungNhan);
                    count++;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã cấp thành công {count} chứng nhận mới!" });
        }

        // 5. CẬP NHẬT HỒ SƠ
        [HttpPut("UpdateProfile/{mssv}")]
        public async Task<IActionResult> UpdateProfile(string mssv, [FromBody] UpdateProfileRequest request)
        {
            var sv = await _context.DoanViens.FirstOrDefaultAsync(x => x.MSSV == mssv);
            if (sv == null)
            {
                sv = new DoanVien
                {
                    MSSV = mssv,
                    HoTen = "Sinh viên mới",
                    Khoa = "Công nghệ thông tin",
                    Lop = "Chưa cập nhật"
                };
                _context.DoanViens.Add(sv);
            }

            if (request.NgaySinh.HasValue) sv.NgaySinh = request.NgaySinh.Value;
            if (!string.IsNullOrEmpty(request.SoDienThoai)) sv.SoDienThoai = request.SoDienThoai;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật thành công!", data = sv });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi lưu DB: " + ex.Message });
            }
        }

    } // <--- ĐÓNG CONTROLLER TẠI ĐÂY

    // --- CÁC MODEL PHẢI ĐỂ RA NGOÀI ĐÂY ---
    public class SinhVienDisplayModel
    {
        public int Id { get; set; }
        public string MSSV { get; set; }
        public string HoTen { get; set; }
        public string Lop { get; set; }
        public string Khoa { get; set; }
        public double DiemRenLuyen { get; set; }
        public string XepLoai { get; set; }
        public bool DatSV5T { get; set; }
    }

    public class CapDanhHieuRequest
    {
        public List<string> DanhSachMSSV { get; set; }
        public string TenDanhHieu { get; set; }
    }

    public class UpdateProfileRequest
    {
        public DateTime? NgaySinh { get; set; }
        public string SoDienThoai { get; set; }
    }

} // Đóng Namespace