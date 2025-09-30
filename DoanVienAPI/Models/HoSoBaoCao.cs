using System.ComponentModel.DataAnnotations;
using System; // Thêm using System; để dùng DateTime

namespace DoanVienAPI.Models
{
    public class HoSoBaoCao
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string TenTaiLieu { get; set; } = string.Empty; // Tên tài liệu

        [StringLength(100)]
        public string? LoaiTaiLieu { get; set; } // Loại tài liệu (ví dụ: "Báo cáo", "Đồ án", "Chứng chỉ")

        [StringLength(255)]
        public string? NguoiNop { get; set; } // Người nộp/tạo

        public DateTime NgayNop { get; set; } // Ngày nộp

        [StringLength(500)]
        public string? DuongDanTep { get; set; } // Đường dẫn lưu trữ tệp trên server

        // Thêm các thuộc tính cho ngày tạo/cập nhật nếu bạn muốn theo dõi
        public DateTime NgayTao { get; set; }
        public DateTime NgayCapNhat { get; set; }
    }
}