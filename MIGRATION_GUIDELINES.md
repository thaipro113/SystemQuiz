# Entity Framework Migration Guidelines

## 🔄 Workflow cho Team Development

### Khi Pull Code Mới
```bash
# 1. Pull latest code
git pull origin develop

# 2. Check migration status
dotnet ef migrations list

# 3. Update database
dotnet ef database update
```

### Khi Tạo Migration Mới
```bash
# 1. Đảm bảo database đã update
dotnet ef database update

# 2. Tạo migration với tên mô tả rõ ràng
dotnet ef migrations add AddUserProfileFields

# 3. Review migration file trước khi commit
# Kiểm tra Up() và Down() methods

# 4. Test migration
dotnet ef database update

# 5. Commit migration files
git add Migrations/
git commit -m "Add migration: AddUserProfileFields"
```

## ⚠️ Xử lý Migration Conflicts

### Khi có conflict migrations:
1. **Không bao giờ edit migration đã được apply**
2. **Tạo migration mới để fix thay vì edit cũ**
3. **Coordinate với team trước khi merge**

### Reset Database (chỉ trong Development):
```bash
dotnet ef database drop
dotnet ef database update
```

### Revert Migration:
```bash
dotnet ef database update PreviousMigrationName
dotnet ef migrations remove
```

## 📋 Naming Conventions

- `AddTableName` - Tạo table mới
- `UpdateTableNameAddColumn` - Thêm column
- `RemoveColumnFromTableName` - Xóa column
- `FixTableNameIssue` - Fix lỗi cụ thể

## 🚫 Tránh

- Không edit migration đã apply
- Không xóa migration đã push lên remote
- Không tạo migration trống
- Không commit migration chưa test

## ✅ Best Practices

- Luôn backup database trước khi apply migration
- Test migration trên local trước
- Review migration code cẩn thận
- Coordinate với team khi có thay đổi lớn
- Sử dụng tên migration mô tả rõ ràng