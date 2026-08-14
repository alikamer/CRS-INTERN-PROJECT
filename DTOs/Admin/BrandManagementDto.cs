namespace CRS_INTERN_PROJECT.DTOs.Admin;

/// <summary>
/// Marka Yönetimi ekranındaki satır — dropdown'daki sade BrandOptionDto'dan farklı olarak
/// pasif markaları da (IsActive) gösterir.
/// </summary>
public class BrandManagementDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; }
}


//Yeni marka oluştururken ya da var olanı düzenlerken kullanılan giriş DTO'su.

public class BrandInputDto
{
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
}
