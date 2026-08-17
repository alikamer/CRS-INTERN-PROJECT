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
            var (targetTenantId, errorResult) = await ResolveTenantIdAsync(tenantId);
            if (errorResult != null)
            {
                return errorResult;
            }

            try
            {
                var result = await _analyticsService.GetCorporateDashboardAsync(targetTenantId!.Value);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("customer-insights")]
        public async Task<ActionResult<CustomerInsightsDto>> GetCustomerInsights(
            [FromQuery] Guid? tenantId,
            [FromQuery] Guid? brandId,
            [FromQuery] bool allBrands = false)
        {
            var (targetTenantId, errorResult) = await ResolveTenantIdAsync(tenantId);
            if (errorResult != null)
            {
                return errorResult;
            }

            try
            {
                var result = await _analyticsService.GetCustomerInsightsAsync(targetTenantId!.Value, brandId, allBrands);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("brands")]
        public async Task<ActionResult<List<BrandOptionDto>>> GetInsightsBrands()
        {
            var brands = await _context.Brands
                .Where(b => b.IsActive)
                .OrderBy(b => b.Name)
                .Select(b => new BrandOptionDto { Id = b.Id, Name = b.Name })
                .ToListAsync();

            return Ok(brands);
        }

        private async Task<(Guid? TenantId, ActionResult? ErrorResult)> ResolveTenantIdAsync(Guid? tenantId)
        {
            if (tenantId.HasValue && tenantId.Value != Guid.Empty)
            {
                return (tenantId.Value, null);
            }

            // JWT Token'dan giriş yapan kullanıcının ID'sini alıyoruz
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out var userId))
            {
                return (null, Unauthorized("Geçersiz kullanıcı kimliği."));
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
                    return (null, NotFound("Sistemde henüz kayıtlı bir Kurumsal Şirket (Tenant) bulunmamaktadır."));
                }
                return (firstTenant.Id, null);
            }

            return (corpProfile.TenantId, null);
        }
    }
}
