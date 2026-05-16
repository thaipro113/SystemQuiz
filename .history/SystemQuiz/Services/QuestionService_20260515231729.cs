using Microsoft.EntityFrameworkCore;
using SystemQuiz.DTOs;
using SystemQuiz.Models;

namespace SystemQuiz.Services
{
    public class QuestionService : IQuestionService
    {
        private readonly QuizDbContext _context;

        public QuestionService(QuizDbContext context)
        {
            _context = context;
        }

        public async Task<List<QuestionDto>> GetAllQuestionsAsync()
        {
            var questions = await _context.Questions
                .Include(q => q.Answers)
                .ToListAsync();

            return questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                Content = q.Content,
                Topic = q.Topic,
                Answers = q.Answers.Select(a => new AnswerDto
                {
                    Id = a.Id,
                    Content = a.Content,
                    IsCorrect = a.IsCorrect
                }).ToList()
            }).ToList();
        }

        public async Task<QuestionDto> CreateQuestionAsync(CreateQuestionDto createDto)
        {
            var question = new Question
            {
                Content = createDto.Content,
                Topic = string.IsNullOrEmpty(createDto.Topic) ? "General" : createDto.Topic,
                Answers = createDto.Answers.Select(a => new Answer
                {
                    Content = a.Content,
                    IsCorrect = a.IsCorrect
                }).ToList()
            };

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            return new QuestionDto
            {
                Id = question.Id,
                Content = question.Content,
                Topic = question.Topic,
                Answers = question.Answers.Select(a => new AnswerDto { Id = a.Id, Content = a.Content, IsCorrect = a.IsCorrect }).ToList()
            };
        }

        public async Task<bool> UpdateQuestionAsync(int id, CreateQuestionDto updateDto)
        {
            var question = await _context.Questions.Include(q => q.Answers).FirstOrDefaultAsync(q => q.Id == id);
            if (question == null) return false;

            question.Content = updateDto.Content;
            question.Topic = string.IsNullOrEmpty(updateDto.Topic) ? "General" : updateDto.Topic;

            // Safe update strategy: update existing answers by index
            for (int i = 0; i < question.Answers.Count && i < updateDto.Answers.Count; i++)
            {
                question.Answers[i].Content = updateDto.Answers[i].Content;
                question.Answers[i].IsCorrect = updateDto.Answers[i].IsCorrect;
            }

            // Add any new answers if the incoming dto has more than existing
            for (int i = question.Answers.Count; i < updateDto.Answers.Count; i++)
            {
                question.Answers.Add(new Answer
                {
                    Content = updateDto.Answers[i].Content,
                    IsCorrect = updateDto.Answers[i].IsCorrect
                });
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteQuestionAsync(int id)
        {
            var question = await _context.Questions.Include(q => q.Answers).FirstOrDefaultAsync(q => q.Id == id);
            if (question == null) return false;

            // Load ResultDetails that reference this question
            var resultDetails = await _context.ResultDetails
                .Where(rd => rd.QuestionId == id)
                .ToListAsync();

            if (resultDetails.Any())
            {
                _context.ResultDetails.RemoveRange(resultDetails);
            }

            _context.Answers.RemoveRange(question.Answers);
            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
