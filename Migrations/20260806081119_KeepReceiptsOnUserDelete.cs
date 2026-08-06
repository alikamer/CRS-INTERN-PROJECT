using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRS_INTERN_PROJECT.Migrations
{
    /// <inheritdoc />
    public partial class KeepReceiptsOnUserDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Receipts_ConsumerProfiles_ConsumerProfileId",
                table: "Receipts");

            migrationBuilder.AlterColumn<Guid>(
                name: "ConsumerProfileId",
                table: "Receipts",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Receipts_ConsumerProfiles_ConsumerProfileId",
                table: "Receipts",
                column: "ConsumerProfileId",
                principalTable: "ConsumerProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConsumerLoyalties_Brands_BrandId1",
                table: "ConsumerLoyalties");

            migrationBuilder.DropForeignKey(
                name: "FK_Receipts_ConsumerProfiles_ConsumerProfileId",
                table: "Receipts");

            migrationBuilder.DropIndex(
                name: "IX_ConsumerLoyalties_BrandId1",
                table: "ConsumerLoyalties");

            migrationBuilder.DropColumn(
                name: "BrandId1",
                table: "ConsumerLoyalties");

            migrationBuilder.AlterColumn<Guid>(
                name: "ConsumerProfileId",
                table: "Receipts",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Receipts_ConsumerProfiles_ConsumerProfileId",
                table: "Receipts",
                column: "ConsumerProfileId",
                principalTable: "ConsumerProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
