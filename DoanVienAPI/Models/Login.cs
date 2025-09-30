using System.ComponentModel.DataAnnotations;

namespace DoanVienAPI.Models
{
    public class Login
    {
        [Required]
        public required string UserName { get; set; }
        [Required]
        public string Password { get; set; }
        public string Role { get; set; } = string.Empty;

    }
}
