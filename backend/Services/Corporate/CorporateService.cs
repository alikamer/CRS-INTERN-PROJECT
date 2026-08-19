using CRS_INTERN_PROJECT.Data;
using CRS_INTERN_PROJECT.DTOs.Corporate;
using CRS_INTERN_PROJECT.Entities;
using CRS_INTERN_PROJECT.Enums;
using Microsoft.EntityFrameworkCore;

namespace CRS_INTERN_PROJECT.Services.Corporate;

/// <summary>
/// Owner'ın kendi ekibini görmesi ve mail ile yeni ekip üyesi eklemesi iş mantığını barındırır.
/// </summary>
public class CorporateService : ICorporateService
{
    private readonly AppDbContext _context;

    public CorporateService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TeamOverviewDto> GetTeamAsync(Guid requestingAppUserId)
    {
        var requester = await _context.CorporateProfiles
            .FirstOrDefaultAsync(cp => cp.AppUserId == requestingAppUserId);

        if (requester == null)
        {
            throw new Exception("Kurumsal profiliniz bulunamadı.");
        }

        var members = await _context.CorporateProfiles
            .Include(cp => cp.AppUser)
            .Where(cp => cp.TenantId == requester.TenantId)
            .Select(cp => new TeamMemberDto
            {
                AppUserId = cp.AppUserId,
                FirstName = cp.AppUser.FirstName,
                LastName = cp.AppUser.LastName,
                Email = cp.AppUser.Email,
                Role = cp.Role.ToString()
            })
            .ToListAsync();

        var pendingInvites = await _context.TenantInvites
            .Where(ti => ti.TenantId == requester.TenantId)
            .Select(ti => new PendingInviteDto { Id = ti.Id, Email = ti.Email, CreatedAt = ti.CreatedAt })
            .ToListAsync();

        return new TeamOverviewDto
        {
            CurrentUserIsOwner = requester.Role == TenantRole.Owner,
            Members = members,
            PendingInvites = pendingInvites
        };
    }

    public async Task<bool> InviteTeamMemberAsync(Guid requestingAppUserId, InviteTeamMemberDto dto)
    {
        var requester = await _context.CorporateProfiles
            .FirstOrDefaultAsync(cp => cp.AppUserId == requestingAppUserId);

        if (requester == null)
        {
            throw new Exception("Kurumsal profiliniz bulunamadı.");
        }

        if (requester.Role != TenantRole.Owner)
        {
            throw new Exception("Sadece şirket sahibi ekip üyesi ekleyebilir.");
        }

        if (string.IsNullOrWhiteSpace(dto.Email))
        {
            throw new Exception("Lütfen geçerli bir e-posta girin.");
        }

        var existingUser = await _context.Users
            .Include(u => u.CorporateProfile)
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (existingUser != null)
        {
            if (existingUser.Id == requestingAppUserId)
            {
                throw new Exception("Kendinizi ekip üyesi olarak ekleyemezsiniz.");
            }

            if (existingUser.Role == UserRole.SystemAdmin)
            {
                throw new Exception("Bu kullanıcı sistem yöneticisi, ekibe eklenemez.");
            }

            if (existingUser.Role == UserRole.CorporateUser)
            {
                if (existingUser.CorporateProfile!.TenantId == requester.TenantId)
                {
                    throw new Exception("Bu kişi zaten ekibinizde.");
                }

                throw new Exception("Bu kullanıcı başka bir şirkete bağlı, eklenemez.");
            }

            existingUser.Role = UserRole.CorporateUser;
            _context.CorporateProfiles.Add(new CorporateProfile
            {
                AppUserId = existingUser.Id,
                TenantId = requester.TenantId,
                Role = TenantRole.Member
            });

            await _context.SaveChangesAsync();
            return true;
        }

        var alreadyInvited = await _context.TenantInvites.AnyAsync(ti => ti.Email == dto.Email);
        if (alreadyInvited)
        {
            throw new Exception("Bu mail zaten davet edilmiş, onayınızı bekliyor.");
        }

        _context.TenantInvites.Add(new TenantInvite
        {
            Email = dto.Email,
            TenantId = requester.TenantId
        });

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// "Ekle"nin tam tersi: CorporateProfile'ı siler, AppUser'ı varsayılan role (Consumer)
    /// döndürür. Hesap silinmez — kişi artık şirkete bağlı olmayan sıradan bir vatandaş olur.
    /// Daha önce hiç ConsumerProfile'ı olmadıysa (davet edilip direkt CorporateUser olarak
    /// kayıt olduysa) burada bir tane oluşturulur, aksi halde Role=Consumer olur ama karşılığında
    /// profili olmaz.
    /// </summary>
    public async Task<bool> RemoveTeamMemberAsync(Guid requestingAppUserId, Guid targetAppUserId)
    {
        var requester = await _context.CorporateProfiles
            .FirstOrDefaultAsync(cp => cp.AppUserId == requestingAppUserId);

        if (requester == null)
        {
            throw new Exception("Kurumsal profiliniz bulunamadı.");
        }

        if (requester.Role != TenantRole.Owner)
        {
            throw new Exception("Sadece şirket sahibi ekip üyesi çıkarabilir.");
        }

        if (targetAppUserId == requestingAppUserId)
        {
            throw new Exception("Kendinizi ekipten çıkaramazsınız.");
        }

        var target = await _context.CorporateProfiles
            .Include(cp => cp.AppUser)
            .FirstOrDefaultAsync(cp => cp.AppUserId == targetAppUserId && cp.TenantId == requester.TenantId);

        if (target == null)
        {
            throw new Exception("Bu kişi ekibinizde bulunamadı.");
        }

        if (target.Role == TenantRole.Owner)
        {
            throw new Exception("Şirket sahibi ekipten çıkarılamaz.");
        }

        _context.CorporateProfiles.Remove(target);
        target.AppUser.Role = UserRole.Consumer;

        var hasConsumerProfile = await _context.ConsumerProfiles.AnyAsync(cp => cp.AppUserId == targetAppUserId);
        if (!hasConsumerProfile)
        {
            _context.ConsumerProfiles.Add(new ConsumerProfile { AppUserId = targetAppUserId });
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelInviteAsync(Guid requestingAppUserId, Guid inviteId)
    {
        var requester = await _context.CorporateProfiles
            .FirstOrDefaultAsync(cp => cp.AppUserId == requestingAppUserId);

        if (requester == null)
        {
            throw new Exception("Kurumsal profiliniz bulunamadı.");
        }

        if (requester.Role != TenantRole.Owner)
        {
            throw new Exception("Sadece şirket sahibi daveti iptal edebilir.");
        }

        var invite = await _context.TenantInvites
            .FirstOrDefaultAsync(ti => ti.Id == inviteId && ti.TenantId == requester.TenantId);

        if (invite == null)
        {
            throw new Exception("Davet bulunamadı.");
        }

        _context.TenantInvites.Remove(invite);
        await _context.SaveChangesAsync();
        return true;
    }
}
