namespace SystemQuiz.Models
{
    public class Question
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string Topic { get; set; } = "General";
        public List<Answer> Answers { get; set; }
    }
}
