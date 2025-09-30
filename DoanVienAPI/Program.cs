using Microsoft.EntityFrameworkCore;
using DoanVienAPI.Data;
using Microsoft.AspNetCore.Identity;
using DoanVienAPI.Areas.Identity.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DoanVienAPI.Roles;
using System.Security.Claims;
using System.Text.Json;

// THÊM CÁC USING STATEMENT NÀY VÀO ĐÂY (GIỮ NGUYÊN)
using System.IO; 
using Microsoft.Extensions.FileProviders; 
using Microsoft.AspNetCore.Hosting; 
using System.Reflection; 

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    }); 

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// THÊM DÒNG NÀY ĐỂ ĐĂNG KÝ DỊCH VỤ DUYỆT THƯ MỤC (GIỮ NGUYÊN)
builder.Services.AddDirectoryBrowser();

// Cấu hình CORS - Quan trọng cho Live Server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policyBuilder => policyBuilder.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500") // Cổng của Live Server
                                     .AllowAnyHeader()
                                     .AllowAnyMethod());
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequiredLength = 6;
})
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("JWT Key is missing in configuration (Jwt:Key).");
}

var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})

    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = ClaimTypes.Role 
        };

    });

builder.Services.AddAuthorization(options =>
{
    // Phân quyền theo role
    options.AddPolicy("RequireAdminOrDoanKhoa", policy =>
        policy.RequireRole("Admin", "doankhoa"));

    // Có thể thêm các policy khác nếu cần
});
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login";
    options.AccessDeniedPath = "/Account/AccessDenied";
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    await IdentityRoles.SeedRolesAsync(roleManager);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); 
app.UseRouting();

// Áp dụng CORS policy (phải đặt TRƯỚC app.UseAuthorization() nếu có)
app.UseCors("AllowSpecificOrigin");

// BẮT ĐẦU PHẦN CẤU HÌNH PHỤC VỤ STATIC FILES TỐI ƯU CHO LIVE SERVER
// KHÔNG CẦN phục vụ thư mục 'Pages' từ Backend nữa nếu Live Server lo phần đó
// Bạn chỉ cần đảm bảo các API và các file upload từ Backend được phục vụ
// Nếu bạn muốn dùng Live Server, thì Live Server sẽ tự phục vụ các file HTML/JS/CSS trong thư mục Pages.
// Các cấu hình UseStaticFiles dưới đây chỉ dành cho các file mà Backend cần phục vụ trực tiếp (vd: uploads)

// Cấu hình phục vụ các tệp tĩnh từ thư mục wwwroot của dự án DoanVienAPI (mặc định)
// Ví dụ: wwwroot/uploads sẽ được truy cập qua /uploads
app.UseStaticFiles(); 

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads")),
    RequestPath = "/uploads" 
});

app.UseDirectoryBrowser(new DirectoryBrowserOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads")),
    RequestPath = "/uploads"
});
// KẾT THÚC PHẦN CẤU HÌNH PHỤC VỤ STATIC FILES TỐI ƯU CHO LIVE SERVER

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();