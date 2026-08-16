using CRS_INTERN_PROJECT.DTOs.Common;

namespace CRS_INTERN_PROJECT.DTOs.Receipt;


/*
PaginationFilter'dan  inheritliyoruz böylece pagenum ve pagesize
otomatik olarak geçiyor 
*/
public class ReceiptFilterDto : PaginationFilter
{
    public string? Status { get; set; } //ekstra filtre, fişe özel-- pending approved vs filtresi

    public Guid? BrandId { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }

    /// <summary>
    /// "date" ya da "amount". Boş/tanınmayan değer gelirse tarihe göre sıralanır.
    /// </summary>
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}



