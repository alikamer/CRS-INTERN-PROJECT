namespace CRS_INTERN_PROJECT.DTOs;

public class CreateReceiptItemDto
{
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
