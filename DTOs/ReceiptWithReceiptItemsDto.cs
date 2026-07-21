using CRS_INTERN_PROJECT.Entities;

namespace CRS_INTERN_PROJECT.DTOs;

public class ReceiptWithReceiptItemsDto
{
    public Receipt Receipt { get; set; } = null!;
    public ICollection<ReceiptItem> Items { get; set; } = new List<ReceiptItem>();
}
