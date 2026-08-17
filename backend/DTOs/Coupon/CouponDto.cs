namespace CRS_INTERN_PROJECT.DTOs.Coupon;

/// <summary>
/// Tüketicinin "Kuponlarım" ekranında gördüğü satır.
/// </summary>
public class CouponDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public int DiscountPercentage { get; set; }

    /// <summary>
    /// Null ise kupon genel bir kupondur (sisteme abone tüm markalarda geçerli).
    /// </summary>
    public string? BrandName { get; set; }

    public string Status { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RedeemedAt { get; set; }
}
