namespace SystemQuiz.Models
{
    public class Result
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } 
        public int Score { get; set; }
        public int ToalQuestions { get; set; }
        public DateTime CreateAt { get; set; }

    }
}
