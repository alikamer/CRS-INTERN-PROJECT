using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CRS_INTERN_PROJECT.DTOs;
using CRS_INTERN_PROJECT.Services;
using Microsoft.AspNetCore.Http; 
using System.IO;

namespace CRS_INTERN_PROJECT.Controllers;

[Authorize] 
[ApiController]
[Route("api/[controller]")]
public class ReceiptsController : ControllerBase
{
    private readonly IReceiptService _receiptService;

    public ReceiptsController(IReceiptService receiptService)
    {
        _receiptService = receiptService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private Guid GetTenantId() => Guid.Parse(User.FindFirstValue("tenantId")!);

    [HttpPost]
    public async Task<ActionResult<ReceiptWithReceiptItemsDto>> CreateReceipt([FromBody] CreateReceiptDto dto)
    {
        var result = await _receiptService.CreateReceiptAsync(dto, GetUserId(), GetTenantId());
        return CreatedAtAction(nameof(GetReceiptById), new { id = result.Receipt.Id }, result);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReceiptDto>>> GetAllReceipts()
    {
        var result = await _receiptService.GetAllReceiptsAsync(GetTenantId());
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ReceiptWithReceiptItemsDto>> GetReceiptById(Guid id)
    {
        var result = await _receiptService.GetReceiptByIdAsync(id, GetTenantId());
        if (result == null) return NotFound($"Receipt with ID {id} not found.");
        
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteReceipt(Guid id)
    {
        var success = await _receiptService.DeleteReceiptAsync(id, GetTenantId());
        if (!success) return NotFound($"Receipt with ID {id} not found or you don't have permission.");
        
        return NoContent();
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("Dosya bulunamadı.");
        
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "receipts");
        Directory.CreateDirectory(uploadsFolder); 
        
        var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);
        
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }
        
        return Ok(new { ImagePath = $"/uploads/receipts/{uniqueFileName}" });
    }
}
