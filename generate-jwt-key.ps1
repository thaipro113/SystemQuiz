# Generate JWT Secret Key
# Run this script to generate a new JWT secret key

Write-Host "Generating new JWT secret key..." -ForegroundColor Green

# Generate a random 64-character key
$key = [System.Web.Security.Membership]::GeneratePassword(64, 10)

Write-Host ""
Write-Host "New JWT Key:" -ForegroundColor Yellow
Write-Host $key -ForegroundColor Cyan
Write-Host ""
Write-Host "Copy this key to your appsettings.Local.json file" -ForegroundColor Green
Write-Host ""

# Also show base64 encoded version
$bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
$base64 = [System.Convert]::ToBase64String($bytes)

Write-Host "Base64 encoded version:" -ForegroundColor Yellow
Write-Host $base64 -ForegroundColor Cyan
Write-Host ""