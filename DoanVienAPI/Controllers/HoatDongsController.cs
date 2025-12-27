using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using DoanVienAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace DoanVienAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoatDongsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        private readonly IWebHostEnvironment _env;

        public HoatDongsController(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // 1. API LẤY DANH SÁCH HOẠT ĐỘNG (NÂNG CẤP: Hỗ trợ cả Admin và Sinh viên)
        // GET: api/HoatDongs?tab=DangMo (Sinh viên)
        // GET: api/HoatDongs?filter=All (Admin)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetHoatDongs(string tab = "", string filter = "", string keyword = "")
        {
            if (_context.HoatDongs == null) return NotFound();

            var query = _context.HoatDongs.AsQueryable();
            DateTime now = DateTime.Now;

            // 1. Lọc theo từ khóa (Chung cho cả 2)
            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(h => h.TenHoatDong.Contains(keyword) || h.DiaDiem.Contains(keyword));
            }

            // 2. Xử lý logic lọc
            // Ưu tiên filter của Admin trước
            if (!string.IsNullOrEmpty(filter))
            {
                if (filter == "Open") query = query.Where(h => h.NgayKetThuc >= now);
                else if (filter == "Closed") query = query.Where(h => h.NgayKetThuc < now);
                // "All" thì không lọc gì thêm, lấy hết
            }
            // Nếu không có filter Admin thì check tab Sinh viên
            else
            {
                switch (tab)
                {
                    case "SapDienRa":
                        query = query.Where(h => h.NgayBatDau > now);
                        break;
                    case "DaKetThuc":
                        query = query.Where(h => h.NgayKetThuc < now);
                        break;
                    case "DangMo":
                    default:
                        // Mặc định sinh viên chỉ thấy cái đang mở
                        query = query.Where(h => h.TrangThai == "DangMo" && h.NgayKetThuc >= now);
                        break;
                }
            }

            var list = await query.OrderByDescending(h => h.NgayBatDau).ToListAsync();

            // 3. Trả về dữ liệu kèm tính toán % (Quan trọng cho Admin)
            var result = list.Select(h => new
            {
                h.Id,
                h.TenHoatDong,
                h.MoTa,
                h.PosterUrl,
                h.DiaDiem,
                h.NgayBatDau,
                h.NgayKetThuc,
                h.SoLuongToiDa,
                h.SoLuongDaDangKy,
                h.TieuChiSV5T,
                h.DiemRenLuyen,
                h.LoaiHoatDong,
                h.KhoaToChuc,
                h.TrangThai,
                // Tính toán thêm trường PhanTram và TrangThaiHienTai
                PhanTram = h.SoLuongToiDa > 0 ? (int)((double)h.SoLuongDaDangKy / h.SoLuongToiDa * 100) : 0,
                TrangThaiHienTai = h.NgayKetThuc < now ? "KetThuc" : "DangMo"
            });

            return Ok(result);
        }

        // 2. API LẤY CHI TIẾT 1 HOẠT ĐỘNG
        [HttpGet("{id}")]
        public async Task<ActionResult<HoatDong>> GetHoatDong(int id)
        {
            var hoatDong = await _context.HoatDongs.FindAsync(id);
            if (hoatDong == null) return NotFound();
            return hoatDong;
        }

        

        // 4. API XEM "HOẠT ĐỘNG CỦA TÔI"
        [HttpGet("CuaToi")]
        public async Task<ActionResult<IEnumerable<object>>> GetHoatDongCuaToi(string mssv)
        {
            var danhSach = await _context.DangKyHoatDongs
                .Where(d => d.MSSV == mssv)
                .Include(d => d.HoatDong)
                .OrderByDescending(d => d.NgayDangKy)
                .Select(d => new
                {
                    d.Id,
                    d.HoatDong.TenHoatDong,
                    d.HoatDong.NgayBatDau,
                    d.HoatDong.DiaDiem,
                    d.TrangThaiDuyet,
                    d.HoatDong.PosterUrl,
                    d.DaDiemDanh
                })
                .ToListAsync();

            return Ok(danhSach);
        }

        

        // 6. API ĐIỂM DANH BẰNG QR
        [HttpPost("DiemDanhQR")]
        public async Task<IActionResult> DiemDanhQR([FromBody] DiemDanhRequest request)
        {
            var dangKy = await _context.DangKyHoatDongs
                .FirstOrDefaultAsync(d => d.HoatDongId == request.HoatDongId && d.MSSV == request.MSSV);

            if (dangKy == null) return BadRequest("Bạn chưa đăng ký tham gia hoạt động này!");

            if (dangKy.DaDiemDanh) return Ok(new { message = "Bạn đã điểm danh trước đó rồi!" });

            dangKy.DaDiemDanh = true;
            dangKy.ThoiGianDiemDanh = DateTime.Now;
            dangKy.TrangThaiDuyet = "DaDuyet";

            await _context.SaveChangesAsync();
            return Ok(new { message = "Điểm danh thành công! (+Điểm rèn luyện)" });
        }

        // 7. API LẤY DANH SÁCH SINH VIÊN ĐÃ ĐIỂM DANH (Real-time Admin)
        [HttpGet("DanhSachDiemDanh/{hoatDongId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetDanhSachDiemDanh(int hoatDongId)
        {
            var danhSach = await _context.DangKyHoatDongs
                .Where(d => d.HoatDongId == hoatDongId && d.DaDiemDanh == true)
                .OrderByDescending(d => d.ThoiGianDiemDanh)
                .Select(d => new
                {
                    d.TenSinhVien,
                    d.MSSV,
                    ThoiGian = d.ThoiGianDiemDanh.HasValue ? d.ThoiGianDiemDanh.Value.ToString("HH:mm:ss") : ""
                })
                .ToListAsync();

            return Ok(danhSach);
        }

        // 8. API TẠO HOẠT ĐỘNG MỚI (Admin) - PHIÊN BẢN "BẮT TẬN TAY"
        [HttpPost]
        public async Task<ActionResult<HoatDong>> CreateHoatDong([FromForm] HoatDong hoatDong)
        {
            // 1. Tự tay kiểm tra xem có file nào được gửi lên không
            var files = Request.Form.Files; // Lấy danh sách file từ gói hàng

            if (files.Count > 0)
            {
                var filePoster = files[0]; // Lấy file đầu tiên

                if (filePoster.Length > 0)
                {
                    // Tạo tên file ngẫu nhiên
                    string extension = Path.GetExtension(filePoster.FileName);
                    string fileName = $"poster_{Guid.NewGuid()}{extension}";

                    // Đường dẫn lưu: wwwroot/uploads/posters
                    string uploadFolder = Path.Combine(_env.WebRootPath, "uploads", "posters");

                    // Tự tạo thư mục nếu chưa có
                    if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

                    string filePath = Path.Combine(uploadFolder, fileName);

                    // Lưu file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await filePoster.CopyToAsync(stream);
                    }

                    // Tạo link
                    string baseUrl = $"{Request.Scheme}://{Request.Host}";
                    hoatDong.PosterUrl = $"{baseUrl}/uploads/posters/{fileName}";
                }
            }

            // Nếu vẫn chưa có ảnh (do người dùng không chọn), thì lấy ảnh mặc định
            if (string.IsNullOrEmpty(hoatDong.PosterUrl))
            {
                hoatDong.PosterUrl = "images/banner1.jpg";
            }

            // 2. Lưu vào Database
            _context.HoatDongs.Add(hoatDong);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetHoatDong", new { id = hoatDong.Id }, hoatDong);
        }

        // 9. API XÓA HOẠT ĐỘNG (Admin) - ĐÃ SỬA LỖI REFERENCE CONSTRAINT
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHoatDong(int id)
        {
            // 1. Tìm hoạt động cần xóa trong database
            var hoatDong = await _context.HoatDongs.FindAsync(id);

            // Nếu không tìm thấy thì báo lỗi
            if (hoatDong == null) return NotFound();

            // 2. BƯỚC QUAN TRỌNG: Tìm tất cả đơn đăng ký của hoạt động này
            var cacDonDangKyLienQuan = _context.DangKyHoatDongs.Where(d => d.HoatDongId == id);

            // Xóa sạch các đơn đăng ký này trước (Mời người ra khỏi nhà)
            _context.DangKyHoatDongs.RemoveRange(cacDonDangKyLienQuan);

            // 3. Bây giờ mới an toàn để xóa hoạt động (Đập nhà)
            _context.HoatDongs.Remove(hoatDong);

            // 4. Lưu tất cả thay đổi vào Database (Bắt buộc phải có dòng này)
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 10. API LẤY DANH SÁCH ĐĂNG KÝ CỦA 1 HOẠT ĐỘNG (Để Admin duyệt)
        // GET: api/HoatDongs/DanhSachDangKy/{hoatDongId}
        [HttpGet("DanhSachDangKy/{hoatDongId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetDanhSachDangKy(int hoatDongId)
        {
            var danhSach = await _context.DangKyHoatDongs
                .Where(d => d.HoatDongId == hoatDongId)
                .OrderByDescending(d => d.NgayDangKy)
                .Select(d => new
                {
                    d.Id,
                    d.MSSV,
                    d.TenSinhVien,
                    d.NgayDangKy,
                    d.TrangThaiDuyet, // ChoDuyet, DaDuyet, TuChoi
                    d.DaDiemDanh,
                    d.ThoiGianDiemDanh,
                    d.MinhChungUrl
                })
                .ToListAsync();

            return Ok(danhSach);
        }

        // 11. API DUYỆT / TỪ CHỐI ĐĂNG KÝ (NÂNG CẤP: Có lưu lý do)
        // POST: api/HoatDongs/DuyetDangKy
        [HttpPost("DuyetDangKy")]
        public async Task<IActionResult> DuyetDangKy([FromBody] DuyetRequest request)
        {
            var dangKy = await _context.DangKyHoatDongs.FindAsync(request.Id);
            if (dangKy == null) return NotFound("Không tìm thấy đơn đăng ký.");

            // Cập nhật trạng thái
            dangKy.TrangThaiDuyet = request.TrangThai; // "DaDuyet" hoặc "TuChoi"

            // Lưu lý do nếu có
            if (!string.IsNullOrEmpty(request.LyDo))
            {
                dangKy.LyDoTuChoi = request.LyDo;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã cập nhật trạng thái thành công!" });
        }

        // 12. API LẤY TOÀN BỘ DANH SÁCH CHỜ DUYỆT (Của tất cả hoạt động)
        // GET: api/HoatDongs/DanhSachChoDuyet
        [HttpGet("DanhSachChoDuyet")]
        public async Task<ActionResult<IEnumerable<object>>> GetDanhSachChoDuyet()
        {
            var danhSach = await _context.DangKyHoatDongs
                .Where(d => d.TrangThaiDuyet == "ChoDuyet") // Chỉ lấy đơn chưa xử lý
                .Include(d => d.HoatDong)
                .OrderBy(d => d.NgayDangKy) // Đơn cũ nhất hiện lên đầu để duyệt trước
                .Select(d => new
                {
                    d.Id,
                    d.MSSV,
                    d.TenSinhVien,
                    TenHoatDong = d.HoatDong.TenHoatDong,
                    d.NgayDangKy,
                    d.MinhChungUrl
                })
                .ToListAsync();

            return Ok(danhSach);
        }

        // API: ĐĂNG KÝ HOẠT ĐỘNG (KÈM ẢNH MINH CHỨNG)
        // POST: api/HoatDongs/DangKy
        [HttpPost("DangKy")]
        public async Task<IActionResult> DangKy([FromForm] int hoatDongId, [FromForm] string mssv, [FromForm] IFormFile minhChung)
        {
            // 1. Kiểm tra xem Sinh viên và Hoạt động có tồn tại không
            var sv = await _context.DoanViens.FirstOrDefaultAsync(s => s.MSSV == mssv);
            if (sv == null) return BadRequest("Mã số sinh viên không đúng!");

            var hd = await _context.HoatDongs.FindAsync(hoatDongId);
            if (hd == null) return BadRequest("Hoạt động không tồn tại!");

            // 2. Kiểm tra xem đã đăng ký chưa (Tránh spam nút gửi)
            var daDangKy = await _context.DangKyHoatDongs
                .AnyAsync(d => d.MSSV == mssv && d.HoatDongId == hoatDongId);

            if (daDangKy) return BadRequest("Bạn đã đăng ký hoạt động này rồi, đừng tham lam nhé!");

            // 3. Xử lý lưu ảnh minh chứng (Nếu sinh viên có gửi ảnh)
            string minhChungUrl = "";
            if (minhChung != null && minhChung.Length > 0)
            {
                // Tạo tên file độc nhất: mc_Mssv_IdHoatDong_Random.jpg
                string extension = Path.GetExtension(minhChung.FileName);
                string fileName = $"mc_{mssv}_{hoatDongId}_{Guid.NewGuid()}{extension}";

                // Đường dẫn lưu: wwwroot/uploads/minhchung
                string uploadFolder = Path.Combine(_env.WebRootPath, "uploads", "minhchung");

                // Nếu thư mục chưa có thì tự tạo
                if (!Directory.Exists(uploadFolder)) Directory.CreateDirectory(uploadFolder);

                string filePath = Path.Combine(uploadFolder, fileName);

                // Lưu file vào ổ cứng
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await minhChung.CopyToAsync(stream);
                }

                // Tạo đường dẫn web để lưu vào database
                string baseUrl = $"{Request.Scheme}://{Request.Host}";
                minhChungUrl = $"{baseUrl}/uploads/minhchung/{fileName}";
            }

            // 4. Lưu thông tin vào Database
            var donDangKy = new DangKyHoatDong
            {
                HoatDongId = hoatDongId,
                MSSV = mssv,
                TenSinhVien = sv.HoTen,
                NgayDangKy = DateTime.Now,
                TrangThaiDuyet = "ChoDuyet", // Mặc định là chờ duyệt
                MinhChungUrl = minhChungUrl,
                DaDiemDanh = false
            };

            _context.DangKyHoatDongs.Add(donDangKy);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công!", data = donDangKy });
        }
        // API: Lấy danh sách hoạt động sắp diễn ra (để dự báo)
        // GET: api/HoatDongs/SapDienRa
        [HttpGet("SapDienRa")]
        public async Task<ActionResult<IEnumerable<HoatDong>>> GetHoatDongSapDienRa()
        {
            // Lấy các hoạt động có ngày bắt đầu > ngày hiện tại
            var hoatdongs = await _context.HoatDongs
                .Where(h => h.NgayBatDau > DateTime.Now)
                .OrderBy(h => h.NgayBatDau)
                .ToListAsync();

            return Ok(hoatdongs);
        }


        // --- HÀM THỐNG KÊ DASHBOARD (ĐÃ SỬA: CỘNG GỘP CẢ 2 BẢNG) ---
        // GET: api/HoatDongs/ThongKeDashboard
        [HttpGet("ThongKeDashboard")]
        public async Task<ActionResult<object>> GetDashboardStats()
        {
            // 1. Đếm tổng sinh viên (Giả định hoặc đếm thật)
          
            int svCount = await _context.DoanViens.CountAsync();

            // 2. Đếm hoạt động đang mở
            int activeCount = await _context.HoatDongs
                .CountAsync(h => h.TrangThai == "DangMo" && h.NgayKetThuc >= DateTime.Now);

            // 3. Đếm đơn chờ duyệt (Cộng gộp cả Đăng ký hoạt động + Yêu cầu chứng nhận)
            int pending1 = await _context.DangKyHoatDongs.CountAsync(d => d.TrangThaiDuyet == "ChoDuyet");
            int pending2 = await _context.YeuCauChungNhans.CountAsync(y => y.TrangThai == "ChoDuyet");
            int pendingTotal = pending1 + pending2;

            // 4. Đếm chứng nhận ĐÃ CẤP (QUAN TRỌNG: SỬA CHỖ NÀY)

            // Nguồn A: Các hoạt động đã tham gia và được duyệt (Đếm trong bảng DangKyHoatDongs)
            int cert1 = await _context.DangKyHoatDongs.CountAsync(d => d.TrangThaiDuyet == "DaDuyet");

            // Nguồn B: Các yêu cầu cấp chứng nhận (SV5T, Khen thưởng...)
            // Đếm tất cả những cái KHÔNG PHẢI là "ChoDuyet" (tức là đã Xử lý/Đã cấp)
            int cert2 = await _context.YeuCauChungNhans.CountAsync(y => y.TrangThai != "ChoDuyet");

            int certTotal = cert1 + cert2;

            return Ok(new
            {
                SinhVien = svCount,
                DangMo = activeCount,
                ChoDuyet = pendingTotal,
                DaCap = certTotal
            });
        }

        // Class phụ
        public class DuyetRequest
        {
            public int Id { get; set; } // ID của dòng đăng ký
            public string TrangThai { get; set; } // "DaDuyet" hoặc "TuChoi"
            public string? LyDo { get; set; }
        }
    }



    // --- CÁC CLASS PHỤ (DTO) ---
    public class DiemDanhRequest
    {
        public int HoatDongId { get; set; }
        public string MSSV { get; set; }
    }

    public class DangKyRequest
    {
        public int HoatDongId { get; set; }
        public string MSSV { get; set; }
        public string TenSinhVien { get; set; }
        
    }

}