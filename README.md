# QuickLang

Ứng dụng flashcard học ngôn ngữ, có tích hợp tính năng ôn tập và kiểm tra nhanh. 

## Yêu cầu
- Node.js 18+
- Docker (để chạy PostgreSQL)

## Thiết lập và chạy local
1) Thiết lập nhanh (cài phụ thuộc, tạo `.env.local` nếu chưa có, khởi động PostgreSQL):  
```bash
make setup
```

2) Chạy server development  
```bash
make start
```

3) Mở ứng dụng tại http://localhost:3000
