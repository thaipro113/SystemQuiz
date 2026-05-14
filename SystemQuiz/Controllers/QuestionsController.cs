using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SystemQuiz.DTOs;
using SystemQuiz.Services;

namespace SystemQuiz.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionsController : ControllerBase
    {
        private readonly IQuestionService _questionService;

        public QuestionsController(IQuestionService questionService)
        {
            _questionService = questionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var questions = await _questionService.GetAllQuestionsAsync();
            return Ok(questions);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateQuestionDto createDto)
        {
            var question = await _questionService.CreateQuestionAsync(createDto);
            return Ok(question);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, CreateQuestionDto updateDto)
        {
            var result = await _questionService.UpdateQuestionAsync(id, updateDto);
            if (!result) return NotFound();
            return Ok(new { message = "Question updated" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _questionService.DeleteQuestionAsync(id);
                if (!result) return NotFound();
                return Ok(new { message = "Question deleted" });
            }
            catch (Exception ex)
            {
                // Return detailed error for debugging
                return BadRequest(new { 
                    error = ex.Message, 
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace 
                });
            }
        }

        [HttpPost("test-error")]
        [AllowAnonymous]
        public async Task<IActionResult> TestError([FromServices] IQuizService quizService, [FromBody] SubmitQuizDto dto)
        {
            try
            {
                var result = await quizService.SubmitQuizAsync(1, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return Ok(new { error = ex.Message, inner = ex.InnerException?.Message, trace = ex.StackTrace });
            }
        }
    }
}
