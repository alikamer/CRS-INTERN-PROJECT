using CRS_INTERN_PROJECT.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRS_INTERN_PROJECT.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<AppUser> Users { get; set; } = null!;
    public DbSet<ConsumerProfile> ConsumerProfiles { get; set; } = null!;
    public DbSet<CorporateProfile> CorporateProfiles { get; set; } = null!;
    public DbSet<Tenant> Tenants { get; set; } = null!;
    public DbSet<Brand> Brands { get; set; } = null!;
    public DbSet<Receipt> Receipts { get; set; } = null!;
    public DbSet<ReceiptItem> ReceiptItems { get; set; } = null!;
    public DbSet<ConsumerLoyalty> ConsumerLoyalties { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        /// <summary>
        /// AppUser (Sisteme giriş yapan herkes) ile Vatandaş (Consumer) profili arasındaki birebir (1-to-1) bağlantı.
        /// Vatandaşlar kayıt olduğunda bu ikisi eşleşir.
        /// </summary>
        modelBuilder.Entity<AppUser>()
            .HasOne(u => u.ConsumerProfile)
            .WithOne(cp => cp.AppUser)
            .HasForeignKey<ConsumerProfile>(cp => cp.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        /// <summary>
        /// Şirket yetkilileri (CorporateUser) giriş yaptığında B2B panelini görecek olan .
        /// Onların profili de AppUser ile birebir eşleşiyor.
        /// </summary>
        modelBuilder.Entity<AppUser>()
            .HasOne(u => u.CorporateProfile)
            .WithOne(cp => cp.AppUser)
            .HasForeignKey<CorporateProfile>(cp => cp.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        /// <summary>
        /// Bir şirketin (Tenant) birden fazla çalışanı (CorporateUser) olabilir. 1-e-çok ilişki.
        /// Şirket silinirse çalışanlar ortada kalmasın diye Restrict.
        /// </summary>
        modelBuilder.Entity<Tenant>()
            .HasMany(t => t.CorporateUsers)
            .WithOne(cp => cp.Tenant)
            .HasForeignKey(cp => cp.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        /// <summary>
        /// Normal aboneliği olan şirketler (Tenant) genelde sadece kendi markasını (Brand) takip etmek ister.
        /// O yüzden Şirketi doğrudan bir Markaya (Brand) bağlıyoruz. Premiumlar zaten her şeyi görecek.
        /// </summary>
        modelBuilder.Entity<Tenant>()
            .HasOne(t => t.Brand)
            .WithMany()
            .HasForeignKey(t => t.BrandId)
            .OnDelete(DeleteBehavior.SetNull);

        /// <summary>
        /// Vatandaşın yüklediği fişler (Receipt) o vatandaşa bağlanır.
        /// Eğer vatandaş hesabını kapatırsa fişler silinmez setnull!. 
        /// </summary>
        modelBuilder.Entity<ConsumerProfile>()
            .HasMany(cp => cp.Receipts)
            .WithOne(r => r.ConsumerProfile)
            .HasForeignKey(r => r.ConsumerProfileId)
            .OnDelete(DeleteBehavior.SetNull);

        /// <summary>
        /// Sisteme girilen her fiş mecburen bir markaya (Brand) ait olmak zorunda (Mavi, Zara vs).
        /// Restrict ile mağaza silinirs ona bağlı fişlerin silinmesini engelleriz.
        /// </summary>
        modelBuilder.Entity<Brand>()
            .HasMany(b => b.Receipts)
            .WithOne(r => r.Brand)
            .HasForeignKey(r => r.BrandId)
            .OnDelete(DeleteBehavior.Restrict);

        /// <summary>
        /// Bir fişin içindeki satır satır ürünler (Tişört, Pantolon vs).
        /// Fişin kendisi silinirse içindeki kalemlerin de bir anlamı kalmaz (Cascade).
        /// </summary>
        modelBuilder.Entity<Receipt>()
            .HasMany(r => r.Items)
            .WithOne(ri => ri.Receipt)
            .HasForeignKey(ri => ri.ReceiptId)
            .OnDelete(DeleteBehavior.Cascade);

        /// <summary>
        ///  İleride yapay zeka (OCR) entegre olduğunda fişin içindeki ekstra detayları
        /// (Renk, Beden, Cinsiyet vs.) tabloyu sütuna boğmadan direkt JSON olarak buraya atıcaz.
        /// 
        /// </summary>
        modelBuilder.Entity<ReceiptItem>()
            .Property(ri => ri.AttributesJson)
            .HasColumnType("jsonb");

        /// <summary>
        /// Sadakat ve Puanlama kısmı.
        /// Hangi vatandaş hangi markadan kaç puan toplamış, kaç fiş yüklemiş onu burada haritalıyoruz.
        /// </summary>
        modelBuilder.Entity<ConsumerProfile>()
            .HasMany(cp => cp.Loyalties)
            .WithOne(cl => cl.ConsumerProfile)
            .HasForeignKey(cl => cl.ConsumerProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Brand>()
            .HasMany(b => b.Loyalties)
            .WithOne(cl => cl.Brand)
            .HasForeignKey(cl => cl.BrandId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
