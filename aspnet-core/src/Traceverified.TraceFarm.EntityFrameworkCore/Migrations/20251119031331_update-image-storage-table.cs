using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Traceverified.TraceFarm.Migrations
{
    /// <inheritdoc />
    public partial class updateimagestoragetable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageNameRaw",
                table: "ImageStorages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "ImageStorages",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageNameRaw",
                table: "ImageStorages");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ImageStorages");
        }
    }
}
