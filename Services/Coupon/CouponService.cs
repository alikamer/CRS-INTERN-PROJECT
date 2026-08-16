using CRS_INTERN_PROJECT.Data;
using CRS_INTERN_PROJECT.DTOs.Coupon;
using CRS_INTERN_PROJECT.Enums;
using Microsoft.EntityFrameworkCore;
using CouponEntity = CRS_INTERN_PROJECT.Entities.Coupon;

namespace CRS_INTERN_PROJECT.Services.Coupon;

/// <note>
/// Kupon karar modeli: her 5 onaylı fişte (marka fark etmeksizin) bir kupon üretir, o 5
/// fişin marka dağılımına göre indirim oranını ve kuponun hangi markaya bağlı olacağını
/// belirler. Eşik/oranlar bugün MVP için sabit — ileride kullanıcı bazlı bir kampanya
/// motoruna (alışveriş sıklığı, marka sadakati vb. parametrelerle) devredilebilir; o zaman
/// değişecek olan tek yer burası, çağıran kod (AdminService) bu detaydan habersiz.
/// </note>
public class CouponService : ICouponService
{
    private const int CouponThresholdReceiptCount = 5;
    private const int CouponValidityDays = 30;
    private const int GeneralCouponDiscountPercentage = 5;

    /// <summary>
    /// 5 fişlik bir bloktaki baskın markanın tekrar sayısına göre indirim oranı.
    /// 3'ten az tekrar varsa-> alışveirşler farklıysa, genel kupon GeneralCouponDiscountPercentage verilir.
    /// </summary>
    private static readonly Dictionary<int, int> DominantBrandDiscountRates = new()
    {
        { 5, 20 },
        { 4, 15 },
        { 3, 10 }
    };

    private readonly AppDbContext _context;

    public CouponService(AppDbContext context)
    {
        _context = context;
    }

    public async Task IssueCouponsIfEligibleAsync(Guid consumerProfileId)
    {
        var unrewardedReceipts = await _context.Receipts
            .Where(r => r.ConsumerProfileId == consumerProfileId
                     && r.Status == ReceiptStatus.Approved
                     && !r.IsRewarded)
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        var processedAny = false;
        var offset = 0;

        while (unrewardedReceipts.Count - offset >= CouponThresholdReceiptCount)
        {
            var block = unrewardedReceipts.Skip(offset).Take(CouponThresholdReceiptCount).ToList();
            offset += CouponThresholdReceiptCount;
            processedAny = true;

            var dominantGroup = block
                .GroupBy(r => r.BrandId)
                .OrderByDescending(g => g.Count())
                .First();

            var isBrandLoyal = DominantBrandDiscountRates.TryGetValue(dominantGroup.Count(), out var loyalDiscount);

            foreach (var receipt in block)
            {
                receipt.IsRewarded = true;
            }

            _context.Coupons.Add(new CouponEntity
            {
                ConsumerProfileId = consumerProfileId,
                BrandId = isBrandLoyal ? dominantGroup.Key : null,
                Code = GenerateCouponCode(),
                DiscountPercentage = isBrandLoyal ? loyalDiscount : GeneralCouponDiscountPercentage,
                Status = CouponStatus.Active,
                IssuedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(CouponValidityDays)
            });
        }

        if (processedAny)
        {
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<CouponDto>> GetMyCouponsAsync(Guid appUserId)
    {
        var consumerProfile = await _context.ConsumerProfiles
            .FirstOrDefaultAsync(cp => cp.AppUserId == appUserId);

        if (consumerProfile == null)
        {
            return new List<CouponDto>();
        }

        var coupons = await _context.Coupons
            .Include(c => c.Brand)
            .Where(c => c.ConsumerProfileId == consumerProfile.Id)
            .OrderByDescending(c => c.IssuedAt)
            .ToListAsync();

        var expiredJustNow = coupons.Where(c => c.Status == CouponStatus.Active && c.ExpiresAt < DateTime.UtcNow).ToList();
        if (expiredJustNow.Count > 0)
        {
            foreach (var coupon in expiredJustNow)
            {
                coupon.Status = CouponStatus.Expired;
            }
            await _context.SaveChangesAsync();
        }

        return coupons.Select(c => new CouponDto
        {
            Id = c.Id,
            Code = c.Code,
            DiscountPercentage = c.DiscountPercentage,
            BrandName = c.Brand?.Name,
            Status = c.Status.ToString(),
            IssuedAt = c.IssuedAt,
            ExpiresAt = c.ExpiresAt,
            RedeemedAt = c.RedeemedAt
        }).ToList();
    }

    public async Task<bool> RedeemCouponAsync(Guid appUserId, Guid couponId)
    {
        var consumerProfile = await _context.ConsumerProfiles
            .FirstOrDefaultAsync(cp => cp.AppUserId == appUserId);

        if (consumerProfile == null)
        {
            return false;
        }

        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Id == couponId && c.ConsumerProfileId == consumerProfile.Id);

        if (coupon == null)
        {
            throw new Exception("Böyle bir kupon bulunamadı.");
        }

        if (coupon.Status == CouponStatus.Expired || (coupon.Status == CouponStatus.Active && coupon.ExpiresAt < DateTime.UtcNow))
        {
            coupon.Status = CouponStatus.Expired;
            await _context.SaveChangesAsync();
            throw new Exception("Bu kuponun süresi dolmuş.");
        }

        if (coupon.Status != CouponStatus.Active)
        {
            throw new Exception("Bu kupon zaten kullanılmış.");
        }

        coupon.Status = CouponStatus.Redeemed;
        coupon.RedeemedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    private static string GenerateCouponCode()
    {
        return $"CRS-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
    }
}
