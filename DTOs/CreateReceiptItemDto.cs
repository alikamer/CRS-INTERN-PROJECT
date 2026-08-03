using System.ComponentModel.DataAnnotations;

namespace CRS_INTERN_PROJECT.DTOs;

public class CreateReceiptItemDto
{
    [Required(ErrorMessage = "Ürün adı zorunludur.")]
    public string ProductName { get; set; } = string.Empty;

    [Range(1, 1000, ErrorMessage = "Miktar en az 1 olmalıdır.")]
    public int Quantity { get; set; }

    [Range(0.01, 1000000, ErrorMessage = "Geçerli bir birim fiyatı giriniz.")]
    public decimal UnitPrice { get; set; }
}
