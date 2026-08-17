namespace CRS_INTERN_PROJECT.Entities;

/// <summary>
/// Fişin içindeki satır satır ürünler (Tişört, Pantolon vs).
/// </summary>
public class ReceiptItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReceiptId { get; set; }

    public string ProductName { get; set; } = string.Empty;
    public string? ProductCategory { get; set; }
    
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    public string? AttributesJson { get; set; }

    public Receipt Receipt { get; set; } = null!;
}
