using SystemQuiz.DTOs;

namespace SystemQuiz.Services
{
    public interface IQuizService
    {
        Task<QuizResultDto> SubmitQuizAsync(int userId, SubmitQuizDto submitDto);
    }
}
