using CRS_INTERN_PROJECT.DTOs.Admin;

namespace CRS_INTERN_PROJECT.Services.Admin;

//DI
public interface IAdminService
{
    Task<List<PendingReceiptDto>> GetPendingReceiptsAsync();
    Task<bool> AddReceiptItemAsync(Guid receiptId, AddReceiptItemDto dto);
    Task<bool> ApproveReceiptAsync(Guid receiptId);
}
