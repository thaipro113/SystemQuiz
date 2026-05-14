namespace SystemQuiz.Models
{
    public class ResultDetail
    {
        public int Id { get; set; }
        public int ResultId { get; set; }
        public Result Result { get; set; }
        public int? QuestionId { get; set; }
        public Question? Question { get; set; }
        public int? AnwserId { get; set; }
        public Answer? Anwser { get; set; }
        public int? SelectedAnwserId { get; set; }
        public bool IsCorrect { get; set; }
    }
}
