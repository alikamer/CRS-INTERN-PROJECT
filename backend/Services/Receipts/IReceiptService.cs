using CRS_INTERN_PROJECT.DTOs.Receipt;
using CRS_INTERN_PROJECT.DTOs.Common;


namespace CRS_INTERN_PROJECT.Services.Receipts;


// fiş Interface'i.

public interface IReceiptService
{
    Task<Entities.Receipt> UploadReceiptAsync(UploadReceiptDto dto, Guid appUserId);
    

    Task<PagedResult<ReceiptDto>> GetAllReceiptAsync(ReceiptFilterDto filter);

    /// <summary>
    /// Bugüne kadar yüklediği tüm fişlerin listesi
    /// </summary>
    Task<List<ReceiptDto>> GetMyReceiptsAsync(Guid appUserId);
}
