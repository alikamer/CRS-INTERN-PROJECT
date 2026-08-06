namespace CRS_INTERN_PROJECT.DTOs.Receipt;

/// <summary>
/// Vatandaşa fişlerini gösterirken veya dışarıya veri çıkarken kullanacağımız temiz kalıp.
/// </summary>
public class ReceiptDto
{
    public Guid Id { get; set; }
    public Guid BrandId { get; set; }
    public DateTime ReceiptDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    
    /// <summary>
    /// Resmin diskteki/sunucudaki yolu. Frontend bu yolu kullanarak resmi gösterecek.
    /// </summary>
    public string? ImageUrl { get; set; }
}
