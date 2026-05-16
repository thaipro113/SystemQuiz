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
                    AnwserId = submitAnswer.SelectedAnswerId,
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
                ToalQuestions = submitDto.Answers.Count,
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

            // Update user stats
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user != null)
            {
                user.CompletedQuizzes++;
                user.TotalXP += score * 10; // 10 XP per correct answer
                
                // Update streak
                if (user.LastQuizDate.Date == DateTime.UtcNow.AddDays(-1).Date)
                {
                    user.CurrentStreak++;
                }
                else if (user.LastQuizDate.Date != DateTime.UtcNow.Date)
                {
                    user.CurrentStreak = 1;
                }
                
                user.LastQuizDate = DateTime.UtcNow;
                
                // Update rank based on XP (simplified)
                var allUsers = await _context.Users.OrderByDescending(u => u.TotalXP).ToListAsync();
                var userRank = allUsers.FindIndex(u => u.Id == userId) + 1;
                user.GlobalRank = (userRank * 100) / allUsers.Count;
                
                await _context.SaveChangesAsync();
            }

            return new QuizResultDto
            {
                Score = score,
                TotalQuestions = result.ToalQuestions,
                Details = resultDtoDetails
            };
        }

        public async Task<List<QuizDisplayDto>> GetTrendingQuizzesAsync()
        {
            var topics = await _context.Questions
                .GroupBy(q => q.Topic ?? "General")
                .Select(g => new QuizDisplayDto
                {
                    Topic = g.Key,
                    QuestionCount = g.Count(),
                    Difficulty = "Medium",
                    EstimatedTime = g.Count() * 2,
                    PlayersCount = 1200
                })
                .OrderByDescending(q => q.PlayersCount)
                .Take(10)
                .ToListAsync();

            return topics;
        }

        public async Task<List<Result>> GetUserResultsAsync(int userId)
        {
            var results = await _context.Results
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreateAt)
                .ToListAsync();

            return results;
        }

        public async Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(int limit = 10)
        {
            var leaderboard = await _context.Users
                .OrderByDescending(u => u.TotalXP)
                .Take(limit)
                .Select((u, index) => new LeaderboardEntryDto
                {
                    Rank = index + 1,
                    UserName = u.UserName,
                    Name = u.Name,
                    TotalXP = u.TotalXP
                })
                .ToListAsync();

            return leaderboard;
        }
    }
}
