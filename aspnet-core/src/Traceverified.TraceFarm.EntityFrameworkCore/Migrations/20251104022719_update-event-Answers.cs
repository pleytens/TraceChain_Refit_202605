using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Traceverified.TraceFarm.Migrations
{
    /// <inheritdoc />
    public partial class updateeventAnswers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCorrect",
                table: "Event.Answers",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsCorrect",
                table: "Event.Answers");
        }
    }
}
