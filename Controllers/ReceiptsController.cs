using System.Security.Claims;
using CRS_INTERN_PROJECT.DTOs.Receipt;
using CRS_INTERN_PROJECT.Services.Receipts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRS_INTERN_PROJECT.Controllers;

/// <summary>
/// Receipt  ile ilgili tüm API isteklerini karşılayar
/// JWT tokenin eşleşmiş olması şart
/// </summary>
[Route("api/[controller]")]
[ApiController]
[Authorize] // uygun jwt tokeni yoksa bu class'a giremez
public class ReceiptsController : ControllerBase
{
    private readonly IReceiptService _receiptService;

    public ReceiptsController(IReceiptService receiptService)
    {
        _receiptService = receiptService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadReceipt([FromForm] UploadReceiptDto dto)
    {
        try
        {
            // JWT Token'ın içinden claimli olan Kullanıcı ID'sini alıyoruz
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("Geçersiz kullanıcı kimliği.");
            }

            var receipt = await _receiptService.UploadReceiptAsync(dto, userId);

            return Ok(new { Message = "Fiş başarıyla yüklendi ve onaya (Pending) düştü.", ReceiptId = receipt.Id });
        }
        catch (Exception ex)
        {
            
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("my-receipts")]
    public async Task<IActionResult> GetMyReceipts()
    {
        try
        {
        
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                return Unauthorized("Geçersiz kullanıcı kimliği.");
            }

            var receipts = await _receiptService.GetMyReceiptsAsync(userId);
            return Ok(receipts);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("{receiptId}/approve")]

    public async Task<IActionResult> ApproveReceipt(Guid receiptId)
    {
        try
        {
            await _receiptService.ApproveReceiptAsync(receiptId);
            return Ok(new { Message = "Fiş başarıyla onaylandı ve vatandaşa puanı yüklendi!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
