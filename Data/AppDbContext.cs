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
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<TenantInvite> TenantInvites { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>()
            .HasOne(u => u.ConsumerProfile)
            .WithOne(cp => cp.AppUser)
            .HasForeignKey<ConsumerProfile>(cp => cp.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AppUser>()
            .HasOne(u => u.CorporateProfile)
            .WithOne(cp => cp.AppUser)
            .HasForeignKey<CorporateProfile>(cp => cp.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AppUser>()
            .HasMany(u => u.RefreshTokens)
            .WithOne(rt => rt.AppUser)
            .HasForeignKey(rt => rt.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Tenant>()
            .HasMany(t => t.CorporateUsers)
            .WithOne(cp => cp.Tenant)
            .HasForeignKey(cp => cp.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Tenant>()
            .HasOne(t => t.Brand)
            .WithMany()
            .HasForeignKey(t => t.BrandId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ConsumerProfile>()
            .HasMany(cp => cp.Receipts)
            .WithOne(r => r.ConsumerProfile)
            .HasForeignKey(r => r.ConsumerProfileId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Brand>()
            .HasMany(b => b.Receipts)
            .WithOne(r => r.Brand)
            .HasForeignKey(r => r.BrandId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Receipt>()
            .HasMany(r => r.Items)
            .WithOne(ri => ri.Receipt)
            .HasForeignKey(ri => ri.ReceiptId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ReceiptItem>()
            .Property(ri => ri.AttributesJson)
            .HasColumnType("jsonb");

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

        modelBuilder.Entity<Tenant>()
            .HasMany<TenantInvite>()
            .WithOne(ti => ti.Tenant)
            .HasForeignKey(ti => ti.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
