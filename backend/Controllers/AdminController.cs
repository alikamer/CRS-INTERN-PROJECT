using CRS_INTERN_PROJECT.DTOs.Admin;
using CRS_INTERN_PROJECT.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRS_INTERN_PROJECT.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    /// <summary>
    /// Onay bekleyen tüm fişleri detaylı getirir.
    /// </summary>
    [HttpGet("pending-receipts")]
    public async Task<IActionResult> GetPendingReceipts()
    {
        try
        {
            var pendingList = await _adminService.GetPendingReceiptsAsync();
            return Ok(pendingList);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    
    [HttpPost("receipts/{receiptId}/items")]
    public async Task<IActionResult> AddReceiptItem(Guid receiptId, [FromBody] AddReceiptItemDto dto)
    {
        try
        {
            await _adminService.AddReceiptItemAsync(receiptId, dto);
            return Ok(new { Message = "Ürün kalemi fişe başarıyla eklendi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Bekleyen fişi onaylar ve vatandaşa sadakat puanı aktarır.
    /// </summary>
    [HttpPost("receipts/{receiptId}/approve")]
    public async Task<IActionResult> ApproveReceipt(Guid receiptId)
    {
        try
        {
            await _adminService.ApproveReceiptAsync(receiptId);
            return Ok(new { Message = "Fiş başarıyla onaylandı ve puan yüklendi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Onay bekleyen şirket başvurularını, admin telefonla doğrulasın diye iletişim bilgileriyle getirir.
    /// </summary>
    [HttpGet("pending-tenants")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetPendingTenants()
    {
        try
        {
            var pendingTenants = await _adminService.GetPendingTenantsAsync();
            return Ok(pendingTenants);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Telefonla doğrulanan şirket başvurusunu onaylar; marka ve abonelik paketi burada atanır.
    /// </summary>
    [HttpPost("tenants/{tenantId}/approve")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> ApproveTenant(Guid tenantId, [FromBody] ApproveTenantDto dto)
    {
        try
        {
            await _adminService.ApproveTenantAsync(tenantId, dto);
            return Ok(new { Message = "Şirket başvurusu onaylandı, hesap aktif edildi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Uygun görülmeyen şirket başvurusunu reddeder.
    /// </summary>
    [HttpPost("tenants/{tenantId}/reject")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> RejectTenant(Guid tenantId)
    {
        try
        {
            await _adminService.RejectTenantAsync(tenantId);
            return Ok(new { Message = "Şirket başvurusu reddedildi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /*
    Onay formundaki marka dropdown'ı için sade marka listesi.
    */
    [HttpGet("brands")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetBrands()
    {
        try
        {
            var brands = await _adminService.GetBrandsAsync();
            return Ok(brands);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Tenant Yönetimi ekranı için, durumu ne olursa olsun
    /// tüm şirketleri listeler
    /// </summary>
    [HttpGet("tenants")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetAllTenants()
    {
        try
        {
            var tenants = await _adminService.GetAllTenantsAsync();
            return Ok(tenants);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Aktif bir tenant'ın abonelik paketini sonradan değiştirir.
    /// </summary>
    [HttpPost("tenants/{tenantId}/subscription")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> UpdateTenantSubscription(Guid tenantId, [FromBody] UpdateTenantSubscriptionDto dto)
    {
        try
        {
            await _adminService.UpdateTenantSubscriptionAsync(tenantId, dto);
            return Ok(new { Message = "Abonelik paketi güncellendi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
//aktif-> pasif
    [HttpPost("tenants/{tenantId}/deactivate")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> DeactivateTenant(Guid tenantId)
    {
        try
        {
            await _adminService.DeactivateTenantAsync(tenantId);
            return Ok(new { Message = "Şirket pasife alındı." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    
    // pasif--> aktif
  
    [HttpPost("tenants/{tenantId}/activate")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> ActivateTenant(Guid tenantId)
    {
        try
        {
            await _adminService.ActivateTenantAsync(tenantId);
            return Ok(new { Message = "Şirket tekrar aktif edildi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Marka Yönetimi ekranı için, aktif/pasif ayrımı yapmadan tüm markaları listeler.
    /// </summary>
    [HttpGet("brands/all")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetAllBrandsForManagement()
    {
        try
        {
            var brands = await _adminService.GetAllBrandsForManagementAsync();
            return Ok(brands);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    // create new brand
    [HttpPost("brands")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> CreateBrand([FromBody] BrandInputDto dto)
    {
        try
        {
            var brand = await _adminService.CreateBrandAsync(dto);
            return Ok(brand);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    //brand edit
    [HttpPut("brands/{brandId}")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> UpdateBrand(Guid brandId, [FromBody] BrandInputDto dto)
    {
        try
        {
            await _adminService.UpdateBrandAsync(brandId, dto);
            return Ok(new { Message = "Marka güncellendi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    
    [HttpPost("brands/{brandId}/deactivate")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> DeactivateBrand(Guid brandId)
    {
        try
        {
            await _adminService.DeactivateBrandAsync(brandId);
            return Ok(new { Message = "Marka pasife alındı." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    
    [HttpPost("brands/{brandId}/activate")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> ActivateBrand(Guid brandId)
    {
        try
        {
            await _adminService.ActivateBrandAsync(brandId);
            return Ok(new { Message = "Marka tekrar aktif edildi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
