using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SystemQuiz.DTOs;
using SystemQuiz.Services;

namespace SystemQuiz.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService _quizService;

        public QuizController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitQuiz(SubmitQuizDto submitDto)
        {
            try 
            {
                // Lấy claim có tên là "UserId", nếu không có thì lấy claim NameIdentifier và kiểm tra xem nó có phải là số không
                var userIdClaim = User.FindFirst("UserId") 
                    ?? User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier && int.TryParse(c.Value, out _));
                    
                if (userIdClaim == null) return Unauthorized("Không tìm thấy UserId hợp lệ trong Token.");

                int userId = int.Parse(userIdClaim.Value);
                var result = await _quizService.SubmitQuizAsync(userId, submitDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, inner = ex.InnerException?.Message });
            }
        }
    }
}
