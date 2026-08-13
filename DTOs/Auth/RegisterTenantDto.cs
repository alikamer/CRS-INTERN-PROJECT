namespace CRS_INTERN_PROJECT.DTOs.Auth;

/// <summary>
/// Bir şirketin "Kurumsal olarak kayıt ol" formundan gönderdiği başvuru verisi.
/// Marka ve abonelik paketi burada YOK; onlar Admin onayı sırasında elle atanacak.
/// </summary>
public class RegisterTenantDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
