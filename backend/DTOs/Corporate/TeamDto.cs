namespace CRS_INTERN_PROJECT.DTOs.Corporate;

public class InviteTeamMemberDto
{
    public string Email { get; set; } = string.Empty;
}

public class TeamMemberDto
{
    public Guid AppUserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class PendingInviteDto
{
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// CurrentUserIsOwner, frontend'de "Ekip Üyesi Ekle" formunu gösterip göstermeme kararı için kullanılır.
/// </summary>
public class TeamOverviewDto
{
    public bool CurrentUserIsOwner { get; set; }
    public List<TeamMemberDto> Members { get; set; } = new();
    public List<PendingInviteDto> PendingInvites { get; set; } = new();
}
