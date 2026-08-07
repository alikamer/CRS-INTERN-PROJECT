using CRS_INTERN_PROJECT.DTOs.Auth;

namespace CRS_INTERN_PROJECT.Services.Auth;

/// <summary>
/// AUTH TOKEN REFRESH
/// </summary>
public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);

    // REFRESHTOKEN------------
    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto); 
    Task<bool> RevokeTokenAsync(string refreshToken);
}
    