using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRS_INTERN_PROJECT.Migrations
{
    /// <inheritdoc />
    public partial class AddRefreshTokenTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConsumerLoyalties_Brands_BrandId1",
                table: "ConsumerLoyalties");

            migrationBuilder.DropIndex(
                name: "IX_ConsumerLoyalties_BrandId1",
                table: "ConsumerLoyalties");

            migrationBuilder.DropColumn(
                name: "BrandId1",
                table: "ConsumerLoyalties");

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_AppUserId",
                table: "RefreshTokens",
                column: "AppUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.AddColumn<Guid>(
                name: "BrandId1",
                table: "ConsumerLoyalties",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConsumerLoyalties_BrandId1",
                table: "ConsumerLoyalties",
                column: "BrandId1");

            migrationBuilder.AddForeignKey(
                name: "FK_ConsumerLoyalties_Brands_BrandId1",
                table: "ConsumerLoyalties",
                column: "BrandId1",
                principalTable: "Brands",
                principalColumn: "Id");
        }
    }
}
