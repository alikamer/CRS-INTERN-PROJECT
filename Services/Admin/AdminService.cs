using CRS_INTERN_PROJECT.Data;
using CRS_INTERN_PROJECT.DTOs.Admin;
using CRS_INTERN_PROJECT.Entities;
using CRS_INTERN_PROJECT.Enums;
using Microsoft.EntityFrameworkCore;

namespace CRS_INTERN_PROJECT.Services.Admin;

/// <summary>
/// Sistem yöneticisi iş mantığını barındıran servis.
/// Onay bekleyen fişlerin getirilmesi, fişlere ürün kalemlerinin eklenmesi ve onaylama akışlarını yönetir.
/// </summary>
public class AdminService : IAdminService
{
    private readonly AppDbContext _context;

    public AdminService(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Onay bekleyen (Pending) durumundaki tüm fişleri detayları ve ürün kalemleriyle birlikte getirir.
    /// </summary>
    public async Task<List<PendingReceiptDto>> GetPendingReceiptsAsync()
    {
        var receipts = await _context.Receipts
            .Include(r => r.Brand)
            .Include(r => r.Items)
            .Where(r => r.Status == ReceiptStatus.Pending)
            .OrderByDescending(r => r.ReceiptDate)
            .Select(r => new PendingReceiptDto
            {
                Id = r.Id,
                ConsumerProfileId = r.ConsumerProfileId,
                BrandId = r.BrandId,
                BrandName = r.Brand != null ? r.Brand.Name : "Bilinmeyen Marka",
                ReceiptDate = r.ReceiptDate,
                TotalAmount = r.TotalAmount,
                Status = r.Status.ToString(),
                ImageUrl = r.ImageUrl,
                Items = r.Items.Select(i => new ReceiptItemDto
                {
                    Id = i.Id,
                    ProductName = i.ProductName,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    TotalPrice = i.TotalPrice,
                    Category = i.ProductCategory ?? "Genel"
                }).ToList()
            })
            .ToListAsync();

        return receipts;
    }

    /// <summary>
    /// Admin tarafından ilgili fişe manuel ürün kalemi ekler ve fiş toplam tutarını günceller.
    /// </summary>
    public async Task<bool> AddReceiptItemAsync(Guid receiptId, AddReceiptItemDto dto)
    {
        var receipt = await _context.Receipts
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == receiptId);

        if (receipt == null)
        {
            throw new Exception("İlgili fiş bulunamadı.");
        }

        var totalPrice = dto.UnitPrice * dto.Quantity;
        var newItem = new ReceiptItem
        {
            ReceiptId = receiptId,
            ProductName = dto.ProductName,
            UnitPrice = dto.UnitPrice,
            Quantity = dto.Quantity,
            TotalPrice = totalPrice,
            ProductCategory = dto.Category
        };

        _context.ReceiptItems.Add(newItem);

        receipt.TotalAmount = receipt.Items.Sum(i => i.TotalPrice) + totalPrice;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Fişi onaylar ve vatandaşa sadakat puanı kazandırır.
    /// </summary>
    public async Task<bool> ApproveReceiptAsync(Guid receiptId)
    {
        var receipt = await _context.Receipts
            .FirstOrDefaultAsync(r => r.Id == receiptId);

        if (receipt == null)
        {
            throw new Exception("Böyle bir fiş bulunamadı.");
        }

        if (receipt.Status == ReceiptStatus.Approved)
        {
            throw new Exception("Bu fiş zaten onaylanmış.");
        }

        receipt.Status = ReceiptStatus.Approved;

        if (receipt.ConsumerProfileId.HasValue)
        {
            var loyalty = await _context.ConsumerLoyalties
                .FirstOrDefaultAsync(cl => cl.ConsumerProfileId == receipt.ConsumerProfileId.Value && cl.BrandId == receipt.BrandId);

            if (loyalty == null)
            {
                loyalty = new ConsumerLoyalty
                {
                    ConsumerProfileId = receipt.ConsumerProfileId.Value,
                    BrandId = receipt.BrandId,
                    TotalReceiptCount = 0,
                    TotalPoints = 0
                };
                _context.ConsumerLoyalties.Add(loyalty);
            }

            loyalty.TotalReceiptCount += 1;
            loyalty.TotalPoints += receipt.TotalAmount * 0.05m;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Onay bekleyen şirket başvurularını, admin telefonla ulaşabilsin diye başvuruyu yapan
    /// kişinin iletişim bilgileriyle birlikte getirir.
    /// </summary>
    public async Task<List<PendingTenantDto>> GetPendingTenantsAsync()
    {
        var tenants = await _context.Tenants
            .Include(t => t.CorporateUsers)
            .ThenInclude(cp => cp.AppUser)
            .Where(t => t.Status == TenantStatus.WaitingForApproval)
            .OrderBy(t => t.CreatedAt)
            .Select(t => new PendingTenantDto
            {
                TenantId = t.Id,
                CompanyName = t.CompanyName,
                CreatedAt = t.CreatedAt,
                ContactFirstName = t.CorporateUsers.First().AppUser.FirstName,
                ContactLastName = t.CorporateUsers.First().AppUser.LastName,
                ContactPhoneNumber = t.CorporateUsers.First().AppUser.PhoneNumber,
                ContactEmail = t.CorporateUsers.First().AppUser.Email
            })
            .ToListAsync();

        return tenants;
    }

    /// <summary>
    /// Admin, telefonla doğruladıktan sonra şirketi onaylar; marka ve abonelik paketi burada atanır.
    /// </summary>
    public async Task<bool> ApproveTenantAsync(Guid tenantId, ApproveTenantDto dto)
    {
        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
        if (tenant == null)
        {
            throw new Exception("Böyle bir şirket başvurusu bulunamadı.");
        }

        if (!Enum.TryParse<SubscriptionTier>(dto.SubscriptionTier, true, out var parsedTier))
        {
            throw new Exception("Geçersiz abonelik paketi.");
        }

        var brandExists = await _context.Brands.AnyAsync(b => b.Id == dto.BrandId);
        if (!brandExists)
        {
            throw new Exception("Böyle bir marka bulunamadı.");
        }

        tenant.BrandId = dto.BrandId;
        tenant.SubscriptionTier = parsedTier;
        tenant.Status = TenantStatus.Active;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Uygun görülmeyen şirket başvurusunu reddeder.
    /// </summary>
    public async Task<bool> RejectTenantAsync(Guid tenantId)
    {
        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId);
        if (tenant == null)
        {
            throw new Exception("Böyle bir şirket başvurusu bulunamadı.");
        }

        tenant.Status = TenantStatus.Rejected;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Onay formundaki marka dropdown'ı için sade marka listesi.
    /// </summary>
    public async Task<List<BrandOptionDto>> GetBrandsAsync()
    {
        return await _context.Brands
            .OrderBy(b => b.Name)
            .Select(b => new BrandOptionDto { Id = b.Id, Name = b.Name })
            .ToListAsync();
    }
}
