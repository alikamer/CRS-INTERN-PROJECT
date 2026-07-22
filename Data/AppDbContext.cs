using Microsoft.EntityFrameworkCore;
using CRS_INTERN_PROJECT.Entities;

namespace CRS_INTERN_PROJECT.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Receipt> Receipts => Set<Receipt>();
    public DbSet<ReceiptItem> ReceiptItems => Set<ReceiptItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Tenant)
            .WithMany(t => t.Users)
            .HasForeignKey(u => u.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Receipt>()
            .HasOne(r => r.Tenant)
            .WithMany(t => t.Receipts)
            .HasForeignKey(r => r.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Receipt>()
            .HasOne(r => r.User)
            .WithMany(u => u.SubmittedReceipts)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Receipt>()
            .HasOne(r => r.ReviewedByUser)
            .WithMany(u => u.ReviewedReceipts)
            .HasForeignKey(r => r.ReviewedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ReceiptItem>()
            .HasOne<Receipt>()
            .WithMany(r => r.Items)
            .HasForeignKey(ri => ri.ReceiptId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
