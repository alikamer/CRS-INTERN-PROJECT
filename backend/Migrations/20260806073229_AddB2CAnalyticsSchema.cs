using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRS_INTERN_PROJECT.Migrations
{
    /// <inheritdoc />
    public partial class AddB2CAnalyticsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Brands",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    LogoUrl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyName = table.Column<string>(type: "text", nullable: false),
                    SubscriptionTier = table.Column<int>(type: "integer", nullable: false),
                    BrandId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tenants_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ConsumerProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Gender = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    IncomeLevel = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsumerProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConsumerProfiles_Users_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CorporateProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Department = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CorporateProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CorporateProfiles_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CorporateProfiles_Users_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ConsumerLoyalties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConsumerProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    BrandId = table.Column<Guid>(type: "uuid", nullable: false),
                    TotalReceiptCount = table.Column<int>(type: "integer", nullable: false),
                    TotalPoints = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsumerLoyalties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConsumerLoyalties_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConsumerLoyalties_ConsumerProfiles_ConsumerProfileId",
                        column: x => x.ConsumerProfileId,
                        principalTable: "ConsumerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Receipts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConsumerProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    BrandId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceiptDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Receipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Receipts_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Receipts_ConsumerProfiles_ConsumerProfileId",
                        column: x => x.ConsumerProfileId,
                        principalTable: "ConsumerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReceiptItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceiptId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductName = table.Column<string>(type: "text", nullable: false),
                    ProductCategory = table.Column<string>(type: "text", nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    AttributesJson = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReceiptItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReceiptItems_Receipts_ReceiptId",
                        column: x => x.ReceiptId,
                        principalTable: "Receipts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConsumerLoyalties_BrandId",
                table: "ConsumerLoyalties",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsumerLoyalties_ConsumerProfileId",
                table: "ConsumerLoyalties",
                column: "ConsumerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsumerProfiles_AppUserId",
                table: "ConsumerProfiles",
                column: "AppUserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CorporateProfiles_AppUserId",
                table: "CorporateProfiles",
                column: "AppUserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CorporateProfiles_TenantId",
                table: "CorporateProfiles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ReceiptItems_ReceiptId",
                table: "ReceiptItems",
                column: "ReceiptId");

            migrationBuilder.CreateIndex(
                name: "IX_Receipts_BrandId",
                table: "Receipts",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_Receipts_ConsumerProfileId",
                table: "Receipts",
                column: "ConsumerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_BrandId",
                table: "Tenants",
                column: "BrandId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConsumerLoyalties");

            migrationBuilder.DropTable(
                name: "CorporateProfiles");

            migrationBuilder.DropTable(
                name: "ReceiptItems");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropTable(
                name: "Receipts");

            migrationBuilder.DropTable(
                name: "Brands");

            migrationBuilder.DropTable(
                name: "ConsumerProfiles");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
