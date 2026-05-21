using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SystemQuiz.Models;

namespace SystemQuiz
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add Local configuration file (not committed to git)
            builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

            // Add services to the container.
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
            builder.Services.AddDbContext<QuizDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));
            builder.Services.AddAuthorization();
            builder.Services.AddControllers();
            builder.Services.AddScoped<SystemQuiz.Services.IAuthService, SystemQuiz.Services.AuthService>();
            builder.Services.AddScoped<SystemQuiz.Services.IQuestionService, SystemQuiz.Services.QuestionService>();
            builder.Services.AddScoped<SystemQuiz.Services.IQuizService, SystemQuiz.Services.QuizService>();

            // Add Health Checks
            builder.Services.AddHealthChecks()
                .AddCheck("api", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("API is running"))
                .AddCheck("database", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("Database OK"))
                .AddCheck("memory", () => 
                {
                    var memoryUsed = GC.GetTotalMemory(false);
                    return memoryUsed < 100_000_000 
                        ? Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy($"Memory usage: {memoryUsed / 1024 / 1024} MB")
                        : Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Degraded($"High memory usage: {memoryUsed / 1024 / 1024} MB");
                });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "SystemQuiz API", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });
                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader());
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // app.UseHttpsRedirection();

            app.UseCors("AllowAll");

            app.UseAuthentication();

            app.UseAuthorization();


            app.MapControllers();

            // Map Health Check endpoints
            app.MapHealthChecks("/api/health");

            // Automatically apply database migrations and seed data on startup
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<QuizDbContext>();
                db.Database.Migrate();

                // Seed questions if empty
                if (!db.Questions.Any())
                {
                    var q1 = new SystemQuiz.Models.Question
                    {
                        Content = "Ngôn ngữ lập trình (đánh dấu) nào được sử dụng chính để xây dựng cấu trúc nội dung của một trang web?",
                        Topic = "Lập trình",
                        Answers = new List<SystemQuiz.Models.Answer>
                        {
                            new SystemQuiz.Models.Answer { Content = "HTML", IsCorrect = true },
                            new SystemQuiz.Models.Answer { Content = "CSS", IsCorrect = false },
                            new SystemQuiz.Models.Answer { Content = "JavaScript", IsCorrect = false },
                            new SystemQuiz.Models.Answer { Content = "C++", IsCorrect = false }
                        }
                    };
                    var q2 = new SystemQuiz.Models.Question
                    {
                        Content = "Chiến thắng lịch sử Điện Biên Phủ của quân và dân Việt Nam diễn ra vào năm nào?",
                        Topic = "Lịch sử",
                        Answers = new List<SystemQuiz.Models.Answer>
                        {
                            new SystemQuiz.Models.Answer { Content = "1954", IsCorrect = true },
                            new SystemQuiz.Models.Answer { Content = "1945", IsCorrect = false },
                            new SystemQuiz.Models.Answer { Content = "1975", IsCorrect = false },
                            new SystemQuiz.Models.Answer { Content = "1930", IsCorrect = false }
                        }
                    };
                    var q3 = new SystemQuiz.Models.Question
                    {
                        Content = "Ngọn núi nào cao nhất Việt Nam và được mệnh danh là \"Nóc nhà Đông Dương\"?",
                        Topic = "Địa lý",
                        Answers = new List<SystemQuiz.Models.Answer>
                        {
                            new SystemQuiz.Models.Answer { Content = "Fansipan", IsCorrect = true },
                            new SystemQuiz.Models.Answer { Content = "Tây Côn Lĩnh", IsCorrect = false },
                            new SystemQuiz.Models.Answer { Content = "Chứa Chan", IsCorrect = false },
                            new SystemQuiz.Models.Answer { Content = "Ba Vì", IsCorrect = false }
                        }
                    };
                    var q4 = new SystemQuiz.Models.Question
                    {
                        Content = "Hành tinh nào nằm gần Mặt Trời nhất trong Hệ Mặt Trời?",
                        Topic = "Khoa học",
                        Answers = new List<SystemQuiz.Models.Answer>
                        {
                            new SystemQuiz.Models.Answer { Content = "Sao Thủy", IsCorrect = true },
                            new SystemQuiz.Models.Answer { Content = "Sao Kim", IsCorrect = false },
                            new SystemQuiz.Models.Answer { Content = "Trái Đất", IsCorrect = false },
                            new SystemQuiz.Models.Answer { Content = "Sao Hỏa", IsCorrect = false }
                        }
                    };
                    var q5 = new SystemQuiz.Models.Question
                    {
                        Content = "Trong ngôn ngữ JavaScript, từ khóa nào dùng để khai báo một biến có phạm vi khối (block-scope) và có thể gán lại giá trị?",
                        Topic = "Lập trình",
                        Answers = new List<SystemQuiz.Models.Answer>
                        {
                            new SystemQuiz.Models.Answer { Content = "let", IsCorrect = true },
                            new SystemQuiz.Models.Answer { Content = "var", IsCorrect = false },
                            new SystemQuiz.Models.Answer { Content = "const", IsCorrect = false },
                            new SystemQuiz.Models.Answer { Content = "define", IsCorrect = false }
                        }
                    };
                    db.Questions.AddRange(q1, q2, q3, q4, q5);
                    db.SaveChanges();
                }
            }

            app.Run();
        }
    }
}
