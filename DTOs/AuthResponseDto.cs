namespace CRS_INTERN_PROJECT.DTOs;

public class AuthResponeDto //başaraılı giriş ya da kayıttan sonra frontende dönülecek 
{
    public string Token {get; set; } = string.Empty;
    public string Email {get; set; } = string.Empty;
    public string FullName {get; set; } = string.Empty;

}