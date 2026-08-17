using Microsoft.AspNetCore.Http;

namespace CRS_INTERN_PROJECT.DTOs.Receipt;

/// <summary>
/// Vatandaşın fiş yüklerken API'ye göndereceği veri paketi.
/// Sadece fişin genel hatları (Tarih, Tutar, Marka) ve fotoğrafı var. Ürün kalemlerini (Item) şimdilik pas geçiyoruz, ileride OCR ile halledeceğiz.
/// </summary>
public class UploadReceiptDto
{
    public Guid BrandId { get; set; }
    public DateTime ReceiptDate { get; set; }
    public decimal TotalAmount { get; set; }
    
    public IFormFile Image { get; set; } = null!;
}
