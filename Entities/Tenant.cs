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
    /// Şirket kendi kendine kayıt olduğunda WaitingForApproval'da düşer.
    /// SystemAdmin telefonla doğrulayıp onaylayana kadar bu tenanta bağlı hiçbir CorporateUser giriş yapamaz.
    /// </summary>
    public TenantStatus Status { get; set; } = TenantStatus.WaitingForApproval;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Normal aboneler sadece kendi markasını görürken, Premium'lar maskeli şekilde tüm pazarı görebilecek.
    /// bu kısım değiştirilebilir ileride kvkk'dan ötürü sonradan revize edilecek!!.
    /// Kayıt sırasında değil, Admin onay verirken elle atanır (satış süreci sonucu belli oluyor).
    /// </summary>
    public SubscriptionTier SubscriptionTier { get; set; }

    /// <summary>
    /// Eğer şirket Normal aboneyse ve sadece kendi markasını takip edecekse, bu ID üzerinden o markaya bağlanır.
    /// Kayıt sırasında değil, Admin onay verirken elle atanır.
    /// </summary>
    public Guid? BrandId { get; set; }
    public Brand? Brand { get; set; }

    public ICollection<CorporateProfile> CorporateUsers { get; set; } = new List<CorporateProfile>();
}
