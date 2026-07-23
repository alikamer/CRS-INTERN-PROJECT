namespace CRS_INTERN_PROJECT.DTOs;

public class CreateReceiptDto
{
    public string StoreName { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    public List<CreateReceiptItemDto> Items { get; set; } = new();
}
