namespace CRS_INTERN_PROJECT.Entities;

/// <summary>
/// Fişlerin üzerindeki asıl mağaza/marka adları (Örn: Zara, Mavi).
/// İleride dropdown'dan falan aratıp seçeceğimiz  markaları burada tutucaz.
/// </summary>
public class Brand
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    
    public ICollection<Receipt> Receipts { get; set; } = new List<Receipt>();
    public ICollection<ConsumerLoyalty> Loyalties { get; set; } = new List<ConsumerLoyalty>();
}
