namespace CRS_INTERN_PROJECT.DTOs.Consumer;

public class ConsumerFullProfileDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;

    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? City { get; set; }
    public string? IncomeLevel { get; set; }
}
