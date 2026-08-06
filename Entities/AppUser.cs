using CRS_INTERN_PROJECT.Enums;

namespace CRS_INTERN_PROJECT.Entities;

/// <summary>
/// Sisteme giriş yapan herkesin  tutulduğu ana tablo. 
/// Detaylar yok sadece temel giriş bilgileri var ordan sonra dallanıyor
/// </summary>
public class AppUser
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    /// <summary>
    /// Kullanıcının giriş yapacağı email adresi.
    /// </summary>
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    
    /// <summary>
    /// Bu eleman Vatandaş mı (Consumer), yoksa Şirket Yetkilisi mi (CorporateUser) olduğunu belirleyen rol.
    /// </summary>
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ConsumerProfile? ConsumerProfile { get; set; }
    public CorporateProfile? CorporateProfile { get; set; }
}
