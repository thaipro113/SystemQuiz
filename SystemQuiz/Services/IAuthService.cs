using SystemQuiz.DTOs;

namespace SystemQuiz.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<bool> RegisterAsync(RegisterDto registerDto);
        Task<UserStatsDto> GetUserStatsAsync(int userId);
    }
}
