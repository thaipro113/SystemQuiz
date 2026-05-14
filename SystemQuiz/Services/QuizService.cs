using Microsoft.EntityFrameworkCore;
using SystemQuiz.DTOs;
using SystemQuiz.Models;

namespace SystemQuiz.Services
{
    public class QuizService : IQuizService
    {
        private readonly QuizDbContext _context;

        public QuizService(QuizDbContext context)
        {
            _context = context;
        }

        public async Task<QuizResultDto> SubmitQuizAsync(int userId, SubmitQuizDto submitDto)
        {
            var questionIds = submitDto.Answers.Select(a => a.QuestionId).ToList();
            var questions = await _context.Questions
                .Include(q => q.Answers)
                .Where(q => questionIds.Contains(q.Id))
                .ToListAsync();

            int score = 0;
            var details = new List<ResultDetail>();
            var resultDtoDetails = new List<ResultDetailDto>();

            foreach (var submitAnswer in submitDto.Answers)
            {
                var question = questions.FirstOrDefault(q => q.Id == submitAnswer.QuestionId);
                if (question == null) continue;

                var selectedAnswer = question.Answers.FirstOrDefault(a => a.Id == submitAnswer.SelectedAnswerId);
                bool isCorrect = selectedAnswer != null && selectedAnswer.IsCorrect;

                if (isCorrect) score++;

                details.Add(new ResultDetail
                {
                    QuestionId = question.Id,
                    AnwserId = submitAnswer.SelectedAnswerId, // Maps to the Answer foreign key
                    SelectedAnwserId = submitAnswer.SelectedAnswerId,
                    IsCorrect = isCorrect
                });

                resultDtoDetails.Add(new ResultDetailDto
                {
                    QuestionId = question.Id,
                    QuestionContent = question.Content,
                    SelectedAnswerContent = selectedAnswer?.Content ?? "Not found",
                    IsCorrect = isCorrect
                });
            }

            var result = new Result
            {
                UserId = userId,
                Score = score,
                ToalQuestions = submitDto.Answers.Count, // Note: using ToalQuestions as per user's model
                CreateAt = DateTime.UtcNow
            };

            _context.Results.Add(result);
            await _context.SaveChangesAsync(); 

            foreach (var d in details)
            {
                d.ResultId = result.Id;
            }
            _context.ResultDetails.AddRange(details);
            await _context.SaveChangesAsync();

            return new QuizResultDto
            {
                Score = score,
                TotalQuestions = result.ToalQuestions,
                Details = resultDtoDetails
            };
        }
    }
}
