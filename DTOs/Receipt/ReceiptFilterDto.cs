using CRS_INTERN_PROJECT.DTOs.Common;

namespace CRS_INTERN_PROJECT.DTOs.Receipt;


/*
PaginationFilter'dan  inheritliyoruz böylece pagenum ve pagesize
otomatik olarak geçiyor 
*/
public class ReceiptFilterDto : PaginationFilter
{
    public string? Status { get; set; } //ekstra filtre, fişe özel-- pending approved vs filtresi 
    
}



