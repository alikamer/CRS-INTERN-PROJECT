namespace CRS_INTERN_PROJECT.DTOs.Common;

/*
<T>-> generic tip, PagedResult sınıfını sadece 
      receipt için değil  user brand vs diğer
      listelemerde de kullanacağız.
*/



public class PagedResult<T>
{
    public List<T> Items {get;set;} = new List<T>();
    public int TotalCount {get;set;}
    public int PageNumber {get;set;}
    public int PageSize {get;set;}
    public int TotalPages => (int)Math.Ceiling(TotalCount/(double)PageSize); //2.5 --> 3 sf ceiling ile 
    public bool HashPreviousPage => PageNumber >1;
    public bool HashNextPage => PageNumber<TotalPages;

}





/* Not:

Fişleri çekerken bu sınıfı PagedResult<ReceiptDto>  ile çağıracağız (T,generic)

public List<ReceiptDto> Items {get;set;} dönüşecek  

ileride Users çekereken -> PagedResult<UserDto>} şeklinde çağıraacağız 

o zaman da public List<UserDto> Items{get;set;  dönüşecek 



*/