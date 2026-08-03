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

    public async Task<ReceiptWithReceiptItemsDto> CreateReceiptAsync(CreateReceiptDto dto, Guid userId, Guid tenantId)
    {
        var receipt = new Receipt
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            StoreName = dto.StoreName,
            ReceiptDate = dto.ReceiptDate.ToUniversalTime(),
            ImagePath = dto.ImagePath,
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

        receipt.TotalAmount = receipt.Items.Sum(item => item.TotalPrice);

        _context.Receipts.Add(receipt);
        await _context.SaveChangesAsync();

        return MapToReceiptWithReceiptItemsDto(receipt);
    }

    public async Task<PagedResult<ReceiptDto>> GetAllReceiptsAsync(Guid tenantId, int page = 1, int pageSize = 10)
    {
        var query = _context.Receipts.Where(r => r.TenantId == tenantId); 

        var totalCount = await query.CountAsync();

        var receipts = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<ReceiptDto>
        {
            Items = receipts.Select(MapToReceiptDto).ToList(),
            TotalCount = totalCount,
            CurrentPage = page,
            PageSize = pageSize
        };
    }

    public async Task<ReceiptWithReceiptItemsDto?> GetReceiptByIdAsync(Guid id, Guid tenantId)
    {
        var receipt = await _context.Receipts
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenantId);

        if (receipt == null) return null;

        return MapToReceiptWithReceiptItemsDto(receipt);
    }

    public async Task<bool> DeleteReceiptAsync(Guid id, Guid tenantId)
    {
        var receipt = await _context.Receipts.FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenantId);
        if (receipt == null) return false;

        _context.Receipts.Remove(receipt);
        await _context.SaveChangesAsync();
        return true;
    }

    #region Helper Methods & Mappings

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
