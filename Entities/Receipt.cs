using CRS_INTERN_PROJECT.Enums;

namespace CRS_INTERN_PROJECT.Entities;

public class Receipt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }

    public string StoreName { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    public decimal TotalAmount { get; set; }

    public ReceiptStatus Status { get; set; } = ReceiptStatus.Pending;
    public string? ImagePath { get; set; }

    public Guid? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Tenant? Tenant { get; set; }
    public User? User { get; set; }
    public User? ReviewedByUser { get; set; }

    public ICollection<ReceiptItem> Items { get; set; } = new List<ReceiptItem>();
}
