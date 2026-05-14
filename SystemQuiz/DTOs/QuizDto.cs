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
}
