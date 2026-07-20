namespace CRS_INTERN_PROJECT.Entities;

// Users tablosu 
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TenantId { get; set; }  // FK tenanta bağlı 
    
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;

    // Daha önce oluşturduğumuz Enum
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // İlişkiler
    public Tenant? Tenant { get; set; }
    public ICollection<Receipt> SubmittedReceipts { get; set; } = new List<Receipt>();
    public ICollection<Receipt> ReviewedReceipts { get; set; } = new List<Receipt>();
}
