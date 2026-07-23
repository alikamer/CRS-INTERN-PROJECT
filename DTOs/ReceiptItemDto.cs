namespace CRS_INTERN_PROJECT.DTOs;

public class ReceiptItemDto
{
    public Guid Id { get; set; }
    public Guid ReceiptId { get; set; }
    
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
