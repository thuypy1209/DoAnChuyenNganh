using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoanVienAPI.Migrations
{
    /// <inheritdoc />
    public partial class ThemBangUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Bỏ qua tất cả lệnh tạo bảng cũ (BangDiems, HoatDongs, AspNetUsers, ...)
            // CHỈ GIỮ LẠI LỆNH TẠO BẢNG USERS MỚI CHO PHÂN QUYỀN & OTP

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Student"), // Thêm mặc định là Student
                    OtpCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OtpExpiry = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            // Xóa hết tất cả các lệnh CreateTable, CreateIndex, AddForeignKey khác
            // (vì các bảng đó đã có sẵn trong Database cũ của ông)
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Chỉ xóa bảng Users nếu rollback
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}