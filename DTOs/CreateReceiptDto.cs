using System.ComponentModel.DataAnnotations;

namespace CRS_INTERN_PROJECT.DTOs;

public class CreateReceiptDto
{
    [Required(ErrorMessage = "Mağaza adı zorunludur.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Mağaza adı en az 2, en fazla 100 karakter olmalıdır.")]
    public string StoreName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Fiş tarihi zorunludur.")]
    public DateTime ReceiptDate { get; set; }

    public string? ImagePath { get; set; } // Fişin yüklenen fotoğrafının sunucudaki yolu (opsiyonel)

    [Required]
    [MinLength(1, ErrorMessage = "En az bir ürün kalemi girilmelidir.")]
    public List<CreateReceiptItemDto> Items { get; set; } = new();
}
