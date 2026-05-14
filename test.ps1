[Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
$token = "YOUR_TOKEN"
# We can just fetch the token by logging in first
$loginResponse = Invoke-RestMethod -Uri "https://localhost:44301/api/auth/login" -Method Post -ContentType "application/json" -Body '{"userName": "admin", "password": "123"}'
$token = $loginResponse.token

$quizResponse = Invoke-RestMethod -Uri "https://localhost:44301/api/questions" -Method Get
$qId = $quizResponse[0].id
$aId = $quizResponse[0].answers[0].id

$body = @{
    answers = @(
        @{
            questionId = $qId
            selectedAnswerId = $aId
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://localhost:44301/api/quiz/submit" -Method Post -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body $body
