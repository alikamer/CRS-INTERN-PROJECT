using System.ComponentModel.DataAnnotations;
namespace CRS_INTERN_PROJECT.Entities;

public class RefreshToken
{
    public Guid Id {get;set;} = Guid.NewGuid();

    public Guid AppUserId {get;set;} //fk

    public string Token {get;set;} =string.Empty;

    public DateTime ExpiresAt {get;set;}

    public DateTime CreatedAt {get;set;} = DateTime.UtcNow;

    public DateTime? RevokedAt{get;set;}

    /// <summary>
    /// Token hala geçerli mi değil mi hesaplanır, iptal edildiyse ya da süresi dolduysa ture döner
    /// </summary>

    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;

    public AppUser AppUser {get;set;} = null!;


}   