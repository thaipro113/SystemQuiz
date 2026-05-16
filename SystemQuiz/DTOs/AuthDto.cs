namespace SystemQuiz.DTOs
{
    public class RegisterDto
    {
        public string Name { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string? Role { get; set; }
    }

    public class LoginDto
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }

    public class AuthResponseDto
    {
        public string Token { get; set; }
        public string UserName { get; set; }
        public string Role { get; set; }
        public int UserId { get; set; }
        public int TotalXP { get; set; }
        public int CurrentStreak { get; set; }
        public int CompletedQuizzes { get; set; }
        public int GlobalRank { get; set; }
    }

    public class UserStatsDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public int TotalXP { get; set; }
        public int CurrentStreak { get; set; }
        public int CompletedQuizzes { get; set; }
        public int GlobalRank { get; set; }
    }
}
