using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using CRS_INTERN_PROJECT.Data;
using CRS_INTERN_PROJECT.DTOs.Auth;
using CRS_INTERN_PROJECT.Entities;
using CRS_INTERN_PROJECT.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CRS_INTERN_PROJECT.Services.Auth;

/// <summary>
/// 
/// Herkesin default olarak-->Consumer role'ünde sisteme girmesini ve Login olunca JWT Token almasını sağlıyoruz.
/// </summary>
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
        //mail kontrolü
        var userExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (userExists)
        {
            throw new Exception("Bu e-posta adresi zaten kullanılıyor.");
        }

        
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        // Sisteme kayıt olan istisnasız herkes 'Consumer' (Vatandaş) rolüyle düşer. 
        // B2B yetkilileri systemadmin tarafından ayarlanır
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

   
        var token = GenerateJwtToken(newUser);

        return new AuthResponseDto
        {
            Token = token,
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

        // Girdiği şifre ile veritabanındaki hash eşleşiyor mu kontrol ediyoruz
        var isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            throw new Exception("Geçersiz e-posta veya şifre.");
        }

       
        var token = GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }

    /// <summary>
    /// İçeride kullanıcının kim olduğunu (Role vs.) anlamamızı sağlayan JWT anahtarını üreten metod.
    /// </summary>
    private string GenerateJwtToken(AppUser user)
    {
        var secret = _configuration["JwtSettings:Secret"] ?? "CRS_SMART_RECEIPT_VERY_SECRETKEY_3232323232";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

        // Token'ın içine kullanıcının bilgilerini claimledik
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        // !TOKEN GEÇERLİLİK SÜRESİ!
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _configuration["JwtSettings:Issuer"] ?? "CRS_Smart_Receipt_API",
            Audience = _configuration["JwtSettings:Audience"] ?? "CRS_Smart_Receipt_App",
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
