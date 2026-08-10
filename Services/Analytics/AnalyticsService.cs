using CRS_INTERN_PROJECT.Data;
using CRS_INTERN_PROJECT.DTOs.Analytics;
using CRS_INTERN_PROJECT.Enums;
using Microsoft.EntityFrameworkCore;

namespace CRS_INTERN_PROJECT.Services.Analytics
{

    /// <summary>
    /// DB'den approved olan tüm fişleri çeker, harcamalara göre kategorilendirir,
    /// Toplam ciro hesaplar abonelik türüne göre pazar payı belirtir
    /// </summary>
    public class AnalyticsService : IAnalyticsService
    {
        private readonly AppDbContext _context;

        public AnalyticsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CorporateAnalyticsDto> GetCorporateDashboardAsync(Guid tenantId)
        {
            // 1. Tenant ve bağlı olduğu Marka bilgilerini veritabanından alıyoruz
            var tenant = await _context.Tenants
                .Include(t => t.Brand)
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null)
            {
                throw new KeyNotFoundException("Kurumsal şirket (Tenant) bulunamadı.");
            }

            // 2. Sadece ONAYLANMIŞ  fişleri analize dahil ediyoruz
            var approvedReceiptsQuery = _context.Receipts
                .Where(r => r.Status == ReceiptStatus.Approved);

            // Eğer şirketin tanımlı bir markası varsa o markanın fişlerini filtrele
            var tenantReceiptsQuery = tenant.BrandId.HasValue
                ? approvedReceiptsQuery.Where(r => r.BrandId == tenant.BrandId.Value)
                : approvedReceiptsQuery;

            //3. temel hesaplamalar
            var totalReceiptCount = await tenantReceiptsQuery.CountAsync();
            var totalRevenue = await tenantReceiptsQuery.SumAsync(r => (decimal?)r.TotalAmount) ?? 0m;
            var averageBasket = totalReceiptCount > 0 ? totalRevenue / totalReceiptCount : 0m;

            // 4. Kategori Bazlı Harcama Dağılımı
            var categoryBreakdown = await tenantReceiptsQuery
                .SelectMany(r => r.Items)
                .GroupBy(i => i.ProductCategory ?? "Genel / Diğer")
                .Select(g => new
                {
                    CategoryName = g.Key,
                    TotalAmount = g.Sum(i => i.TotalPrice)
                })
                .ToListAsync();

            var totalCategoryRevenue = categoryBreakdown.Sum(c => c.TotalAmount);

            var categoryDtos = categoryBreakdown.Select(c => new CategoryBreakdownDto
            {
                CategoryName = c.CategoryName,
                TotalAmount = c.TotalAmount,
                Percentage = totalCategoryRevenue > 0
                    ? Math.Round((double)(c.TotalAmount / totalCategoryRevenue * 100), 1)
                    : 0.0
            }).OrderByDescending(c => c.TotalAmount).ToList();

            // 5. Pazar Payı & Rakip Analizi (Tüm onaylı fişler üzerinden markalara göre), büyük veride iş görür
            var totalMarketRevenue = await approvedReceiptsQuery.SumAsync(r => (decimal?)r.TotalAmount) ?? 0m;

            var brandMarketData = await approvedReceiptsQuery
                .GroupBy(r => new { r.BrandId, r.Brand.Name })
                .Select(g => new
                {
                    BrandId = g.Key.BrandId,
                    BrandName = g.Key.Name,
                    TotalRevenue = g.Sum(r => r.TotalAmount)
                })
                .OrderByDescending(b => b.TotalRevenue)
                .ToListAsync();

            int competitorCounter = 1;
            var marketShareDtos = new List<MarketShareDto>();

            foreach (var b in brandMarketData)
            {
                bool isCurrentBrand = tenant.BrandId.HasValue && tenant.BrandId.Value == b.BrandId;
                double percentage = totalMarketRevenue > 0
                    ? Math.Round((double)(b.TotalRevenue / totalMarketRevenue * 100), 1)
                    : 0.0;

                // ABONELİK KURALLARI: Normal pakette rakip isimleri maskelenir,
                // Premium pakette gerçek isimler açılır.
                string displayBrandName;
                if (isCurrentBrand)
                {
                    displayBrandName = b.BrandName;
                }
                else if (tenant.SubscriptionTier == SubscriptionTier.Premium)
                {
                    displayBrandName = b.BrandName;
                }
                else
                {
                    displayBrandName = $"Rakip Marka {competitorCounter++}";
                }

                marketShareDtos.Add(new MarketShareDto
                {
                    BrandName = displayBrandName,
                    MarketSharePercentage = percentage,
                    IsCurrentBrand = isCurrentBrand
                });
            }

            return new CorporateAnalyticsDto
            {
                TenantName = tenant.CompanyName,
                SubscriptionPlan = tenant.SubscriptionTier.ToString(),
                TotalReceiptCount = totalReceiptCount,
                TotalRevenueCaptured = totalRevenue,
                AverageBasketAmount = Math.Round(averageBasket, 2),
                CategoryBreakdown = categoryDtos,
                MarketShareAnalysis = marketShareDtos
            };
        }
    }
}
 