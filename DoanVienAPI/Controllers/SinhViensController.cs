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
    public class SinhViensController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SinhViensController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. LẤY DANH SÁCH SINH VIÊN (Kèm Điểm Rèn Luyện)
        // GET: api/SinhViens?khoa=CNTT&lop=22DTHC1
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetSinhViens(string khoa = "", string lop = "", string keyword = "")
        {
            var query = _context.DoanViens.AsQueryable();

            if (!string.IsNullOrEmpty(khoa)) query = query.Where(s => s.Khoa == khoa);
            if (!string.IsNullOrEmpty(lop)) query = query.Where(s => s.Lop == lop);
            if (!string.IsNullOrEmpty(keyword)) query = query.Where(s => s.HoTen.Contains(keyword) || s.MSSV.Contains(keyword));

            var sinhViens = await query.ToListAsync();
            var result = new List<object>();

            foreach (var sv in sinhViens)
            {
                // SỬA: Lấy điểm mới nhất từ bảng BangDiems
                var diemRecord = await _context.BangDiems
                    .Where(b => b.MaSoSinhVien == sv.MSSV)
                    .OrderByDescending(b => b.NgayCapNhat) // Lấy học kỳ mới nhất
                    .FirstOrDefaultAsync();

                double diemRenLuyen = diemRecord != null ? diemRecord.Diem : 0; // Nếu có điểm thì lấy, ko thì bằng 0

                // Xếp loại
                string xepLoai = "Trung bình";
                if (diemRenLuyen >= 90) xepLoai = "Xuất sắc";
                else if (diemRenLuyen >= 80) xepLoai = "Giỏi";
                else if (diemRenLuyen >= 65) xepLoai = "Khá";

                result.Add(new
                {
                    sv.Id,
                    sv.MSSV,
                    sv.HoTen,
                    sv.Lop,
                    sv.Khoa,
                    DiemRenLuyen = diemRenLuyen,
                    XepLoai = xepLoai,
                    DatSV5T = diemRenLuyen >= 80
                });
            }

            return Ok(result.OrderByDescending(s => s.GetType().GetProperty("DiemRenLuyen").GetValue(s, null)));
        }

        // 2. LẤY CHI TIẾT SINH VIÊN (Để xem hồ sơ) -> API này Frontend đang gọi
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetSinhVienDetail(int id)
        {
            var sv = await _context.DoanViens.FindAsync(id);
            if (sv == null) return NotFound();

            // --- PHẦN 1: LẤY ĐIỂM TỔNG KẾT (QUAN TRỌNG) ---
            // Chúng ta lấy điểm từ bảng BangDiems (nơi chứa con số 85, 90)
            var bangDiemMoiNhat = await _context.BangDiems
                .Where(b => b.MaSoSinhVien == sv.MSSV)
                .OrderByDescending(b => b.NgayCapNhat)
                .FirstOrDefaultAsync();

            double diemTongKet = bangDiemMoiNhat != null ? bangDiemMoiNhat.Diem : 0;

            // --- PHẦN 2: LẤY LỊCH SỬ HOẠT ĐỘNG (Giữ nguyên logic cũ) ---
            // Lưu ý: Có thể cần kiểm tra lại quan hệ MSSV vs Id trong DangKyHoatDongs sau này
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

            // --- PHẦN 3: TÍNH ĐIỂM THÀNH PHẦN ---
            var diemChiTiet = lichSu.Where(d => d.TrangThaiDuyet == "DaDuyet")
                                    .GroupBy(d => d.TieuChiSV5T)
                                    .Select(g => new { TieuChi = g.Key, Diem = g.Sum(x => x.DiemRenLuyen) });

            // TRẢ VỀ KẾT QUẢ CHO FRONTEND
            return Ok(new
            {
                ThongTin = sv,
                LichSu = lichSu,
                DiemThanhPhan = diemChiTiet,

                // QUAN TRỌNG: Trả về DiemRenLuyen lấy từ Bảng Điểm
                DiemRenLuyen = diemTongKet,
                TongDiem = diemTongKet // Để dự phòng cho các logic JS cũ
            });
        }

        // 3. API LẤY DANH SÁCH ĐẠT CHUẨN
        [HttpGet("DatChuan")]
        public async Task<ActionResult<IEnumerable<object>>> GetSinhVienDatChuan()
        {
            var sinhViens = await _context.DoanViens.ToListAsync();
            var result = new List<object>();

            foreach (var sv in sinhViens)
            {
                // Lấy điểm từ Bảng điểm
                var diemRecord = await _context.BangDiems
                    .Where(b => b.MaSoSinhVien == sv.MSSV)
                    .OrderByDescending(b => b.NgayCapNhat)
                    .FirstOrDefaultAsync();

                double diem = diemRecord != null ? diemRecord.Diem : 0;

                if (diem >= 80)
                {
                    result.Add(new
                    {
                        sv.Id,
                        sv.MSSV,
                        sv.HoTen,
                        sv.Lop,
                        DiemRenLuyen = diem,
                        XepLoai = diem >= 90 ? "Xuất sắc" : "Giỏi"
                    });
                }
            }
            return Ok(result.OrderByDescending(s => s.GetType().GetProperty("DiemRenLuyen").GetValue(s, null)));
        }

        // 4. API CẤP DANH HIỆU HÀNG LOẠT (Giữ nguyên)
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

                var chungNhan = new ChungNhan
                {
                    TenHoatDong = request.TenDanhHieu,
                    TenSinhVien = sv.HoTen,
                    MSSV = sv.MSSV,
                    NgayCap = System.DateTime.Now,
                    MaXacThuc = $"CERT-{System.DateTime.Now.Year}-{System.Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}"
                };

                _context.ChungNhans.Add(chungNhan);
                count++;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Đã cấp thành công {count} chứng nhận!" });
        }

        public class CapDanhHieuRequest
        {
            public List<string> DanhSachMSSV { get; set; }
            public string TenDanhHieu { get; set; }
        }
    }
}