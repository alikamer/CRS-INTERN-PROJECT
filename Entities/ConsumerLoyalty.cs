namespace CRS_INTERN_PROJECT.Entities;

/// <summary>
/// Sadakat tablosu.
/// Hangi vatandaş hangi markadan kaç fiş yüklemiş, kaç puan kasmış onu burada haritalıyoruz.
/// İleride müşterilerin segmentine göre kupon yolla diyecek B2B şirketleri için burası önemli.
/// Karar mekanizmasında büyük rol oynayacak
/// </summary>
public class ConsumerLoyalty
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConsumerProfileId { get; set; }
    public Guid BrandId { get; set; }
    
    public int TotalReceiptCount { get; set; }
    public decimal TotalPoints { get; set; }
    
    public ConsumerProfile ConsumerProfile { get; set; } = null!;
    public Brand Brand { get; set; } = null!;
}
