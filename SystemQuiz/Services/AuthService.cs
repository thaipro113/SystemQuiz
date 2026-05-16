using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using SystemQuiz.DTOs;
using SystemQuiz.Models;

namespace SystemQuiz.Services
{
    public class AuthService : IAuthService
    {
        private readonly QuizDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(QuizDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == loginDto.UserName);
            if (user == null || !VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return null;
            }

            var token = GenerateJwtToken(user);
            return new AuthResponseDto
            {
                Token = token,
                UserName = user.UserName,
                Role = user.Role,
                UserId = user.Id,
                TotalXP = user.TotalXP,
                CurrentStreak = user.CurrentStreak,
                CompletedQuizzes = user.CompletedQuizzes,
                GlobalRank = user.GlobalRank
            };
        }

        public async Task<UserStatsDto> GetUserStatsAsync(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return null;

            return new UserStatsDto
            {
                UserId = user.Id,
                UserName = user.UserName,
                Name = user.Name,
                TotalXP = user.TotalXP,
                CurrentStreak = user.CurrentStreak,
                CompletedQuizzes = user.CompletedQuizzes,
                GlobalRank = user.GlobalRank
            };
        }

        public async Task<bool> RegisterAsync(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.UserName == registerDto.UserName))
                return false;

            var user = new User
            {
                Name = registerDto.Name,
                UserName = registerDto.UserName,
                PasswordHash = HashPassword(registerDto.Password),
                Role = string.IsNullOrEmpty(registerDto.Role) ? "User" : registerDto.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return true;
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("UserId", user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
