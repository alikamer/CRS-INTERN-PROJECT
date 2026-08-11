using System.Globalization;

namespace CRS_INTERN_PROJECT.DTOs.Auth;

/// <summary>
/// Sisteme dışarıdan kayıt olmak isteyenlerin (Vatandaşların) göndereceği veri kalıbı.
/// Şimdilik sadece e-posta ve şifre yeterli, gereksiz detaylarla yormuyoruz+
/// mail+phonenum+firstname+lastname eklendi
/// </summary>
public class RegisterDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName {get;set;} = string.Empty;
    public string LastName {get;set;} = string.Empty;
    public string PhoneNumber {get;set;} = string.Empty;
    
}

