using CRS_INTERN_PROJECT.Data;
using CRS_INTERN_PROJECT.DTOs.Consumer;
using Microsoft.EntityFrameworkCore;

namespace CRS_INTERN_PROJECT.Services.Consumer;

public class ConsumerService : IConsumerService
{
    private readonly AppDbContext _context;

    public ConsumerService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> UpdateProfileAsync(Guid appUserId, UpdateConsumerProfileDto dto)
    {
        // kaydı var mı kontrol (consumre)
        var profile = await _context.ConsumerProfiles
            .FirstOrDefaultAsync(cp => cp.AppUserId == appUserId);

        // Eğer kullanıcı bir Consumer değilse (mesela Admin veya Corporate) profil kaydı olmayabilir
        if (profile == null)
        {
            return false;
        }

        // PostgreSQL DateTimeKind.Utc zorunluluğu için çevrim yapıyoruz
        if (dto.DateOfBirth.HasValue)
        {
            profile.DateOfBirth = DateTime.SpecifyKind(dto.DateOfBirth.Value, DateTimeKind.Utc);
        }
        else
        {
            profile.DateOfBirth = null;
        }

        profile.Gender = dto.Gender;
        profile.City = dto.City;
        profile.IncomeLevel = dto.IncomeLevel;

        // db kayıt 
        await _context.SaveChangesAsync();
        return true;
    }
}
