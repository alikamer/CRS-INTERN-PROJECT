namespace CRS_INTERN_PROJECT.Entities;

// FİŞ BİLGİLERİ TABLOSU
public class Receipt
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // f keyss
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }

    public string StoreName { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    public decimal TotalAmount { get; set; }

    // enumlar (daha önce yazdık)
    public ReceiptStatus Status { get; set; } = ReceiptStatus.Pending;
    public string? ImagePath { get; set; }

    // Admin İnceleme Bilgileri
    public Guid? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // RS
    public Tenant? Tenant { get; set; }
    public User? User { get; set; }
    public User? ReviewedByUser { get; set; }

    public ICollection<ReceiptItem> Items { get; set; } = new List<ReceiptItem>();
}
