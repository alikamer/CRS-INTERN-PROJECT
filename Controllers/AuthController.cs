using CRS_INTERN_PROJECT.DTOs.Auth;
using CRS_INTERN_PROJECT.Services.Auth;
using Microsoft.AspNetCore.Mvc;

namespace CRS_INTERN_PROJECT.Controllers;

/// <summary>
/// gelen login ve register isteklerini kontrol edip ilgili service'e yönlendiririz.
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
            return Ok(response); // 200 OK ile token ve bilgileri dön
        }
        catch (Exception ex)
        {
           
            return BadRequest(new { Message = ex.Message });
        }
    }

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
            return Unauthorized(new { Message = ex.Message }); // 401 Unauthorized (Geçersiz yetki)
        }
    }
}
