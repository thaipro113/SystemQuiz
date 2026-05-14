using Microsoft.EntityFrameworkCore;
using System;

namespace SystemQuiz.Models
{
    public class QuizDbContext: DbContext
    {
        public QuizDbContext(DbContextOptions<QuizDbContext> options)
        : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<Result> Results { get; set; }
        public DbSet<ResultDetail> ResultDetails { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ResultDetail>()
                .HasOne(rd => rd.Question)
                .WithMany()
                .HasForeignKey(rd => rd.QuestionId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            modelBuilder.Entity<ResultDetail>()
                .HasOne(rd => rd.Anwser)
                .WithMany()
                .HasForeignKey(rd => rd.AnwserId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            modelBuilder.Entity<ResultDetail>()
                .HasOne(rd => rd.Result)
                .WithMany()
                .HasForeignKey(rd => rd.ResultId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
