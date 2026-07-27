using Microsoft.EntityFrameworkCore;
using CRS_INTERN_PROJECT.Data;
using CRS_INTERN_PROJECT.DTOs;
using CRS_INTERN_PROJECT.Entities;
using CRS_INTERN_PROJECT.Enums;

namespace CRS_INTERN_PROJECT.Services;

public class ReceiptService : IReceiptService
{
    private readonly AppDbContext _context;

    public ReceiptService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ReceiptWithReceiptItemsDto> CreateReceiptAsync(CreateReceiptDto dto)
    {
        var (tenantId, userId) = await GetOrCreateDefaultTenantAndUserAsync();

        var receipt = new Receipt
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            StoreName = dto.StoreName,
            ReceiptDate = dto.ReceiptDate.ToUniversalTime(),
            Status = ReceiptStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            Items = dto.Items.Select(itemDto => new ReceiptItem
            {
                Id = Guid.NewGuid(),
                ProductName = itemDto.ProductName,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                TotalPrice = itemDto.Quantity * itemDto.UnitPrice
            }).ToList()
        };

        // Toplam tutarı alt ürün kalemlerinin toplamı olarak hesaplıyoruz
        receipt.TotalAmount = receipt.Items.Sum(item => item.TotalPrice);

        _context.Receipts.Add(receipt);
        await _context.SaveChangesAsync();

        return MapToReceiptWithReceiptItemsDto(receipt);
    }

    public async Task<IEnumerable<ReceiptDto>> GetAllReceiptsAsync()
    {
        var receipts = await _context.Receipts
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return receipts.Select(MapToReceiptDto).ToList();
    }

    public async Task<ReceiptWithReceiptItemsDto?> GetReceiptByIdAsync(Guid id)
    {
        var receipt = await _context.Receipts
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (receipt == null)
        {
            return null;
        }

        return MapToReceiptWithReceiptItemsDto(receipt);
    }

    public async Task<bool> DeleteReceiptAsync(Guid id)
    {
        var receipt = await _context.Receipts.FindAsync(id);
        if (receipt == null)
        {
            return false;
        }

        _context.Receipts.Remove(receipt);
        await _context.SaveChangesAsync();
        return true;
    }

    #region Helper Methods & Mappings

    private async Task<(Guid TenantId, Guid UserId)> GetOrCreateDefaultTenantAndUserAsync()
    {
        // JWT Auth entegrasyonu tamamlanana kadar geliştirme ortamında kullanılacak varsayılan Tenant ve User
        var tenant = await _context.Tenants.FirstOrDefaultAsync();
        if (tenant == null)
        {
            tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = "Default CRS Tenant",
                SubscriptionTier = "Basic",
                CreatedAt = DateTime.UtcNow
            };
            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.TenantId == tenant.Id);
        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Email = "intern@crssoft.com",
                PasswordHash = "placeholder_hash", // JWT aşamasında güncellenecek
                FullName = "Intern Developer",
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        return (tenant.Id, user.Id);
    }

    private static ReceiptWithReceiptItemsDto MapToReceiptWithReceiptItemsDto(Receipt receipt)
    {
        return new ReceiptWithReceiptItemsDto
        {
            Receipt = MapToReceiptDto(receipt),
            Items = receipt.Items.Select(MapToReceiptItemDto).ToList()
        };
    }

    private static ReceiptDto MapToReceiptDto(Receipt receipt)
    {
        return new ReceiptDto
        {
            Id = receipt.Id,
            TenantId = receipt.TenantId,
            UserId = receipt.UserId,
            StoreName = receipt.StoreName,
            ReceiptDate = receipt.ReceiptDate,
            TotalAmount = receipt.TotalAmount,
            Status = receipt.Status.ToString(),
            ImagePath = receipt.ImagePath,
            ReviewedByUserId = receipt.ReviewedByUserId,
            ReviewedAt = receipt.ReviewedAt,
            CreatedAt = receipt.CreatedAt
        };
    }

    private static ReceiptItemDto MapToReceiptItemDto(ReceiptItem item)
    {
        return new ReceiptItemDto
        {
            Id = item.Id,
            ReceiptId = item.ReceiptId,
            ProductName = item.ProductName,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            TotalPrice = item.TotalPrice
        };
    }

    #endregion
}
