using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CRS_INTERN_PROJECT.DTOs;
using CRS_INTERN_PROJECT.Services;

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

    [HttpPost]
    public async Task<ActionResult<ReceiptWithReceiptItemsDto>> CreateReceipt([FromBody] CreateReceiptDto dto)
    {
        if (dto == null)
        {
            return BadRequest("Receipt data is required.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _receiptService.CreateReceiptAsync(dto);
        return CreatedAtAction(nameof(GetReceiptById), new { id = result.Receipt.Id }, result);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReceiptDto>>> GetAllReceipts()
    {
        var result = await _receiptService.GetAllReceiptsAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ReceiptWithReceiptItemsDto>> GetReceiptById(Guid id)
    {
        var result = await _receiptService.GetReceiptByIdAsync(id);
        if (result == null)
        {
            return NotFound($"Receipt with ID {id} not found.");
        }

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteReceipt(Guid id)
    {
        var success = await _receiptService.DeleteReceiptAsync(id);
        if (!success)
        {
            return NotFound($"Receipt with ID {id} not found.");
        }

        return NoContent();
    }
}
