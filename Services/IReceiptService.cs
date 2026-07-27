using CRS_INTERN_PROJECT.DTOs;

namespace CRS_INTERN_PROJECT.Services;

public interface IReceiptService
{
    Task<ReceiptWithReceiptItemsDto> CreateReceiptAsync(CreateReceiptDto dto);
    Task<IEnumerable<ReceiptDto>> GetAllReceiptsAsync();
    Task<ReceiptWithReceiptItemsDto?> GetReceiptByIdAsync(Guid id);
    Task<bool> DeleteReceiptAsync(Guid id);
}
