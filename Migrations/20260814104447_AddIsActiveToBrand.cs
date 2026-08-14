using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRS_INTERN_PROJECT.Migrations
{
    /// <inheritdoc />
    public partial class AddIsActiveToBrand : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Brands",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Brands");
        }
    }
}
