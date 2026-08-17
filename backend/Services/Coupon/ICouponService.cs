using CRS_INTERN_PROJECT.DTOs.Coupon;

namespace CRS_INTERN_PROJECT.Services.Coupon;

public interface ICouponService
{
    Task IssueCouponsIfEligibleAsync(Guid consumerProfileId);
    Task<List<CouponDto>> GetMyCouponsAsync(Guid appUserId);
    Task<bool> RedeemCouponAsync(Guid appUserId, Guid couponId);
}
