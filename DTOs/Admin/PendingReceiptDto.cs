namespace CRS_INTERN_PROJECT.DTOs.Admin;

/// <summary>
/// Admin tarafından onaylanacak fiş bilgileri dtosu
/// </summary>
public class PendingReceiptDto
{
    public Guid Id { get; set; }
    public Guid? ConsumerProfileId { get; set; }
    public Guid BrandId { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public List<ReceiptItemDto> Items { get; set; } = new();
}

public class ReceiptItemDto
{
    public Guid Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public string Category { get; set; } = string.Empty;
}

/// <summary>
/// Admin fişe manuel ürün eklerken gönderilen DTO.
/// </summary>
public class AddReceiptItemDto
{
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public string Category { get; set; } = string.Empty;
}
