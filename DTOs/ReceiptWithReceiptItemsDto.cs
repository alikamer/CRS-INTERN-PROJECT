namespace CRS_INTERN_PROJECT.DTOs;

public class ReceiptWithReceiptItemsDto
{
    public ReceiptDto Receipt { get; set; } = null!;
    public ICollection<ReceiptItemDto> Items { get; set; } = new List<ReceiptItemDto>();
}
