namespace SystemQuiz.DTOs
{
    public class QuestionDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string Topic { get; set; }
        public List<AnswerDto> Answers { get; set; }
    }

    public class CreateQuestionDto
    {
        public string Content { get; set; }
        public string Topic { get; set; }
        public List<CreateAnswerDto> Answers { get; set; }
    }

    public class AnswerDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public bool IsCorrect { get; set; }
    }

    public class CreateAnswerDto
    {
        public string Content { get; set; }
        public bool IsCorrect { get; set; }
    }
}
