# Hướng Dẫn Chuyển Sang MongoDB Atlas

## 🚀 Bước 1: Tạo MongoDB Atlas Cluster

### 1.1 Đăng ký MongoDB Atlas
- Truy cập: https://www.mongodb.com/atlas
- Click "Try Free" và đăng ký tài khoản

### 1.2 Tạo Database
1. Click "Build a Database"
2. Chọn "FREE" tier (M0)
3. Chọn cloud provider (AWS/Google Cloud/Azure)
4. Chọn region gần nhất (ví dụ: Singapore)
5. Click "Create"

### 1.3 Cấu hình Security

#### Tạo Database User:
1. Vào "Database Access"
2. Click "Add New Database User"
3. Chọn "Password" authentication
4. Tạo username và password (lưu lại!)
5. Chọn "Read and write to any database"
6. Click "Add User"

#### Cấu hình Network Access:
1. Vào "Network Access"
2. Click "Add IP Address"
3. Chọn "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## 🔗 Bước 2: Lấy Connection String

1. Vào "Database" tab
2. Click "Connect"
3. Chọn "Connect your application"
4. Copy connection string

Connection string sẽ có dạng:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

## ⚙️ Bước 3: Cấu Hình Environment Variables

### 3.1 Tạo file .env trong thư mục serverNode_datn:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/datn_v2?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### 3.2 Cấu hình Railway Environment Variables:
1. Vào Railway Dashboard
2. Chọn project backend
3. Vào "Variables" tab
4. Thêm các biến môi trường như trên

## 📦 Bước 4: Migration Data

### 4.1 Chạy script migration:
```bash
cd serverNode_datn
node migrate-to-atlas.js
```

### 4.2 Hoặc export/import thủ công:
```bash
# Export từ MongoDB local
mongodump --db DATN_V2 --out ./backup

# Import vào MongoDB Atlas
mongorestore --uri "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/datn_v2" ./backup/DATN_V2
```

## 🧪 Bước 5: Test Connection

### 5.1 Test local:
```bash
cd serverNode_datn
npm start
```

### 5.2 Test Railway deployment:
- Deploy lên Railway
- Kiểm tra logs để đảm bảo kết nối thành công

## 🔧 Troubleshooting

### Lỗi Connection:
- Kiểm tra username/password trong connection string
- Đảm bảo IP whitelist đã được cấu hình
- Kiểm tra network access settings

### Lỗi Authentication:
- Đảm bảo database user có quyền read/write
- Kiểm tra database name trong connection string

### Lỗi CORS:
- Cập nhật CORS_ORIGIN với domain Vercel thực tế
- Kiểm tra CORS configuration trong code

## 📝 Lưu Ý Quan Trọng

1. **Backup Data**: Luôn backup data trước khi migration
2. **Environment Variables**: Không commit file .env lên git
3. **Security**: Sử dụng strong password cho database user
4. **Monitoring**: Theo dõi MongoDB Atlas metrics
5. **Cost**: Free tier có giới hạn, theo dõi usage

## 🎯 Kết Quả

Sau khi hoàn thành:
- ✅ Database chạy trên cloud
- ✅ Có thể truy cập từ mọi nơi
- ✅ Backup tự động
- ✅ Monitoring và alerting
- ✅ Scalable và reliable 