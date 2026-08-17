namespace CRS_INTERN_PROJECT.Entities;

/// <summary>
/// Fişlerin üzerindeki asıl mağaza/marka adları zara mavi vs 
/// İleride dropdown'dan  aratıp seçeceğimiz  markaları burada tutucaz.
/// </summary>
public class Brand
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }

    /// <summary>
    /// Pasife alınan bir marka, tenant onay formundaki dropdown'da artık görünmez
    /// ama geçmiş fiş/loyalty kayıtları fk bozulamdan kalır 
    /// </summary>
    public bool IsActive { get; set; } = true;

    public ICollection<Receipt> Receipts { get; set; } = new List<Receipt>();
    public ICollection<ConsumerLoyalty> Loyalties { get; set; } = new List<ConsumerLoyalty>();
}
