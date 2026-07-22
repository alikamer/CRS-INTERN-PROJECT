namespace CRS_INTERN_PROJECT.Entities;

public class Tenant
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;
    public string SubscriptionTier { get; set; } = "Basic"; 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ilişkileri tanımlayalım one-to-many vs tarzı
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Receipt> Receipts { get; set; } = new List<Receipt>();
}
