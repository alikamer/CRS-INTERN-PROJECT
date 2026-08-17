using CRS_INTERN_PROJECT.DTOs.Admin;

namespace CRS_INTERN_PROJECT.DTOs.Receipt;

public class ReceiptDto
{
    public Guid Id { get; set; }
    public Guid BrandId { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public List<ReceiptItemDto> Items { get; set; } = new();
}
