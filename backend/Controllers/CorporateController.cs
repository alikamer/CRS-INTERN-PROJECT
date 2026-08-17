using System.Security.Claims;
using CRS_INTERN_PROJECT.DTOs.Corporate;
using CRS_INTERN_PROJECT.Services.Corporate;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRS_INTERN_PROJECT.Controllers;

/// <summary>
/// Kurumsal kullanıcının kendi şirket ekibini görüp yönetmesi (Owner ise ekip üyesi ekleyebilir).
/// </summary>
[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "CorporateUser")]
public class CorporateController : ControllerBase
{
    private readonly ICorporateService _corporateService;

    public CorporateController(ICorporateService corporateService)
    {
        _corporateService = corporateService;
    }

    [HttpGet("team")]
    public async Task<IActionResult> GetTeam()
    {
        try
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var appUserId))
            {
                return Unauthorized("Geçersiz kullanıcı kimliği.");
            }

            var team = await _corporateService.GetTeamAsync(appUserId);
            return Ok(team);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("team/invite")]
    public async Task<IActionResult> InviteTeamMember([FromBody] InviteTeamMemberDto dto)
    {
        try
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var appUserId))
            {
                return Unauthorized("Geçersiz kullanıcı kimliği.");
            }

            await _corporateService.InviteTeamMemberAsync(appUserId, dto);
            return Ok(new { Message = "Ekip üyesi eklendi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
