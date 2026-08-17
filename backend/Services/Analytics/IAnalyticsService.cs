using CRS_INTERN_PROJECT.DTOs.Analytics;

namespace CRS_INTERN_PROJECT.Services.Analytics
{
    public interface IAnalyticsService
    {
        Task<CorporateAnalyticsDto> GetCorporateDashboardAsync(Guid tenantId);
        Task<CustomerInsightsDto> GetCustomerInsightsAsync(Guid tenantId, Guid? overrideBrandId, bool allBrands);
    }
}