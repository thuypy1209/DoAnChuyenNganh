using System.ComponentModel.DataAnnotations;
using System; 

namespace DoanVienAPI.Models
{
    public class LichThi
    {
        [Key] 
        public int Id { get; set; }

        [Required] 
        [StringLength(255)] 
        public string TenMonHoc { get; set; }

        [Required]
        [StringLength(50)]
        public string MaLop { get; set; }

        [Required]
        [StringLength(100)]
        public string GiangVien { get; set; }

        [Required]
        [StringLength(100)]
        public string ThoiGian { get; set; } 

        [Required]
        [StringLength(100)]
        public string DiaDiem { get; set; }

        public int SiSo { get; set; } 

        
    }
}