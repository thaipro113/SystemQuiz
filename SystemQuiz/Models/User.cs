namespace SystemQuiz.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string PasswordHash { get; set; }
        public string UserName { get; set; }
        public string Role { get; set; } = "User";
        public int TotalXP { get; set; } = 0;
        public int CurrentStreak { get; set; } = 0;
        public DateTime LastQuizDate { get; set; } = DateTime.MinValue;
        public int CompletedQuizzes { get; set; } = 0;
        public int GlobalRank { get; set; } = 0;
    }
}
