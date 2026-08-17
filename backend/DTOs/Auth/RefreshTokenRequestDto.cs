namespace CRS_INTERN_PROJECT.DTOs.Auth;

/// <summary>
/// Token yenileme isteğinde gönderilen DTO.
/// </summary>
public class RefreshTokenRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
}
