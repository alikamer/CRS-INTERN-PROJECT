namespace CRS_INTERN_PROJECT.Entities;

// fişin içindeki ürünlerin detaylı tablosu 
public class ReceiptItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // fk
    public Guid ReceiptId { get; set; }

    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    // rl
    public Receipt? Receipt { get; set; }
}
