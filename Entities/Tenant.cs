using CRS_INTERN_PROJECT.Enums;

namespace CRS_INTERN_PROJECT.Entities;

/// <summary>
/// Sisteme abone olan, ücret ödeyip analizleri satın alan ana şirket (Müşterimiz).
/// </summary>
public class Tenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CompanyName { get; set; } = string.Empty;
    
    /// <summary>
    /// Normal aboneler sadece kendi markasını görürken, Premium'lar maskeli şekilde tüm pazarı görebilecek.
    /// bu kısım değiştirilebilir ileride kvkk'dan ötürü sonradan revize edilecek!!.
    /// </summary>
    public SubscriptionTier SubscriptionTier { get; set; }
    
    /// <summary>
    /// Eğer şirket Normal aboneyse ve sadece kendi markasını takip edecekse, bu ID üzerinden o markaya bağlanır.
    /// 
    /// </summary>
    public Guid? BrandId { get; set; }
    public Brand? Brand { get; set; }
    
    public ICollection<CorporateProfile> CorporateUsers { get; set; } = new List<CorporateProfile>();
}
