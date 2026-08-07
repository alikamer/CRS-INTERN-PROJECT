using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;
using CRS_INTERN_PROJECT.Data;
using CRS_INTERN_PROJECT.DTOs.Auth;
using CRS_INTERN_PROJECT.Entities;
using CRS_INTERN_PROJECT.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CRS_INTERN_PROJECT.Services.Auth;







public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (userExists)
        {
            throw new Exception("Bu e-posta adresi zaten kullanılıyor.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var newUser = new AppUser
        {
            Email = dto.Email,
            PasswordHash = passwordHash,
            Role = UserRole.Consumer
        };

        var consumerProfile = new ConsumerProfile
        {
            AppUserId = newUser.Id
        };

        _context.Users.Add(newUser);
        _context.ConsumerProfiles.Add(consumerProfile);
        await _context.SaveChangesAsync();

        var accessToken = GenerateJwtToken(newUser);
        var refreshToken = await GenerateRefreshTokenAsync(newUser);

        return new AuthResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshToken.Token,
            Email = newUser.Email,
            Role = newUser.Role.ToString()
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
        {
            throw new Exception("Geçersiz e-posta veya şifre.");
        }

        var isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            throw new Exception("Geçersiz e-posta veya şifre.");
        }

        var accessToken = GenerateJwtToken(user);
        var refreshToken = await GenerateRefreshTokenAsync(user);

        return new AuthResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshToken.Token,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }

    /// <summary>
    /// Süresi dolmuş Access Token yerine gönderilen Refresh Token'ı doğrular ve yeni token ikilisini (Token Rotation) üretir.
    /// </summary>
    public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto)
    {
        var existingRefreshToken = await _context.RefreshTokens
            .Include(rt => rt.AppUser)
            .FirstOrDefaultAsync(rt => rt.Token == dto.RefreshToken);

        if (existingRefreshToken == null || !existingRefreshToken.IsActive)
        {
            throw new Exception("Geçersiz veya süresi dolmuş Refresh Token. Lütfen tekrar giriş yapın.");
        }

        existingRefreshToken.RevokedAt = DateTime.UtcNow;

        var user = existingRefreshToken.AppUser;
        var newAccessToken = GenerateJwtToken(user);
        var newRefreshToken = await GenerateRefreshTokenAsync(user);

        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken.Token,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }

    /// <summary>
    /// Kullanıcı çıkış yaptığında Refresh Token'ı veritabanında iptal eder. Tekrar mail+şifre girilmesi gereklidir generate için
    /// </summary>
    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        var tokenEntity = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (tokenEntity == null || !tokenEntity.IsActive)
        {
            return false;
        }

        tokenEntity.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// 15 dakikalık kısa süreli JWT Access Token üretir.
    /// </summary>
    private string GenerateJwtToken(AppUser user)
    {
        var secret = _configuration["JwtSettings:Secret"] ?? "CRS_SMART_RECEIPT_VERY_SECRETKEY_3232323232";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(15),
            Issuer = _configuration["JwtSettings:Issuer"] ?? "CRS_Smart_Receipt_API",
            Audience = _configuration["JwtSettings:Audience"] ?? "CRS_Smart_Receipt_App",
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// Refresh token üretiriz ve veritabanına 7 gün süreli kaydeder.
    /// </summary>
    private async Task<RefreshToken> GenerateRefreshTokenAsync(AppUser user)
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        var tokenString = Convert.ToBase64String(randomNumber);

        var refreshToken = new RefreshToken
        {
            AppUserId = user.Id,
            Token = tokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return refreshToken;
    }
}
