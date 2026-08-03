using CRS_INTERN_PROJECT.DTOs;

    namespace CRS_INTERN_PROJECT.Services;

    public interface IReceiptService
    {
        Task<ReceiptWithReceiptItemsDto> CreateReceiptAsync(CreateReceiptDto dto, Guid
  userId, Guid tenantId);

        Task<IEnumerable<ReceiptDto>> GetAllReceiptsAsync(Guid tenantId);

        Task<ReceiptWithReceiptItemsDto?> GetReceiptByIdAsync(Guid id, Guid tenantId);

        Task<bool> DeleteReceiptAsync(Guid id, Guid tenantId);
    }