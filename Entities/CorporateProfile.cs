    namespace CRS_INTERN_PROJECT.Entities;

/// <summary>
/// Şirket yetkilileri (B2B Müşteriler) giriş yaptığında B2B panelini görecek ilgili kişiler.
/// Kısaca bunlar fiş yüklemez, analizlere bakar fiş yükleyenlerin datalarına erişir vs asıl olay burada..
/// </summary>
public class CorporateProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AppUserId { get; set; }
    
    /// <summary>
    /// Bu çalışanın hangi şirkete (Müşterimize) ait olduğunu gösteren bağ.
    /// </summary>
    public Guid TenantId { get; set; }
    
    public string? Department { get; set; }
    
    public AppUser AppUser { get; set; } = null!;
    public Tenant Tenant { get; set; } = null!;
}
