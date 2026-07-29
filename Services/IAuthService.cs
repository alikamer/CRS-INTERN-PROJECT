using CRS_INTERN_PROJECT.DTOs;
namespace CRS_INTERN_PROJECT.Services;

public interface IAuthService
{
    Task<AuthResponeDto> RegisterAsync(RegisterDto dto); //register isteğini başarılıysa jwt pakeitini AuthResponseDto döner
    Task<AuthResponeDto?> LoginAsync(LoginDto dto); //Aynı şekilde LoginDto alıcak, bilgiler doğrysa JWT paketi döner yanlışsa oto null döner (note, ? questmark c#'A METODUN NULL DÖNEBİLECEĞİNİ SÖYLER)
}