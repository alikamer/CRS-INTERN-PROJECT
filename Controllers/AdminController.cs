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
}
