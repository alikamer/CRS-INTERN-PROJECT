using CRS_INTERN_PROJECT.Enums;

namespace CRS_INTERN_PROJECT.Entities;

/// <summary>
/// Bir vatandaşın her 5 onaylı fişte kazandığı indirim kuponu. O 5 fişin marka dağılımına
/// göre hem indirim oranı hem de kuponun BrandId'si belirlenir:
/// baskın marka 3-4-5 fişe sahipse kupon o markaya bağlanır (%10/%15/%20), aksi halde
/// BrandId boş kalır ve kupon abone markaların tümünde geçerli genel bir kupon olur (%5).
/// </summary>
public class Coupon
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConsumerProfileId { get; set; }

    public Guid? BrandId { get; set; }

    public string Code { get; set; } = string.Empty;
    public int DiscountPercentage { get; set; }
    public CouponStatus Status { get; set; } = CouponStatus.Active;
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RedeemedAt { get; set; }

    public ConsumerProfile ConsumerProfile { get; set; } = null!;
    public Brand? Brand { get; set; }
}
