using SystemQuiz.DTOs;

namespace SystemQuiz.Services
{
    public interface IQuestionService
    {
        Task<List<QuestionDto>> GetAllQuestionsAsync();
        Task<QuestionDto> CreateQuestionAsync(CreateQuestionDto createDto);
        Task<bool> UpdateQuestionAsync(int id, CreateQuestionDto updateDto);
        Task<bool> DeleteQuestionAsync(int id);
    }
}
