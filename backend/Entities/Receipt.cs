using CRS_INTERN_PROJECT.Enums;

namespace CRS_INTERN_PROJECT.Entities;

/// <summary>
/// Vatandaşın yüklediği fişin ana gövdesi. 
/// Varasyılan olarak pending olur sonrasında onay verilirse kullanılır
/// Onaylama işleminin nasıl olacağı ile ilgili kesin bir fikir yok ileride revize edilecek.
///fnote->Şuan demo halde onay işleminin otomatikleştirilmesi gerekiyor admin panelden elle yapılamaz.
/// yani neye göre onaylanacak veya dolandırıcılık olduğu anlaşılacak,(duplicate olrusa oto elenmesi vs gibi )
/// </summary>
public class Receipt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    /// <summary>
    /// Fişi sisteme sokan vatandaş. (Hesabı silinirse null kalır, fiş silinmez)
    /// temel prensip verileri saklamaktır burada sorun olur mu bilmiyorum kontrol edilsin
    /// </summary>
    public Guid? ConsumerProfileId { get; set; }
    
    /// <summary>
    /// Fişin hangi mağazadan/markadan alındığı (Dropdown'dan seçilecek).
    /// </summary>
    public Guid BrandId { get; set; }

    public DateTime ReceiptDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string? ImageUrl { get; set; }
    
//default pending
    public ReceiptStatus Status { get; set; } = ReceiptStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Bu fiş kupon karar motoru tarafından bir 5'li blokta değerlendirilip kupona
    /// dönüştürüldü mü?
    /// </summary>
    public bool IsRewarded { get; set; }

    public ConsumerProfile? ConsumerProfile { get; set; }
    public Brand Brand { get; set; } = null!;
    public ICollection<ReceiptItem> Items { get; set; } = new List<ReceiptItem>();
}
