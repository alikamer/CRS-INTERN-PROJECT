namespace CRS_INTERN_PROJECT.DTOs.Admin;

/// <summary>
/// Zaten aktif olan bir tenant'ın abonelik paketini sonradan değiştirmek için kullanılır.
/// Marka atama burada yok — marka sadece ilk onayda (ApproveTenantDto ile) atanıyor.
/// Bu kısımda sadece subTier değişir
/// </summary>
public class UpdateTenantSubscriptionDto
{
    public string SubscriptionTier { get; set; } = string.Empty;
}
