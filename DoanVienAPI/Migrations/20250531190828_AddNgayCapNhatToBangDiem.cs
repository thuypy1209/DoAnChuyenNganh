using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoanVienAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddNgayCapNhatToBangDiem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaDoanVien",
                table: "BangDiems");

            migrationBuilder.RenameColumn(
                name: "DiemSo",
                table: "BangDiems",
                newName: "Diem");

            migrationBuilder.AlterColumn<string>(
                name: "TenMonHoc",
                table: "BangDiems",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "DiemChu",
                table: "BangDiems",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DiemHe4",
                table: "BangDiems",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DiemKT1",
                table: "BangDiems",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DiemKT2",
                table: "BangDiems",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DiemTL1",
                table: "BangDiems",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DiemTL2",
                table: "BangDiems",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DiemTrungBinhHocPhan",
                table: "BangDiems",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "BangDiems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HocKy",
                table: "BangDiems",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Khoa",
                table: "BangDiems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "KhoaHoc",
                table: "BangDiems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MaMonHoc",
                table: "BangDiems",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MaSoSinhVien",
                table: "BangDiems",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Nganh",
                table: "BangDiems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PhanTramKiemTra",
                table: "BangDiems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PhanTramThi",
                table: "BangDiems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenSinhVien",
                table: "BangDiems",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TinChi",
                table: "BangDiems",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiemChu",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "DiemHe4",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "DiemKT1",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "DiemKT2",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "DiemTL1",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "DiemTL2",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "DiemTrungBinhHocPhan",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "HocKy",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "Khoa",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "KhoaHoc",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "MaMonHoc",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "MaSoSinhVien",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "Nganh",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "PhanTramKiemTra",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "PhanTramThi",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "TenSinhVien",
                table: "BangDiems");

            migrationBuilder.DropColumn(
                name: "TinChi",
                table: "BangDiems");

            migrationBuilder.RenameColumn(
                name: "Diem",
                table: "BangDiems",
                newName: "DiemSo");

            migrationBuilder.AlterColumn<string>(
                name: "TenMonHoc",
                table: "BangDiems",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AddColumn<string>(
                name: "MaDoanVien",
                table: "BangDiems",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
