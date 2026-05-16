# Setup Instructions

## 🔧 Local Development Setup

### 1. Create Local Configuration File

Create `appsettings.Local.json` in the SystemQuiz folder with your actual values:

```json
{
  "Jwt": {
    "Key": "YOUR_ACTUAL_JWT_SECRET_KEY_HERE_MINIMUM_32_CHARACTERS",
    "Issuer": "QuizAPI",
    "Audience": "QuizAPIUsers"
  },

  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=SystemQuizDB;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

### 2. Generate JWT Secret Key

Use a strong secret key (minimum 32 characters). You can generate one using:

```bash
# PowerShell
[System.Web.Security.Membership]::GeneratePassword(64, 10)

# Or online generator
# https://generate-random.org/api-key-generator
```

### 3. Update Connection String

Update the connection string to match your SQL Server instance:

- Local SQL Server: `Server=.\\SQLEXPRESS;Database=SystemQuizDB;Trusted_Connection=True;TrustServerCertificate=True`
- SQL Server with credentials: `Server=localhost;Database=SystemQuizDB;User Id=sa;Password=YourPassword;TrustServerCertificate=True`

### 4. Run Migrations

```bash
dotnet ef database update
```

### 5. Run Application

```bash
dotnet run
```

## ⚠️ Security Notes

- **NEVER** commit `appsettings.Local.json` to git
- **NEVER** put real secrets in `appsettings.json`
- Use environment variables in production
- Rotate JWT keys regularly

## 🚀 Production Deployment

For production, use environment variables or Azure Key Vault:

```bash
export JWT__KEY="your-production-jwt-key"
export CONNECTIONSTRINGS__DEFAULTCONNECTION="your-production-connection-string"
```