using CRS_INTERN_PROJECT.DTOs.Receipt;

namespace CRS_INTERN_PROJECT.Services.Receipts;

/// <summary>
/// fiş Interface'i.
/// </summary>
public interface IReceiptService
{
    Task<Entities.Receipt> UploadReceiptAsync(UploadReceiptDto dto, Guid appUserId);
    
    /// <summary>
    /// Bugüne kadar yüklediği tüm fişlerin listesi
    /// </summary>
    Task<List<ReceiptDto>> GetMyReceiptsAsync(Guid appUserId);
    
    /// <summary>
    /// Fişi approve olduktan sonra kullanıcıya  puan verdiğimiz servis
    /// </summary>
    Task<bool> ApproveReceiptAsync(Guid receiptId);
}
