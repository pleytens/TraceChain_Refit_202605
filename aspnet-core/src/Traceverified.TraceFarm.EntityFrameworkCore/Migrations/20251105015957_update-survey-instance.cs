using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Traceverified.TraceFarm.Migrations
{
    /// <inheritdoc />
    public partial class updatesurveyinstance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BillImageName",
                table: "Event.SurveyInstances",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Event.SurveyInstances",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "Event.SurveyInstances",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Event.SurveyInstances",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BillImageName",
                table: "Event.SurveyInstances");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Event.SurveyInstances");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "Event.SurveyInstances");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Event.SurveyInstances");
        }
    }
}
