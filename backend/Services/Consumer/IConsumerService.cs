//ınterface
using CRS_INTERN_PROJECT.DTOs.Consumer;

namespace CRS_INTERN_PROJECT.Services.Consumer;

public interface IConsumerService
{
    Task<ConsumerFullProfileDto?> GetProfileAsync(Guid appUserId);
    Task<bool> UpdateProfileAsync(Guid appUserId, UpdateConsumerProfileDto dto);
}
