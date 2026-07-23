namespace CRS_INTERN_PROJECT.DTOs;

public class ReceiptDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    
    public string StoreName { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    public decimal TotalAmount { get; set; }
    
    public string Status { get; set; } = string.Empty;
    public string? ImagePath { get; set; }
    
    public Guid? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAt { get; set; }
    
    public DateTime CreatedAt { get; set; }
}
