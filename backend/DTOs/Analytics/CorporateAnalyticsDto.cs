namespace CRS_INTERN_PROJECT.DTOs.Analytics
{

    public class CorporateAnalyticsDto
    {
        public string TenantName { get; set; } = string.Empty;
        public string SubscriptionPlan { get; set; } = string.Empty;
        public int TotalReceiptCount { get; set; }
        public decimal TotalRevenueCaptured { get; set; }
        public decimal AverageBasketAmount { get; set; }
        public List<CategoryBreakdownDto> CategoryBreakdown { get; set; } = new();
        public List<MarketShareDto> MarketShareAnalysis { get; set; } = new();
    }

    public class CategoryBreakdownDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public double Percentage { get; set; }
    }


    public class MarketShareDto
    {
        public string BrandName { get; set; } = string.Empty;
        public double MarketSharePercentage { get; set; }
        public bool IsCurrentBrand { get; set; }
    }
}