# SystemQuiz - Quiz Management System

Hệ thống quản lý quiz với giao diện admin và tính năng làm bài quiz cho người dùng.

## 🏗️ Kiến trúc hệ thống

- **Backend**: ASP.NET Core 8.0 Web API
- **Frontend**: React 19 + Vite
- **Database**: SQL Server Express
- **Authentication**: JWT Bearer Token

## 📋 Yêu cầu hệ thống

### Backend Requirements
- .NET 8.0 SDK
- SQL Server Express (hoặc SQL Server)
- Visual Studio 2022 (khuyến nghị) hoặc VS Code

### Frontend Requirements
- Node.js 18+ 
- npm hoặc yarn

## 🗄️ Cấu hình Database

### 1. Cài đặt SQL Server Express

Tải và cài đặt SQL Server Express từ [Microsoft](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

### 2. Cấu hình Connection String

Mở file `SystemQuiz/appsettings.json` và cập nhật connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER_NAME\\SQLEXPRESS;Database=SystemQuizDB;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

**Lưu ý**: Thay `YOUR_SERVER_NAME` bằng tên máy tính của bạn.

### 3. Tạo Database

Mở terminal trong thư mục `SystemQuiz` và chạy:

```bash
# Cài đặt EF Core tools (nếu chưa có)
dotnet tool install --global dotnet-ef

# Tạo database và apply migrations
dotnet ef database update
```

### 4. Cập nhật Database (Migrations)

Hệ thống có sự thay đổi cấu trúc bảng, ví dụ như thêm các cột thống kê người dùng (`AddUserStats`), bạn cần chạy lệnh migration để cập nhật database.

**Bảng `Users` vừa được cập nhật thêm 5 cột sau:**
- `TotalXP`: Tổng điểm kinh nghiệm của người dùng.
- `CurrentStreak`: Số ngày học liên tiếp.
- `CompletedQuizzes`: Tổng số bài quiz đã hoàn thành.
- `GlobalRank`: Thứ hạng toàn cầu của người dùng.
- `LastQuizDate`: Thời gian làm bài quiz gần nhất.

**Cách thực hiện (Nếu chưa được cập nhật):**
1. Mở terminal tại thư mục `SystemQuiz` (chứa backend).
2. Chạy lệnh tạo migration (nếu bạn là người thay đổi code):
   ```bash
   dotnet ef migrations add AddUserStats
   ```
3. Chạy lệnh cập nhật database:
   ```bash
   dotnet ef database update
   ```
4. Nếu kết quả báo `✅ Migration thành công!` nghĩa là Database của bạn đã sẵn sàng.

## 🚀 Cách chạy ứng dụng

### 1. Chạy Backend (API)

**Cách 1: Sử dụng Visual Studio**
- Mở file `SystemQuiz.sln`
- Nhấn F5 hoặc click "Start Debugging"
- API sẽ chạy tại: `https://localhost:44301`

**Cách 2: Sử dụng Command Line**
```bash
cd SystemQuiz
dotnet run
```

### 2. Chạy Frontend (React)

Mở terminal mới trong thư mục `quiz-frontend`:

```bash
cd quiz-frontend

# Cài đặt dependencies (lần đầu)
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 👤 Tài khoản mặc định

Hệ thống sẽ tự động tạo tài khoản admin mặc định:

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin

## 📱 Tính năng chính

### 🔐 Authentication
- Đăng ký/Đăng nhập người dùng
- JWT Token authentication
- Phân quyền Admin/User

### 👨‍💼 Admin Dashboard
- ✅ Quản lý câu hỏi (CRUD)
- ✅ Collapsible topic sections
- ✅ Thêm câu hỏi nhanh theo topic
- ✅ Phát hiện topic trùng lặp
- ✅ Xóa câu hỏi (kể cả đã dùng trong quiz)

### 🎯 Quiz Features
- Làm bài quiz theo topic
- Hiển thị kết quả chi tiết
- Lưu lịch sử làm bài

## 🛠️ Cấu trúc dự án

```
SystemQuiz/
├── SystemQuiz/                 # Backend API
│   ├── Controllers/           # API Controllers
│   ├── Models/               # Database Models
│   ├── Services/             # Business Logic
│   ├── DTOs/                 # Data Transfer Objects
│   ├── Migrations/           # EF Core Migrations
│   └── appsettings.json      # Configuration
├── quiz-frontend/            # Frontend React App
│   ├── src/
│   │   ├── components/       # React Components
│   │   ├── utils/           # API utilities
│   │   └── assets/          # Static assets
│   └── package.json         # Frontend dependencies
└── README.md                # This file
```

## 🔧 Troubleshooting

### Lỗi kết nối Database
```
Cannot connect to SQL Server
```
**Giải pháp:**
1. Kiểm tra SQL Server Express đã chạy
2. Cập nhật connection string với tên server đúng
3. Chạy `dotnet ef database update`

### Lỗi CORS
```
Access to XMLHttpRequest blocked by CORS policy
```
**Giải pháp:**
- Đảm bảo backend chạy trên port 44301
- Kiểm tra cấu hình CORS trong `Program.cs`

### Lỗi Migration
```
Unable to create migration
```
**Giải pháp:**
```bash
# Xóa migrations cũ (nếu cần)
dotnet ef migrations remove

# Tạo migration mới
dotnet ef migrations add InitialCreate

# Apply migration
dotnet ef database update
```

## 🆕 Tính năng mới đã thêm

### ✅ Collapsible Topic Sections
- Click vào topic header để thu gọn/mở rộng
- Icon mũi tên xoay với animation mượt mà
- Badge hiển thị số lượng câu hỏi
- Keyboard navigation (Tab, Enter, Space)
- ARIA attributes cho accessibility

### ✅ Quick Add Question
- Nút "+ Add Question" trên mỗi topic
- Tự động điền topic khi thêm câu hỏi
- Không cần nhập lại topic name

### ✅ Duplicate Topic Detection
- Tự động phát hiện topic trùng lặp
- Hiển thị cảnh báo màu đỏ
- Gợi ý chỉnh sửa để thống nhất

### ✅ Enhanced Question Deletion
- Xóa được câu hỏi đã dùng trong quiz
- Preserve historical quiz data
- Detailed error messages

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Questions (Admin only)
- `GET /api/questions` - Lấy danh sách câu hỏi
- `POST /api/questions` - Tạo câu hỏi mới
- `PUT /api/questions/{id}` - Cập nhật câu hỏi
- `DELETE /api/questions/{id}` - Xóa câu hỏi

### Quiz
- `POST /api/quiz/submit` - Nộp bài quiz
- `GET /api/quiz/results` - Lấy kết quả quiz

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

