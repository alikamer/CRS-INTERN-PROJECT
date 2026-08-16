using System.Security.Claims;
using CRS_INTERN_PROJECT.Services.Coupon;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRS_INTERN_PROJECT.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Consumer")]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService)
    {
        _couponService = couponService;
    }

    [HttpGet("my-coupons")]
    public async Task<IActionResult> GetMyCoupons()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var appUserId))
        {
            return Unauthorized("Kullanıcı kimliği doğrulanamadı.");
        }

        var coupons = await _couponService.GetMyCouponsAsync(appUserId);
        return Ok(coupons);
    }

    [HttpPost("{couponId}/redeem")]
    public async Task<IActionResult> RedeemCoupon(Guid couponId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var appUserId))
        {
            return Unauthorized("Kullanıcı kimliği doğrulanamadı.");
        }

        try
        {
            var result = await _couponService.RedeemCouponAsync(appUserId, couponId);
            if (!result)
            {
                return BadRequest("Kupon kullanılırken bir hata oluştu.");
            }

            return Ok(new { message = "Kupon başarıyla kullanıldı." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
