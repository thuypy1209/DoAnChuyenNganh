
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace DoanVienAPI.Areas.Identity.Data;

// Add profile data for application users by adding properties to the DoanVienAPIUser class
public class ApplicationUser : IdentityUser
{
    [Required(ErrorMessage = "Họ tên không được để trống")]
    [StringLength(100, ErrorMessage = "Họ tên không được dài quá 100 ký tự")]
    public string FullName { get; set; }
}

