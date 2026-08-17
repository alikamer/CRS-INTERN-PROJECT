namespace CRS_INTERN_PROJECT.DTOs.Analytics
{
    public class CustomerInsightsDto
    {
        public string SubscriptionPlan { get; set; } = string.Empty;
        public string? ViewedBrandName { get; set; }
        public DemographicsDto Demographics { get; set; } = new();
        public IncomeLevelDto IncomeLevel { get; set; } = new();
    }

    public class BrandOptionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class DemographicsDto
    {
        public int TotalCustomers { get; set; }
        public List<BreakdownItemDto> AgeDistribution { get; set; } = new();
        public List<BreakdownItemDto> GenderDistribution { get; set; } = new();
        public List<BreakdownItemDto> CityDistribution { get; set; } = new();
    }

    public class IncomeLevelDto
    {
        public int TotalCustomers { get; set; }
        public List<BreakdownItemDto> IncomeDistribution { get; set; } = new();
    }

    public class BreakdownItemDto
    {
        public string Label { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }
}
