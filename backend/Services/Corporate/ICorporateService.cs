using CRS_INTERN_PROJECT.DTOs.Corporate;

namespace CRS_INTERN_PROJECT.Services.Corporate;

public interface ICorporateService
{
    Task<TeamOverviewDto> GetTeamAsync(Guid requestingAppUserId);
    Task<bool> InviteTeamMemberAsync(Guid requestingAppUserId, InviteTeamMemberDto dto);
    Task<bool> RemoveTeamMemberAsync(Guid requestingAppUserId, Guid targetAppUserId);
    Task<bool> CancelInviteAsync(Guid requestingAppUserId, Guid inviteId);
}
