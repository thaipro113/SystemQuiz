using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SystemQuiz.DTOs;
using SystemQuiz.Services;

namespace SystemQuiz.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            var result = await _authService.RegisterAsync(registerDto);
            if (!result) return BadRequest("Username already exists.");
            return Ok(new { message = "User registered successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);
            if (result == null) return Unauthorized("Invalid credentials.");
            return Ok(result);
        }

        [HttpGet("stats/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserStats(int userId)
        {
            try
            {
                var stats = await _authService.GetUserStatsAsync(userId);
                if (stats == null) return NotFound("User not found.");
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
