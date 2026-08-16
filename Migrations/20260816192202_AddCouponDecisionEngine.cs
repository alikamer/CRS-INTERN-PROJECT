using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRS_INTERN_PROJECT.Migrations
{
    /// <inheritdoc />
    public partial class AddCouponDecisionEngine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Daha önceki bir oturumda migration sistemi dışında (elle) oluşturulmuş, hiç
            // commit'lenmemiş, boş ve kodun bilmediği eski bir "Coupons" tablosu vardı.
            // Aşağıdaki CreateTable ile çakışmaması için önce onu temizliyoruz.
            migrationBuilder.Sql(@"DROP TABLE IF EXISTS ""Coupons"" CASCADE;");

            migrationBuilder.AddColumn<bool>(
                name: "IsRewarded",
                table: "Receipts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // Geçmişte zaten onaylanmış fişler yeni kupon sistemine dahil olmasın (haksız
            // kazancı önlemek için herkes bundan sonraki fişlerle sıfırdan başlasın).
            migrationBuilder.Sql(@"UPDATE ""Receipts"" SET ""IsRewarded"" = TRUE WHERE ""Status"" = 1;");

            migrationBuilder.CreateTable(
                name: "Coupons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConsumerProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    BrandId = table.Column<Guid>(type: "uuid", nullable: true),
                    Code = table.Column<string>(type: "text", nullable: false),
                    DiscountPercentage = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RedeemedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Coupons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Coupons_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Coupons_ConsumerProfiles_ConsumerProfileId",
                        column: x => x.ConsumerProfileId,
                        principalTable: "ConsumerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_BrandId",
                table: "Coupons",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_ConsumerProfileId",
                table: "Coupons",
                column: "ConsumerProfileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Coupons");

            migrationBuilder.DropColumn(
                name: "IsRewarded",
                table: "Receipts");
        }
    }
}
