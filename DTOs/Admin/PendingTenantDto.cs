namespace CRS_INTERN_PROJECT.DTOs.Admin;

/// <summary>
/// Onay bekleyen şirket (Tenant) başvurusu. Admin'in telefonla ulaşıp doğrulaması için
/// başvuruyu yapan kişinin iletişim bilgileri de dahil edilir.
/// </summary>
public class PendingTenantDto
{
    public Guid TenantId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public string ContactFirstName { get; set; } = string.Empty;
    public string ContactLastName { get; set; } = string.Empty;
    public string ContactPhoneNumber { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
}

/// <summary>
/// Admin, telefonla doğruladıktan sonra şirketi onaylarken marka ve abonelik paketini elle atar.
/// </summary>
public class ApproveTenantDto
{
    public Guid BrandId { get; set; }
    public string SubscriptionTier { get; set; } = string.Empty;
}

/// <summary>
/// Onay formundaki marka dropdown'ı için kullanılan sade marka listesi.
/// </summary>
public class BrandOptionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
