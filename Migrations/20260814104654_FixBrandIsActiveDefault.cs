using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRS_INTERN_PROJECT.Migrations
{
    /// <inheritdoc />
    public partial class FixBrandIsActiveDefault : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Bir önceki migration (AddIsActiveToBrand), yeni NOT NULL kolonu için EF'in
            // varsayılan CLR değerini (bool -> false) kullandı; C# tarafındaki
            // "IsActive = true" property initializer'ı DB seviyesinde bir DEFAULT üretmiyor.
            // Sonuç: DbSeeder'daki Zara/Mavi/Starbucks/LC Waikiki/Nike yanlışlıkla pasif işaretlendi.
            // Var olan tüm markaları tekrar aktif yapıp bunu düzeltiyoruz.
            migrationBuilder.Sql("UPDATE \"Brands\" SET \"IsActive\" = true;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Geri alınacak bir veri durumu yok; kasıtlı olarak boş bırakıldı.
        }
    }
}
