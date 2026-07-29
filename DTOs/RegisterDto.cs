namespace CRS_INTERN_PROJECT;

public class RegisterDto
{
    public string Email {get; set; } = string.Empty;
    public string Password {get; set; } = string.Empty;
    public string FullName {get; set; } = string.Empty;
    public string TenantName {get; set; } = string.Empty; //Saas/B2b olduğundan her kullanıcı bir şirkete atansın dedim


}