using System;
using System.ComponentModel.DataAnnotations;

namespace DoanVienAPI.Models
{
    public class FAQ
    {
        [Key]
        public int Id { get; set; }
        public string CauHoi { get; set; } = string.Empty;
        public string TraLoi { get; set; } = string.Empty;
        public DateTime NgayTao { get; set; } = DateTime.Now;
    }
}