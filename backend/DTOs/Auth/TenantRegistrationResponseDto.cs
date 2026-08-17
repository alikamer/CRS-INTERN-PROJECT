namespace CRS_INTERN_PROJECT.DTOs.Auth;

/// <summary>
/// Kurumsal kayıt başvurusu alındığında dönülen yanıt.
/// Token İÇERMEZ; başvuru onaylanana kadar bu hesapla login olunamaz! .
/// </summary>
public class TenantRegistrationResponseDto
{
    public Guid TenantId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
