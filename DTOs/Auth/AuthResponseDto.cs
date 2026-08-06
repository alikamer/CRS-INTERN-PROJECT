namespace CRS_INTERN_PROJECT.DTOs.Auth;

/// <summary>
/// Başarılı giriş ardından return edilen yanıt
/// İçinde Token var oto girecek
/// </summary>
public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
