using System.Security.Claims;
using CRS_INTERN_PROJECT.DTOs.Consumer;
using CRS_INTERN_PROJECT.Services.Consumer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRS_INTERN_PROJECT.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Consumer")] // Sadece Consumer yetkisine sahip olanlar bu isteği atabilir
public class ConsumerController : ControllerBase
{
    private readonly IConsumerService _consumerService;

    public ConsumerController(IConsumerService consumerService)
    {
        _consumerService = consumerService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var appUserId))
        {
            return Unauthorized("Kullanıcı kimliği doğrulanamadı.");
        }

        var profile = await _consumerService.GetProfileAsync(appUserId);
        
        if (profile == null)
        {
            return NotFound("Profil bulunamadı.");
        }

        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateConsumerProfileDto dto)
    {
        /*
         İsteği atan kişinin JWT Token'ı içinden ID'sini güvenli bir şekilde alıyoruz.
         Frontend'den ID almayız, çünkü başkasının ID'sini gönderip onu güncelleyebilirler.
         */
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier); //FindFirstValue metodu!! - JWT içindeki ID'yi okur
        
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var appUserId))
        {
            return Unauthorized("Kullanıcı kimliği doğrulanamadı.");
        }




//service 'e gider
        var result = await _consumerService.UpdateProfileAsync(appUserId, dto);

        if (!result)
        {
            return BadRequest("Profil güncellenirken bir hata oluştu. Kullanıcı bulunamamış olabilir.");
        }

        return Ok(new { message = "Profil başarıyla güncellendi." });
    }
}
