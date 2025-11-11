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
        policyBuilder => policyBuilder.WithOrigins("http://127.0.0.1:5500")
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();

app.UseRouting(); 
app.UseCors("AllowSpecificOrigin"); // --- Là nó nè 5 Tiếng của 

app.UseCors("AllowFrontend");

app.UseAuthentication(); 
app.UseAuthorization(); 

app.MapControllers();

app.Run();