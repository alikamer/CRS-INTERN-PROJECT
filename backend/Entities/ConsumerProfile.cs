namespace CRS_INTERN_PROJECT.Entities;

/// <summary>
/// Milyonlarca vatandaşın  kişisel detaylarının olduğu profil tablosu.
/// Fiş yükleyip puan kazanacak olan asıl kitle burası. Şirketlere satacağımız bütün RFM ve Big Data buradan beslenecek.
/// İleride içerik olarak zenginleştirilebilir,*
/// </summary>
public class ConsumerProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AppUserId { get; set; }
    
    /// <summary>
    /// Şirketlerin demografik analizleri için (Örn: 20-25 yaş arası ne alıyor) çok kritik.
    /// </summary>
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? City { get; set; }
    public string? IncomeLevel { get; set; }
    
    public AppUser AppUser { get; set; } = null!;
    public ICollection<Receipt> Receipts { get; set; } = new List<Receipt>();
    public ICollection<ConsumerLoyalty> Loyalties { get; set; } = new List<ConsumerLoyalty>();
    public ICollection<Coupon> Coupons { get; set; } = new List<Coupon>();
}
