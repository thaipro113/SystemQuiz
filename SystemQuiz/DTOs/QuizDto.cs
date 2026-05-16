namespace SystemQuiz.DTOs
{
    public class SubmitQuizDto
    {
        public List<SubmitAnswerDto> Answers { get; set; }
    }

    public class SubmitAnswerDto
    {
        public int QuestionId { get; set; }
        public int SelectedAnswerId { get; set; }
    }

    public class QuizResultDto
    {
        public int Score { get; set; }
        public int TotalQuestions { get; set; }
        public List<ResultDetailDto> Details { get; set; }
    }

    public class ResultDetailDto
    {
        public int QuestionId { get; set; }
        public string QuestionContent { get; set; }
        public string SelectedAnswerContent { get; set; }
        public bool IsCorrect { get; set; }
    }

    public class QuizDisplayDto
    {
        public string Topic { get; set; }
        public int QuestionCount { get; set; }
        public string Difficulty { get; set; }
        public int EstimatedTime { get; set; }
        public int PlayersCount { get; set; }
    }

    public class LeaderboardEntryDto
    {
        public int Rank { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public int TotalXP { get; set; }
    }
}
