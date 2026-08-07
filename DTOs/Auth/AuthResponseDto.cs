namespace CRS_INTERN_PROJECT.DTOs.Auth;

/// <summary>
/// Başarılılogin rgister ardından dönülen yanıt DTO'su.
/// </summary>
public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
