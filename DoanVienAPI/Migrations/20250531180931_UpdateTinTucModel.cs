using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoanVienAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTinTucModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HinhAnhUrl",
                table: "TinTucs");

            migrationBuilder.DropColumn(
                name: "NoiDung",
                table: "TinTucs");

            migrationBuilder.DropColumn(
                name: "TacGia",
                table: "TinTucs");

            migrationBuilder.AlterColumn<string>(
                name: "TieuDe",
                table: "TinTucs",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "NoiDungTomTat",
                table: "TinTucs",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenTacGia",
                table: "TinTucs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UrlHinhAnh",
                table: "TinTucs",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NoiDungTomTat",
                table: "TinTucs");

            migrationBuilder.DropColumn(
                name: "TenTacGia",
                table: "TinTucs");

            migrationBuilder.DropColumn(
                name: "UrlHinhAnh",
                table: "TinTucs");

            migrationBuilder.AlterColumn<string>(
                name: "TieuDe",
                table: "TinTucs",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AddColumn<string>(
                name: "HinhAnhUrl",
                table: "TinTucs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NoiDung",
                table: "TinTucs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TacGia",
                table: "TinTucs",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
