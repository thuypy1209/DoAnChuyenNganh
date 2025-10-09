using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoanVienAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDoanVien_FinalSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Khoa",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "MaDoanVien",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "Nganh",
                table: "DoanViens");

            migrationBuilder.RenameColumn(
                name: "KhoaHoc",
                table: "DoanViens",
                newName: "MaDinhDanh");

            migrationBuilder.AlterColumn<string>(
                name: "SoDienThoai",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "HoTen",
                table: "DoanViens",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChucVu",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cmnd",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DanToc",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GioiTinh",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeDaoTao",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LyLuanChinhTri",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayCap",
                table: "DoanViens",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayVaoDang",
                table: "DoanViens",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayVaoDoan",
                table: "DoanViens",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NgheNghiep",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NghiQuyetKetNap",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NgoaiNgu",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NoiCap",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QueQuan",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SoTheDoan",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThuongTru",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TonGiao",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrinhDoChuyenMon",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrinhDoTinHoc",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrinhDoVanHoa",
                table: "DoanViens",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChucVu",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "Cmnd",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "DanToc",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "GioiTinh",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "HeDaoTao",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "LyLuanChinhTri",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "NgayCap",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "NgayVaoDang",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "NgayVaoDoan",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "NgheNghiep",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "NghiQuyetKetNap",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "NgoaiNgu",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "NoiCap",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "QueQuan",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "SoTheDoan",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "ThuongTru",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "TonGiao",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "TrinhDoChuyenMon",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "TrinhDoTinHoc",
                table: "DoanViens");

            migrationBuilder.DropColumn(
                name: "TrinhDoVanHoa",
                table: "DoanViens");

            migrationBuilder.RenameColumn(
                name: "MaDinhDanh",
                table: "DoanViens",
                newName: "KhoaHoc");

            migrationBuilder.AlterColumn<string>(
                name: "SoDienThoai",
                table: "DoanViens",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "HoTen",
                table: "DoanViens",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "DoanViens",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Khoa",
                table: "DoanViens",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MaDoanVien",
                table: "DoanViens",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Nganh",
                table: "DoanViens",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }
    }
}
