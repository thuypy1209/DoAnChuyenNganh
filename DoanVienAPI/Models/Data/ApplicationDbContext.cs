using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using DoanVienAPI.Areas.Identity.Data; 

namespace DoanVienAPI.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        
        public DbSet<DoanVien> DoanViens { get; set; }

        
        public DbSet<TinTuc> TinTucs { get; set; }

        public DbSet<LichThi> LichThis { get; set; }

        public DbSet<DanhMuc> DanhMucs { get; set; }

        public DbSet<HoSoBaoCao> HoSos { get; set; }

        
        public DbSet<BangDiem> BangDiems { get; set; } 
 
    }
}