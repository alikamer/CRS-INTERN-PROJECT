namespace CRS_INTERN_PROJECT.DTOs.Admin;

/// <summary>
/// Admin'in Tenant yönetimi ekranında gördüğü satır. Sadece bekleyenleri değil,
/// durumu ne olursa olsun (Active/Rejected/Inactive) tüm şirketleri kapsar.
/// </summary>
public class TenantOverviewDto
{
    public Guid TenantId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string SubscriptionTier { get; set; } = string.Empty;
    public string? BrandName { get; set; }
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
