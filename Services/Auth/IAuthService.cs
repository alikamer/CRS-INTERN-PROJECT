using CRS_INTERN_PROJECT.DTOs.Auth;

namespace CRS_INTERN_PROJECT.Services.Auth;


public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
}
