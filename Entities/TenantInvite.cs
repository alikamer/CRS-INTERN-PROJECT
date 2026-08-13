namespace CRS_INTERN_PROJECT.Entities;

/// <summary>
/// Owner, henüz sistemde hesabı olmayan bir kişiyi maille davet ettiğinde buraya düşer.
/// O mailli kişi kayıt olduğu an bu satır silinip CorporateProfile'a dönüşür.
/// </summary>
public class TenantInvite
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Tenant Tenant { get; set; } = null!;
}
