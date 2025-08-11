# QuickLang - Ứng Dụng Flashcard Học Ngôn Ngữ

Ứng dụng học ngôn ngữ hiện đại được xây dựng với Next.js, tích hợp flashcard tương tác, xác thực người dùng và cơ sở dữ liệu PostgreSQL.

## Tính Năng

- 📚 **Flashcard Tương Tác**: Tạo, chỉnh sửa và học từ vựng với hiệu ứng lật thẻ
- 🔐 **Xác Thực**: Đăng nhập bảo mật với NextAuth.js (hỗ trợ Facebook OAuth)
- 💾 **Cơ Sở Dữ Liệu PostgreSQL**: Lưu trữ dữ liệu lâu dài với Docker
- 🎨 **Giao Diện Hiện Đại**: Thiết kế đẹp, responsive với Tailwind CSS
- 📊 **Theo Dõi Học Tập**: Theo dõi số lần ôn tập và mức độ khó của từng thẻ

## Công Nghệ Sử Dụng

- **Frontend**: Next.js 15.4.6, React 19, TypeScript
- **Xác thực**: NextAuth.js
- **Cơ sở dữ liệu**: PostgreSQL với pg driver
- **Container**: Docker & Docker Compose
- **Styling**: Tailwind CSS

## Yêu Cầu Hệ Thống

- Node.js 18+ 
- Docker Desktop (cho PostgreSQL)
- npm hoặc yarn

## Hướng Dẫn Cài Đặt

### 1. Clone repository

```bash
git clone https://github.com/yourusername/quicklang.git
cd quicklang
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env.local` trong thư mục gốc:

```env
# Cấu hình NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Facebook OAuth (tùy chọn)
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Cấu hình PostgreSQL
DB_HOST=localhost
DB_PORT=5433
DB_NAME=quicklang
DB_USER=postgres
DB_PASSWORD=quicklang123
```

### 4. Khởi động cơ sở dữ liệu PostgreSQL

```bash
# Khởi động container PostgreSQL
docker-compose up -d

# Kiểm tra trạng thái
docker-compose ps
```

### 5. Chạy server development

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## Cấu Trúc Dự Án

```
quicklang/
├── app/                    # Thư mục app Next.js
│   ├── api/               # API routes
│   │   ├── auth/          # Endpoints xác thực
│   │   └── flashcards/    # CRUD operations cho flashcard
│   ├── flashcards/        # Các trang flashcard
│   │   ├── [id]/edit/     # Chỉnh sửa flashcard
│   │   ├── new/           # Tạo flashcard mới
│   │   └── study/         # Chế độ học
│   └── layout.tsx         # Layout chính
├── components/            # React components
│   ├── FlashCard.tsx      # Component hiển thị flashcard
│   ├── FlashCardForm.tsx  # Form tạo/sửa
│   └── Providers.tsx      # Context providers
├── lib/                   # Hàm tiện ích
│   ├── db.ts              # Kết nối database
│   ├── flashcards-db.ts   # Thao tác database
│   └── types.ts           # TypeScript types
├── db/                    # File database
│   └── init.sql           # Schema và dữ liệu mẫu
└── docker-compose.yml     # Cấu hình Docker
```

## Quản Lý Database

### Kết nối với PostgreSQL

```bash
# Truy cập PostgreSQL CLI
docker exec -it quicklang-postgres psql -U postgres -d quicklang

# Xem danh sách bảng
\dt

# Truy vấn flashcards
SELECT * FROM flashcards;
```

### Lệnh Database

```bash
# Dừng database
docker-compose down

# Dừng và xóa toàn bộ dữ liệu
docker-compose down -v

# Xem logs
docker-compose logs postgres
```

## API Endpoints

### Flashcards

- `GET /api/flashcards` - Lấy tất cả flashcards
- `POST /api/flashcards` - Tạo flashcard mới
- `GET /api/flashcards/[id]` - Lấy flashcard theo ID
- `PUT /api/flashcards/[id]` - Cập nhật flashcard
- `DELETE /api/flashcards/[id]` - Xóa flashcard
- `POST /api/flashcards/[id]/review` - Tăng số lần ôn tập

## Chi Tiết Tính Năng

### Quản Lý Flashcard
- Tạo flashcard với từ vựng, nghĩa, ví dụ và hình ảnh
- Chỉnh sửa flashcard hiện có
- Xóa flashcard
- Lọc theo độ khó (dễ, trung bình, khó)
- Phân loại theo danh mục

### Chế Độ Học
- Thẻ lật tương tác
- Theo dõi tiến độ ôn tập
- Chỉ báo độ khó trực quan
- Hỗ trợ hình ảnh để học trực quan

### Schema Database

```sql
CREATE TABLE flashcards (
  id VARCHAR(50) PRIMARY KEY,
  word VARCHAR(255) NOT NULL,
  image_url TEXT,
  meaning TEXT NOT NULL,
  example TEXT NOT NULL,
  category VARCHAR(100),
  difficulty VARCHAR(20),
  created_at TIMESTAMP,
  last_reviewed TIMESTAMP,
  review_count INTEGER DEFAULT 0
);
```

## Phát Triển

### Scripts Có Sẵn

```bash
npm run dev      # Chạy development server
npm run build    # Build cho production
npm run start    # Chạy production server
npm run lint     # Chạy ESLint
```

### Thêm Tính Năng Mới

1. Tạo API routes mới trong `app/api/`
2. Thêm React components trong `components/`
3. Cập nhật database schema trong `db/init.sql`
4. Chỉnh sửa database operations trong `lib/flashcards-db.ts`

## Xử Lý Sự Cố

### Xung Đột Cổng
Nếu cổng 5433 đã được sử dụng, cập nhật cổng trong:
- `docker-compose.yml`
- `.env.local`

### Lỗi Kết Nối Database
1. Đảm bảo Docker đang chạy
2. Kiểm tra trạng thái container: `docker-compose ps`
3. Xem logs: `docker-compose logs postgres`
4. Kiểm tra biến môi trường trong `.env.local`

### Lỗi NextAuth
1. Đảm bảo `NEXTAUTH_SECRET` đã được cấu hình
2. Kiểm tra `NEXTAUTH_URL` khớp với URL development
3. Với production, cập nhật OAuth redirect URLs

## Đóng Góp

1. Fork repository
2. Tạo branch tính năng (`git checkout -b feature/TinhNangMoi`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng mới'`)
4. Push lên branch (`git push origin feature/TinhNangMoi`)
5. Mở Pull Request

## Giấy Phép

Dự án này là mã nguồn mở và có sẵn theo [Giấy phép MIT](LICENSE).

## Lời Cảm Ơn

- Xây dựng với [Next.js](https://nextjs.org/)
- Xác thực bởi [NextAuth.js](https://next-auth.js.org/)
- Database bởi [PostgreSQL](https://www.postgresql.org/)
- Container hóa với [Docker](https://www.docker.com/)

## Liên Hệ & Hỗ Trợ

Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ, vui lòng:
- Mở issue trên GitHub
- Gửi email: your-email@example.com

## Roadmap

### Đã Hoàn Thành ✅
- Tạo, sửa, xóa flashcard
- Chế độ học với flip animation
- Tích hợp PostgreSQL
- Docker containerization
- Facebook OAuth (chuẩn bị sẵn)

### Sắp Tới 🚀
- [ ] Thêm nhiều phương thức đăng nhập (Google, GitHub)
- [ ] Chế độ quiz và kiểm tra
- [ ] Thống kê học tập chi tiết
- [ ] Import/Export flashcards (CSV, JSON)
- [ ] Chế độ học offline
- [ ] Mobile app (React Native)
- [ ] Chia sẻ bộ flashcard với cộng đồng
- [ ] AI tạo flashcard tự động
- [ ] Phát âm từ vựng
- [ ] Dark mode

## FAQ (Câu Hỏi Thường Gặp)

**Q: Làm sao để backup dữ liệu?**
A: Sử dụng lệnh: `docker exec quicklang-postgres pg_dump -U postgres quicklang > backup.sql`

**Q: Có thể sử dụng database khác không?**
A: Có, bạn có thể điều chỉnh `lib/db.ts` và `lib/flashcards-db.ts` để hỗ trợ MySQL, MongoDB, v.v.

**Q: Làm sao để deploy lên production?**
A: Bạn có thể deploy lên Vercel (frontend) và sử dụng dịch vụ PostgreSQL cloud như Supabase, Neon, hoặc Railway.

**Q: Có hỗ trợ nhiều ngôn ngữ không?**
A: Hiện tại ứng dụng hỗ trợ học mọi ngôn ngữ thông qua flashcard. Giao diện đa ngôn ngữ sẽ được thêm trong tương lai.