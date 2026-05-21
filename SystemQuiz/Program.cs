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
                    builder.Configuration.GetConnectionString("DefaultConnection"),
                    sqlOptions =>
                    {
                        sqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 3,
                            maxRetryDelay: TimeSpan.FromSeconds(5),
                            errorNumbersToAdd: null);
                        sqlOptions.CommandTimeout(60);
                    }));
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

            // Exception Handler - Simple approach
            if (app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler(exceptionHandlerApp =>
                {
                    exceptionHandlerApp.Run(async context =>
                    {
                        var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
                        var exception = exceptionHandlerPathFeature?.Error;

                        if (exception != null)
                        {
                            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
                            logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

                            context.Response.StatusCode = GetStatusCodeFromException(exception);
                            context.Response.ContentType = "application/json";

                            var response = new
                            {
                                error = new
                                {
                                    message = exception.Message,
                                    type = exception.GetType().Name,
                                    stackTrace = exception.StackTrace,
                                    innerException = exception.InnerException?.Message,
                                    timestamp = DateTime.UtcNow
                                }
                            };

                            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response, new System.Text.Json.JsonSerializerOptions
                            {
                                PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase,
                                WriteIndented = true
                            }));
                        }
                    });
                });
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            else
            {
                app.UseExceptionHandler(exceptionHandlerApp =>
                {
                    exceptionHandlerApp.Run(async context =>
                    {
                        var exceptionHandlerPathFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
                        var exception = exceptionHandlerPathFeature?.Error;

                        if (exception != null)
                        {
                            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
                            logger.LogError(exception, "An unhandled exception occurred");

                            context.Response.StatusCode = GetStatusCodeFromException(exception);
                            context.Response.ContentType = "application/json";

                            var response = new
                            {
                                error = new
                                {
                                    message = "An error occurred while processing your request.",
                                    timestamp = DateTime.UtcNow
                                }
                            };

                            await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
                        }
                    });
                });
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowAll");

            app.UseAuthentication();

            app.UseAuthorization();


            app.MapControllers();

            // Map Health Check endpoints
            app.MapHealthChecks("/api/health");

            app.Run();
        }

        private static int GetStatusCodeFromException(Exception exception)
        {
            return exception switch
            {
                ArgumentNullException => 400,
                ArgumentException => 400,
                UnauthorizedAccessException => 401,
                KeyNotFoundException => 404,
                _ => 500
            };
        }
    }
}
