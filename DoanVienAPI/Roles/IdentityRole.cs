using Microsoft.AspNetCore.Identity;

namespace DoanVienAPI.Roles
{
    public class IdentityRoles
    {
        public static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles = { "Admin", "Đoàn Trường", "Đoàn Khoa", "Đoàn Viên" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }
    }
}
