using CRS_INTERN_PROJECT.DTOs;

    namespace CRS_INTERN_PROJECT.Services;

    public interface IReceiptService
    {
        Task<ReceiptWithReceiptItemsDto> CreateReceiptAsync(CreateReceiptDto dto, Guid
  userId, Guid tenantId);

        Task<PagedResult<ReceiptDto>> GetAllReceiptsAsync(Guid tenantId, int page = 1, int
  pageSize = 10);

        Task<ReceiptWithReceiptItemsDto?> GetReceiptByIdAsync(Guid id, Guid tenantId);

        Task<bool> DeleteReceiptAsync(Guid id, Guid tenantId);
    }