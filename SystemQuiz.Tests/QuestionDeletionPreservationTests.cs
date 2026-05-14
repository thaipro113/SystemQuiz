using Microsoft.EntityFrameworkCore;
using SystemQuiz.Models;
using SystemQuiz.Services;

namespace SystemQuiz.Tests
{
    /// <summary>
    /// Preservation Property Tests for Question Deletion without Result Details
    /// **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
    /// 
    /// IMPORTANT: These tests verify baseline behavior on UNFIXED code
    /// EXPECTED OUTCOME: Tests PASS (this confirms baseline behavior to preserve)
    /// 
    /// These tests ensure that the fix does not break existing deletion functionality
    /// for questions that do NOT have associated ResultDetail records.
    /// </summary>
    public class QuestionDeletionPreservationTests
    {
        /// <summary>
        /// Property 2: Preservation - Question Deletion without Result Details
        /// 
        /// For any delete request where a question does NOT have associated ResultDetail records,
        /// the code SHALL successfully delete the question and its associated answers.
        /// 
        /// **Validates: Requirements 3.1, 3.2**
        /// </summary>
        [Fact]
        public async Task DeleteQuestionAsync_WithoutResultDetails_ShouldSucceedAndDeleteAnswers()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<QuizDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_Preservation_NoResults_" + Guid.NewGuid())
                .Options;

            using var context = new QuizDbContext(options);
            var questionService = new QuestionService(context);

            // Create a question with answers (NOT used in any quiz results)
            var question = new Question
            {
                Content = "What is 5+5?",
                Topic = "Math",
                Answers = new List<Answer>
                {
                    new Answer { Content = "8", IsCorrect = false },
                    new Answer { Content = "10", IsCorrect = true },
                    new Answer { Content = "12", IsCorrect = false }
                }
            };
            context.Questions.Add(question);
            await context.SaveChangesAsync();

            var questionId = question.Id;
            var answerIds = question.Answers.Select(a => a.Id).ToList();

            // Act - Delete the question
            var deleteResult = await questionService.DeleteQuestionAsync(questionId);

            // Assert - Expected behavior (baseline to preserve)
            Assert.True(deleteResult, "DeleteQuestionAsync should return true for questions without result details");

            // Verify question is deleted
            var deletedQuestion = await context.Questions.FindAsync(questionId);
            Assert.Null(deletedQuestion);

            // Verify all answers are cascade deleted
            foreach (var answerId in answerIds)
            {
                var deletedAnswer = await context.Answers.FindAsync(answerId);
                Assert.Null(deletedAnswer);
            }
        }

        /// <summary>
        /// Property 2: Preservation - Question Deletion with Multiple Answers
        /// 
        /// Verifies that questions with many answers (but no result details) are deleted
        /// successfully along with all their answers.
        /// 
        /// **Validates: Requirements 3.1, 3.2**
        /// </summary>
        [Fact]
        public async Task DeleteQuestionAsync_WithMultipleAnswersNoResults_ShouldDeleteAllAnswers()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<QuizDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_Preservation_MultiAnswers_" + Guid.NewGuid())
                .Options;

            using var context = new QuizDbContext(options);
            var questionService = new QuestionService(context);

            // Create a question with many answers
            var question = new Question
            {
                Content = "Which of these are programming languages?",
                Topic = "Computer Science",
                Answers = new List<Answer>
                {
                    new Answer { Content = "Python", IsCorrect = true },
                    new Answer { Content = "Java", IsCorrect = true },
                    new Answer { Content = "HTML", IsCorrect = false },
                    new Answer { Content = "C#", IsCorrect = true },
                    new Answer { Content = "CSS", IsCorrect = false }
                }
            };
            context.Questions.Add(question);
            await context.SaveChangesAsync();

            var questionId = question.Id;
            var answerCount = question.Answers.Count;
            var answerIds = question.Answers.Select(a => a.Id).ToList();

            // Act
            var deleteResult = await questionService.DeleteQuestionAsync(questionId);

            // Assert
            Assert.True(deleteResult);
            Assert.Null(await context.Questions.FindAsync(questionId));

            // Verify all answers are deleted
            foreach (var answerId in answerIds)
            {
                Assert.Null(await context.Answers.FindAsync(answerId));
            }

            // Verify answer count in database
            var remainingAnswers = await context.Answers.Where(a => answerIds.Contains(a.Id)).ToListAsync();
            Assert.Empty(remainingAnswers);
        }

        /// <summary>
        /// Property 2: Preservation - Non-existent Question ID
        /// 
        /// Verifies that attempting to delete a non-existent question returns false.
        /// 
        /// **Validates: Requirements 3.3**
        /// </summary>
        [Fact]
        public async Task DeleteQuestionAsync_WithNonExistentId_ShouldReturnFalse()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<QuizDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_Preservation_NonExistent_" + Guid.NewGuid())
                .Options;

            using var context = new QuizDbContext(options);
            var questionService = new QuestionService(context);

            var nonExistentId = 99999;

            // Act
            var deleteResult = await questionService.DeleteQuestionAsync(nonExistentId);

            // Assert - Expected behavior (baseline to preserve)
            Assert.False(deleteResult, "DeleteQuestionAsync should return false for non-existent question IDs");
        }

        /// <summary>
        /// Property 2: Preservation - Multiple Questions Deletion
        /// 
        /// Verifies that multiple questions without result details can be deleted
        /// independently without affecting each other.
        /// 
        /// **Validates: Requirements 3.1, 3.2**
        /// </summary>
        [Fact]
        public async Task DeleteQuestionAsync_MultipleQuestionsWithoutResults_ShouldDeleteIndependently()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<QuizDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_Preservation_Multiple_" + Guid.NewGuid())
                .Options;

            using var context = new QuizDbContext(options);
            var questionService = new QuestionService(context);

            // Create multiple questions
            var question1 = new Question
            {
                Content = "Question 1",
                Topic = "Topic A",
                Answers = new List<Answer>
                {
                    new Answer { Content = "A1", IsCorrect = true },
                    new Answer { Content = "A2", IsCorrect = false }
                }
            };
            var question2 = new Question
            {
                Content = "Question 2",
                Topic = "Topic B",
                Answers = new List<Answer>
                {
                    new Answer { Content = "B1", IsCorrect = false },
                    new Answer { Content = "B2", IsCorrect = true }
                }
            };
            var question3 = new Question
            {
                Content = "Question 3",
                Topic = "Topic C",
                Answers = new List<Answer>
                {
                    new Answer { Content = "C1", IsCorrect = true },
                    new Answer { Content = "C2", IsCorrect = false }
                }
            };

            context.Questions.AddRange(question1, question2, question3);
            await context.SaveChangesAsync();

            var q1Id = question1.Id;
            var q2Id = question2.Id;
            var q3Id = question3.Id;

            // Act - Delete question 2
            var deleteResult = await questionService.DeleteQuestionAsync(q2Id);

            // Assert
            Assert.True(deleteResult);

            // Verify question 2 is deleted
            Assert.Null(await context.Questions.FindAsync(q2Id));

            // Verify questions 1 and 3 still exist
            Assert.NotNull(await context.Questions.FindAsync(q1Id));
            Assert.NotNull(await context.Questions.FindAsync(q3Id));

            // Verify question 2's answers are deleted
            var q2Answers = await context.Answers.Where(a => a.QuestionId == q2Id).ToListAsync();
            Assert.Empty(q2Answers);

            // Verify questions 1 and 3's answers still exist
            var q1Answers = await context.Answers.Where(a => a.QuestionId == q1Id).ToListAsync();
            var q3Answers = await context.Answers.Where(a => a.QuestionId == q3Id).ToListAsync();
            Assert.NotEmpty(q1Answers);
            Assert.NotEmpty(q3Answers);
        }

        /// <summary>
        /// Property 2: Preservation - Question with No Answers
        /// 
        /// Verifies that questions without any answers can be deleted successfully.
        /// Edge case: empty answer list.
        /// 
        /// **Validates: Requirements 3.1**
        /// </summary>
        [Fact]
        public async Task DeleteQuestionAsync_WithNoAnswers_ShouldSucceed()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<QuizDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_Preservation_NoAnswers_" + Guid.NewGuid())
                .Options;

            using var context = new QuizDbContext(options);
            var questionService = new QuestionService(context);

            // Create a question with no answers
            var question = new Question
            {
                Content = "Question with no answers",
                Topic = "Test",
                Answers = new List<Answer>()
            };
            context.Questions.Add(question);
            await context.SaveChangesAsync();

            var questionId = question.Id;

            // Act
            var deleteResult = await questionService.DeleteQuestionAsync(questionId);

            // Assert
            Assert.True(deleteResult);
            Assert.Null(await context.Questions.FindAsync(questionId));
        }

        /// <summary>
        /// Property 2: Preservation - Mixed Scenario
        /// 
        /// Tests a realistic scenario where some questions have result details and some don't.
        /// Verifies that questions WITHOUT result details can still be deleted successfully
        /// even when other questions in the database have result details.
        /// 
        /// **Validates: Requirements 3.1, 3.2**
        /// </summary>
        [Fact]
        public async Task DeleteQuestionAsync_MixedScenario_ShouldDeleteOnlyQuestionsWithoutResults()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<QuizDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_Preservation_Mixed_" + Guid.NewGuid())
                .Options;

            using var context = new QuizDbContext(options);
            var questionService = new QuestionService(context);

            // Create a user
            var user = new User
            {
                UserName = "testuser",
                Name = "Test User",
                PasswordHash = "hash",
                Role = "Student"
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            // Create two questions
            var questionWithResults = new Question
            {
                Content = "Question used in quiz",
                Topic = "Used",
                Answers = new List<Answer>
                {
                    new Answer { Content = "Answer 1", IsCorrect = true }
                }
            };
            var questionWithoutResults = new Question
            {
                Content = "Question not used in quiz",
                Topic = "Unused",
                Answers = new List<Answer>
                {
                    new Answer { Content = "Answer A", IsCorrect = true },
                    new Answer { Content = "Answer B", IsCorrect = false }
                }
            };

            context.Questions.AddRange(questionWithResults, questionWithoutResults);
            await context.SaveChangesAsync();

            // Create a result that uses the first question
            var result = new Result
            {
                UserId = user.Id,
                Score = 1,
                ToalQuestions = 1,
                CreateAt = DateTime.UtcNow
            };
            context.Results.Add(result);
            await context.SaveChangesAsync();

            var resultDetail = new ResultDetail
            {
                ResultId = result.Id,
                QuestionId = questionWithResults.Id,
                AnwserId = questionWithResults.Answers.First().Id,
                SelectedAnwserId = questionWithResults.Answers.First().Id,
                IsCorrect = true
            };
            context.ResultDetails.Add(resultDetail);
            await context.SaveChangesAsync();

            var unusedQuestionId = questionWithoutResults.Id;
            var unusedAnswerIds = questionWithoutResults.Answers.Select(a => a.Id).ToList();

            // Act - Delete the question WITHOUT result details
            var deleteResult = await questionService.DeleteQuestionAsync(unusedQuestionId);

            // Assert - Should succeed (baseline behavior to preserve)
            Assert.True(deleteResult, "Should be able to delete questions without result details");

            // Verify the unused question is deleted
            Assert.Null(await context.Questions.FindAsync(unusedQuestionId));

            // Verify its answers are deleted
            foreach (var answerId in unusedAnswerIds)
            {
                Assert.Null(await context.Answers.FindAsync(answerId));
            }

            // Verify the question WITH result details still exists
            Assert.NotNull(await context.Questions.FindAsync(questionWithResults.Id));

            // Verify the result detail still exists
            Assert.NotNull(await context.ResultDetails.FindAsync(resultDetail.Id));
        }
    }
}
