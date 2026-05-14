using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Traceverified.TraceFarm.Migrations
{
    /// <inheritdoc />
    public partial class updateeventobject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Events",
                type: "uniqueidentifier",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Events");
        }
    }
}
