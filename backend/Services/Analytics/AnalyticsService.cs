using System.Net.Http.Json;
using System.Text.Json;
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
        private readonly IHttpClientFactory _httpClientFactory;
        private static readonly JsonSerializerOptions PythonJsonOptions = new() { PropertyNameCaseInsensitive = true };

        public AnalyticsService(AppDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
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

            if (tenant.SubscriptionTier == SubscriptionTier.Basic)
            {
                marketShareDtos = marketShareDtos.Where(m => m.IsCurrentBrand).ToList();
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

        /// <summary>
        /// Yaş/cinsiyet/şehir/gelir dağılımlarını python-analytics servisinden çeker.
        /// Premium olmayan tenant'lar için overrideBrandId/allBrands sessizce yok sayılır,
        /// her zaman tenant'ın kendi markası kullanılır (pazar payı maskelemesiyle aynı yetki kademesi).
        /// </summary>
        public async Task<CustomerInsightsDto> GetCustomerInsightsAsync(Guid tenantId, Guid? overrideBrandId, bool allBrands)
        {
            var tenant = await _context.Tenants.Include(t => t.Brand).FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenant == null)
            {
                throw new KeyNotFoundException("Kurumsal şirket (Tenant) bulunamadı.");
            }

            bool isPremium = tenant.SubscriptionTier == SubscriptionTier.Premium;

            Guid? targetBrandId;
            string? viewedBrandName;

            if (isPremium && allBrands)
            {
                targetBrandId = null;
                viewedBrandName = "Tüm Markalar";
            }
            else if (isPremium && overrideBrandId.HasValue)
            {
                targetBrandId = overrideBrandId.Value;
                viewedBrandName = await _context.Brands
                    .Where(b => b.Id == overrideBrandId.Value)
                    .Select(b => b.Name)
                    .FirstOrDefaultAsync();
            }
            else
            {
                targetBrandId = tenant.BrandId;
                viewedBrandName = tenant.Brand?.Name;
            }

            if (!targetBrandId.HasValue && !allBrands)
            {
                return new CustomerInsightsDto { SubscriptionPlan = tenant.SubscriptionTier.ToString() };
            }

            try
            {
                var client = _httpClientFactory.CreateClient("AnalyticsService");
                var url = targetBrandId.HasValue
                    ? $"/insights/customer-overview?brand_id={targetBrandId.Value}"
                    : "/insights/customer-overview";
                var response = await client.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return new CustomerInsightsDto { SubscriptionPlan = tenant.SubscriptionTier.ToString() };
                }

                var result = await response.Content.ReadFromJsonAsync<CustomerInsightsDto>(PythonJsonOptions)
                    ?? new CustomerInsightsDto();

                result.SubscriptionPlan = tenant.SubscriptionTier.ToString();
                result.ViewedBrandName = viewedBrandName;
                return result;
            }
            catch (HttpRequestException)
            {
                return new CustomerInsightsDto { SubscriptionPlan = tenant.SubscriptionTier.ToString() };
            }
        }
    }
}
 