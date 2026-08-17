using CRS_INTERN_PROJECT.Enums;

namespace CRS_INTERN_PROJECT.Entities;

///<
/// Sisteme giriş yapan herkesin bilgilerinin tutulduğu ana tablo.
/// 
/// </summary>
public class AppUser
{
    public Guid Id { get; set; } = Guid.NewGuid();


/* Kullanıcının zorunlu doldurması gereken bilgiler, 11.08
*/
    public string FirstName {get;set;} = string.Empty;
    public string LastName {get;set;}=string.Empty;
    public string PhoneNumber {get;set;} = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;


    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ConsumerProfile? ConsumerProfile { get; set; }
    public CorporateProfile? CorporateProfile { get; set; }

    /// <summary>
    /// bir kullanıcı birden çok cihazla sisteme giriş yapabilir dolayısıyla,
    /// eski tokenleri de olabilir 1-to-n ilişki kurduk
    /// </summary>
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>(); 
}
