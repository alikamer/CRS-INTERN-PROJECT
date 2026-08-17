using System.Security.Claims;
using CRS_INTERN_PROJECT.Data;
using CRS_INTERN_PROJECT.DTOs.Analytics;
using CRS_INTERN_PROJECT.Services.Analytics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRS_INTERN_PROJECT.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly AppDbContext _context;

        public AnalyticsController(IAnalyticsService analyticsService, AppDbContext context)
        {
            _analyticsService = analyticsService;
            _context = context;
        }

    
        [HttpGet("dashboard")]
        public async Task<ActionResult<CorporateAnalyticsDto>> GetDashboard([FromQuery] Guid? tenantId)
        {
            Guid targetTenantId;

            if (tenantId.HasValue && tenantId.Value != Guid.Empty)
            {
                targetTenantId = tenantId.Value;
            }
            else
            {
                // JWT Token'dan giriş yapan kullanıcının ID'sini alıyoruz
                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (!Guid.TryParse(userIdString, out var userId))
                {
                    return Unauthorized("Geçersiz kullanıcı kimliği.");
                }

                // Kullanıcıya ait CorporateProfile ve TenantId kaydını buluyoruz
                var corpProfile = await _context.CorporateProfiles
                    .FirstOrDefaultAsync(cp => cp.AppUserId == userId);

                if (corpProfile == null)
                {
                    // Fallback: Sistemdeki ilk Tenant'ı al veya Hata dön
                    var firstTenant = await _context.Tenants.FirstOrDefaultAsync();
                    if (firstTenant == null)
                    {
                        return NotFound("Sistemde henüz kayıtlı bir Kurumsal Şirket (Tenant) bulunmamaktadır.");
                    }
                    targetTenantId = firstTenant.Id;
                }
                else
                {
                    targetTenantId = corpProfile.TenantId;
                }
            }

            try
            {
                var result = await _analyticsService.GetCorporateDashboardAsync(targetTenantId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
