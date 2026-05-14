using Microsoft.EntityFrameworkCore;
using SystemQuiz.Models;
using SystemQuiz.Services;

namespace SystemQuiz.Tests
{
    /// <summary>
    /// Bug Condition Exploration Test for Question Deletion with Result Details
    /// **Validates: Requirements 1.1, 1.2, 1.3**
    /// 
    /// CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
    /// EXPECTED OUTCOME: Test FAILS with DbUpdateException (this is correct - it proves the bug exists)
    /// 
    /// This test encodes the expected behavior - it will validate the fix when it passes after implementation
    /// </summary>
    public class QuestionDeletionBugConditionTests
    {
        /// <summary>
        /// Property 1: Bug Condition - Question Deletion with Result Details
        /// 
        /// For any delete request where a question has associated ResultDetail records,
        /// the fixed DeleteQuestionAsync method SHALL successfully delete the question
        /// and set all ResultDetail.QuestionId foreign keys to null.
        /// 
        /// **Validates: Requirements 1.1, 1.2, 1.3**
        /// </summary>
        [Fact]
        public async Task DeleteQuestionAsync_WithResultDetails_ShouldSucceedAndSetQuestionIdToNull()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<QuizDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_BugCondition_" + Guid.NewGuid())
                .Options;

            using var context = new QuizDbContext(options);
            var questionService = new QuestionService(context);

            // Create a user for the result
            var user = new User
            {
                UserName = "testuser",
                Name = "Test User",
                PasswordHash = "hash",
                Role = "Student"
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            // Create a question with answers
            var question = new Question
            {
                Content = "What is 2+2?",
                Topic = "Math",
                Answers = new List<Answer>
                {
                    new Answer { Content = "3", IsCorrect = false },
                    new Answer { Content = "4", IsCorrect = true },
                    new Answer { Content = "5", IsCorrect = false }
                }
            };
            context.Questions.Add(question);
            await context.SaveChangesAsync();

            var correctAnswer = question.Answers.First(a => a.IsCorrect);
            var selectedAnswer = correctAnswer;

            // Create a quiz result that uses this question
            var result = new Result
            {
                UserId = user.Id,
                Score = 1,
                ToalQuestions = 1,
                CreateAt = DateTime.UtcNow
            };
            context.Results.Add(result);
            await context.SaveChangesAsync();

            // Create a ResultDetail that references the question
            var resultDetail = new ResultDetail
            {
                ResultId = result.Id,
                QuestionId = question.Id,
                AnwserId = correctAnswer.Id,
                SelectedAnwserId = selectedAnswer.Id,
                IsCorrect = true
            };
            context.ResultDetails.Add(resultDetail);
            await context.SaveChangesAsync();

            var questionId = question.Id;
            var resultDetailId = resultDetail.Id;

            // Act - Attempt to delete the question
            var deleteResult = await questionService.DeleteQuestionAsync(questionId);

            // Assert - Expected behavior after fix
            Assert.True(deleteResult, "DeleteQuestionAsync should return true");

            // Verify question is deleted
            var deletedQuestion = await context.Questions.FindAsync(questionId);
            Assert.Null(deletedQuestion);

            // Verify ResultDetail still exists but QuestionId is set to null
            var updatedResultDetail = await context.ResultDetails.FindAsync(resultDetailId);
            Assert.NotNull(updatedResultDetail);
            Assert.True(updatedResultDetail.QuestionId == null || updatedResultDetail.QuestionId == 0, 
                "QuestionId should be null after question deletion");

            // Verify Result still exists
            var existingResult = await context.Results.FindAsync(result.Id);
            Assert.NotNull(existingResult);
        }

        /// <summary>
        /// Property 1: Bug Condition - Question Deletion with Multiple Result Details
        /// 
        /// Tests the scenario where a question is used in multiple quiz results.
        /// All ResultDetail records should have their QuestionId set to null.
        /// 
        /// **Validates: Requirements 1.1, 1.2, 1.3**
        /// </summary>
        [Fact]
        public async Task DeleteQuestionAsync_WithMultipleResultDetails_ShouldSucceedAndSetAllQuestionIdsToNull()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<QuizDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_BugCondition_Multiple_" + Guid.NewGuid())
                .Options;

            using var context = new QuizDbContext(options);
            var questionService = new QuestionService(context);

            // Create users
            var user1 = new User { UserName = "user1", Name = "User One", PasswordHash = "hash", Role = "Student" };
            var user2 = new User { UserName = "user2", Name = "User Two", PasswordHash = "hash", Role = "Student" };
            context.Users.AddRange(user1, user2);
            await context.SaveChangesAsync();

            // Create a question with answers
            var question = new Question
            {
                Content = "What is the capital of France?",
                Topic = "Geography",
                Answers = new List<Answer>
                {
                    new Answer { Content = "London", IsCorrect = false },
                    new Answer { Content = "Paris", IsCorrect = true },
                    new Answer { Content = "Berlin", IsCorrect = false }
                }
            };
            context.Questions.Add(question);
            await context.SaveChangesAsync();

            var correctAnswer = question.Answers.First(a => a.IsCorrect);

            // Create multiple quiz results using this question
            var result1 = new Result { UserId = user1.Id, Score = 1, ToalQuestions = 1, CreateAt = DateTime.UtcNow };
            var result2 = new Result { UserId = user2.Id, Score = 1, ToalQuestions = 1, CreateAt = DateTime.UtcNow };
            context.Results.AddRange(result1, result2);
            await context.SaveChangesAsync();

            // Create multiple ResultDetails referencing the same question
            var resultDetail1 = new ResultDetail
            {
                ResultId = result1.Id,
                QuestionId = question.Id,
                AnwserId = correctAnswer.Id,
                SelectedAnwserId = correctAnswer.Id,
                IsCorrect = true
            };
            var resultDetail2 = new ResultDetail
            {
                ResultId = result2.Id,
                QuestionId = question.Id,
                AnwserId = correctAnswer.Id,
                SelectedAnwserId = correctAnswer.Id,
                IsCorrect = true
            };
            context.ResultDetails.AddRange(resultDetail1, resultDetail2);
            await context.SaveChangesAsync();

            var questionId = question.Id;
            var resultDetailIds = new[] { resultDetail1.Id, resultDetail2.Id };

            // Act - Attempt to delete the question
            var deleteResult = await questionService.DeleteQuestionAsync(questionId);

            // Assert - Expected behavior after fix
            Assert.True(deleteResult, "DeleteQuestionAsync should return true");

            // Verify question is deleted
            var deletedQuestion = await context.Questions.FindAsync(questionId);
            Assert.Null(deletedQuestion);

            // Verify all ResultDetails still exist but QuestionId is set to null
            foreach (var rdId in resultDetailIds)
            {
                var updatedResultDetail = await context.ResultDetails.FindAsync(rdId);
                Assert.NotNull(updatedResultDetail);
                Assert.True(updatedResultDetail.QuestionId == null || updatedResultDetail.QuestionId == 0,
                    "QuestionId should be null after question deletion");
            }

            // Verify Results still exist
            Assert.NotNull(await context.Results.FindAsync(result1.Id));
            Assert.NotNull(await context.Results.FindAsync(result2.Id));
        }
    }
}
