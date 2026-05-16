using SystemQuiz.DTOs;
using SystemQuiz.Models;

namespace SystemQuiz.Services
{
    public interface IQuizService
    {
        Task<QuizResultDto> SubmitQuizAsync(int userId, SubmitQuizDto submitDto);
        Task<List<QuizDisplayDto>> GetTrendingQuizzesAsync();
        Task<List<Result>> GetUserResultsAsync(int userId);
        Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(int limit);
    }
}
