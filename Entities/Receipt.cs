using CRS_INTERN_PROJECT.Enums;

namespace CRS_INTERN_PROJECT.Entities;

/// <summary>
/// Vatandaşın yüklediği fişin ana gövdesi. 
/// Sahtekarlığı önlemek için varsayılan olarak Pending olur, onaylanınca puan verir.
/// Onaylama işleminin nasıl olacağı ile ilgili kesin bir fikir yok ileride revize edilecek.
/// yani neye göre onaylanacak veya dolandırıcılık olduğu anlaşılacak
/// </summary>
public class Receipt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    /// <summary>
    /// Fişi sisteme sokan vatandaş. (Hesabı silinirse null kalır, fiş silinmez)
    /// </summary>
    public Guid? ConsumerProfileId { get; set; }
    
    /// <summary>
    /// Fişin hangi mağazadan/markadan alındığı (Dropdown'dan seçilecek).
    /// </summary>
    public Guid BrandId { get; set; }

    public DateTime ReceiptDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string? ImageUrl { get; set; }
    
    /// <summary>
    /// ı önlem: Fiş anında onaylanmaz, önce Pending'e düşer.
    /// </summary>
    public ReceiptStatus Status { get; set; } = ReceiptStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ConsumerProfile? ConsumerProfile { get; set; }
    public Brand Brand { get; set; } = null!;
    public ICollection<ReceiptItem> Items { get; set; } = new List<ReceiptItem>();
}
