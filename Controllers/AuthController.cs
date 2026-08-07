using CRS_INTERN_PROJECT.DTOs.Auth;
using CRS_INTERN_PROJECT.Services.Auth;
using Microsoft.AspNetCore.Mvc;

namespace CRS_INTERN_PROJECT.Controllers;

/// <summary>
/// Kullanıcı kayıt, giriş, token yenileme ve oturum kapatma isteklerini karşılayan Controller.
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var response = await _authService.RegisterAsync(dto);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Kullanıcı e-posta ve şifre doğrulaması yapar, Access ve Refresh token döner.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var response = await _authService.LoginAsync(dto);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Süresi dolmuş Access token yerine verilen Refresh token ile oturumu yeniler.
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        try
        {
            var response = await _authService.RefreshTokenAsync(dto);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    
    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequestDto dto)
    {
        try
        {
            var result = await _authService.RevokeTokenAsync(dto.RefreshToken);
            if (!result)
            {
                return BadRequest(new { Message = "Geçersiz veya bulunamayan token." });
            }
            return Ok(new { Message = "Oturum başarıyla kapatıldı ve token iptal edildi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
