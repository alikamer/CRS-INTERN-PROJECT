    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.IdentityModel.Tokens;
    using CRS_INTERN_PROJECT.Data;
    using CRS_INTERN_PROJECT.DTOs;
    using CRS_INTERN_PROJECT.Entities;
    using CRS_INTERN_PROJECT.Enums;
using Microsoft.EntityFrameworkCore.Migrations.Operations;



namespace CRS_INTERN_PROJECT.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly PasswordHasher<User> _passwordHasher;

    public AuthService(AppDbContext context, IConfiguration configuration) //Dependency Injection
    {
        _context = context;
        _configuration = configuration;
        _passwordHasher = new PasswordHasher<User>();
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("tenantId", user.TenantId.ToString()),
        };

        var secretKey = _configuration["JwtSettings:Secret"] ?? "CRS_SMART_RECEIPT_VERY_SECRETKEY_1234567890";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"] ?? "CRS_Smart_Receipt_API",
            audience: _configuration["JwtSettings:Audience"] ?? "CRS_Smart_Receipt_App",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(60),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<AuthResponeDto> RegisterAsync(RegisterDto dto)
    {
        var emailLower = dto.Email.ToLower();
        var existingUser = await _context.Users.AnyAsync(u => u.Email.ToLower() == emailLower);
        if (existingUser)
        {
            throw new Exception("Bu e-posta adresi zaten kullanımda.");
        }

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = dto.TenantName,
            SubscriptionTier = "Basic",
            CreatedAt = DateTime.UtcNow
        };
        _context.Tenants.Add(tenant);

        var user = new User
        {
            Id = Guid.NewGuid(),
            TenantId = tenant.Id,
            Email = dto.Email,
            FullName = dto.FullName,
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync(); // Asenkron olarak veritabanına kayıt ediyoruz

        var token = GenerateJwtToken(user);
        return new AuthResponeDto
        {
            Token = token,
            Email = user.Email,
            FullName = user.FullName
        };
    }

    public async Task<AuthResponeDto?> LoginAsync(LoginDto dto)
    {
        var emailLower = dto.Email.ToLower();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailLower);
        if (user == null)
        {
            return null;
        }

        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return null;
        }

        var token = GenerateJwtToken(user);
        return new AuthResponeDto
        {
            Token = token,
            Email = user.Email,
            FullName = user.FullName
        };
    }
}