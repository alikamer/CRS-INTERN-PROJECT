namespace CRS_INTERN_PROJECT.DTOs.Common;
/*
istenilen sayfayı ve sayfadaki istenilen adetteki kayıt sayısını
manuel olarak belirlemek için dto 
default olarak 1 ve 10 getirilir frontend bilgi göndermezse 
*/
public class PaginationFilter
{
     public int PageNumber{get;set;} =1; 
     public int PageSize{get;set;}=10; 

}

