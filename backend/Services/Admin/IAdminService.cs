using CRS_INTERN_PROJECT.DTOs.Admin;

namespace CRS_INTERN_PROJECT.Services.Admin;

//DI
public interface IAdminService
{
    Task<List<PendingReceiptDto>> GetPendingReceiptsAsync();
    Task<bool> AddReceiptItemAsync(Guid receiptId, AddReceiptItemDto dto);
    Task<bool> ApproveReceiptAsync(Guid receiptId);

    Task<List<PendingTenantDto>> GetPendingTenantsAsync();
    Task<bool> ApproveTenantAsync(Guid tenantId, ApproveTenantDto dto);
    Task<bool> RejectTenantAsync(Guid tenantId);
    Task<List<BrandOptionDto>> GetBrandsAsync();

    Task<List<TenantOverviewDto>> GetAllTenantsAsync();
    Task<bool> UpdateTenantSubscriptionAsync(Guid tenantId, UpdateTenantSubscriptionDto dto);
    Task<bool> DeactivateTenantAsync(Guid tenantId);
    Task<bool> ActivateTenantAsync(Guid tenantId);

    Task<List<BrandManagementDto>> GetAllBrandsForManagementAsync();
    Task<BrandManagementDto> CreateBrandAsync(BrandInputDto dto);
    Task<bool> UpdateBrandAsync(Guid brandId, BrandInputDto dto);
    Task<bool> DeactivateBrandAsync(Guid brandId);
    Task<bool> ActivateBrandAsync(Guid brandId);
}
