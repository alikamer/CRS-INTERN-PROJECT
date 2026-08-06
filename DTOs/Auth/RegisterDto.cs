namespace CRS_INTERN_PROJECT.DTOs.Auth;

/// <summary>
/// Sisteme dışarıdan kayıt olmak isteyenlerin (Vatandaşların) göndereceği veri kalıbı.
/// Şimdilik sadece e-posta ve şifre yeterli, gereksiz detaylarla yormuyoruz
/// </summary>
public class RegisterDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
