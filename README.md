# 📚 EnglishApp — Ứng Dụng Học & Luyện Thi Tiếng Anh

Ứng dụng web full-stack giúp học từ vựng, luyện ngữ pháp và luyện thi tiếng Anh trực tuyến.

---

## 🗂 Cấu Trúc Dự Án

```
english-app/
├── backend/          # Node.js + Express + MySQL
│   ├── src/
│   │   ├── config/       # db.js, schema.sql
│   │   ├── controllers/  # authController, userController, vocabController, grammarController, examController
│   │   ├── middleware/   # auth.js (JWT)
│   │   ├── routes/       # auth, user, vocab, grammar, exam
│   │   └── server.js     # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/         # ReactJS + Bootstrap
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/          # axios.js (instance + interceptors)
    │   ├── components/
    │   │   ├── common/   # ProtectedRoute (PrivateRoute, AdminRoute)
    │   │   └── layout/   # Navbar
    │   ├── contexts/     # AuthContext
    │   ├── pages/
    │   │   ├── user/     # Login, Register, Home, Profile, Vocab, Grammar, Exam, History
    │   │   └── admin/    # AdminDashboard
    │   ├── App.js
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## ⚙️ Yêu Cầu Hệ Thống

| Thành phần | Yêu cầu |
|---|---|
| Node.js | v18 trở lên |
| MySQL | v8.0 trở lên |
| npm | v9 trở lên |

---

## 🚀 Hướng Dẫn Cài Đặt

### 1. Tạo Database

Mở MySQL Workbench hoặc terminal MySQL và chạy:

```sql
source backend/src/config/schema.sql
```

Hoặc import file `backend/src/config/schema.sql` trực tiếp.

> **Tài khoản admin mặc định:**
> - Email: `admin@englishapp.com`
> - Mật khẩu: `Admin@123`

---

### 2. Cài Đặt Backend

```bash
cd backend

# Cài dependencies
npm install

# Tạo file .env từ mẫu
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux

# Chỉnh sửa .env với thông tin database của bạn
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=yourpassword
# DB_NAME=english_app
# JWT_SECRET=your_secret_key

# Khởi động server
npm run dev        # development (nodemon)
# npm start        # production
```

Server chạy tại: `http://localhost:5000`

---

### 3. Cài Đặt Frontend

```bash
cd frontend

# Cài dependencies
npm install

# Tạo file .env từ mẫu
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux

# Khởi động
npm start
```

Ứng dụng chạy tại: `http://localhost:3000`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| GET  | `/api/auth/me` | Lấy thông tin user hiện tại |
| PUT  | `/api/auth/change-password` | Đổi mật khẩu |

### Từ vựng
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/vocab/topics` | Danh sách chủ đề |
| GET | `/api/vocab/topics/:id` | Chi tiết + flashcards |
| PUT | `/api/vocab/flashcards/:id/progress` | Đánh dấu từ |
| GET/POST | `/api/vocab/my-sets` | Bộ flashcard cá nhân |

### Ngữ pháp
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/grammar/lessons` | Danh sách bài học |
| GET | `/api/grammar/lessons/:id` | Chi tiết + câu hỏi |
| POST | `/api/grammar/lessons/:id/submit` | Nộp bài tập |

### Luyện thi
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/exams` | Danh sách đề thi |
| GET | `/api/exams/:id` | Chi tiết đề thi |
| POST | `/api/exams/:id/submit` | Nộp bài thi |
| GET | `/api/exams/history` | Lịch sử làm bài |

### Admin (cần role admin)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/users` | Danh sách người dùng |
| PUT | `/api/admin/users/:id/toggle-lock` | Khóa/mở khóa tài khoản |
| CRUD | `/api/vocab/admin/topics` | Quản lý chủ đề từ vựng |
| CRUD | `/api/vocab/admin/flashcards` | Quản lý flashcard |
| CRUD | `/api/grammar/admin/lessons` | Quản lý bài học |
| CRUD | `/api/grammar/admin/questions` | Quản lý câu hỏi ngữ pháp |
| CRUD | `/api/exams/admin/exams` | Quản lý đề thi |

---

## 🛠 Công Nghệ Sử Dụng

### Backend
- **Node.js + Express** — REST API server
- **MySQL2** — Kết nối MySQL
- **JWT (jsonwebtoken)** — Xác thực người dùng
- **bcryptjs** — Mã hóa mật khẩu
- **Multer** — Upload file (avatar)
- **Nodemailer** — Gửi email
- **cors, dotenv** — Tiện ích

### Frontend
- **ReactJS 18** — UI framework
- **React Router DOM v6** — Định tuyến
- **Axios** — HTTP client
- **Bootstrap 5** — CSS framework

---

## 👥 Phân Quyền

| Chức năng | User | Admin |
|---|:---:|:---:|
| Đăng ký / Đăng nhập | ✅ | ✅ |
| Học từ vựng & Flashcard | ✅ | ✅ |
| Luyện ngữ pháp | ✅ | ✅ |
| Luyện thi | ✅ | ✅ |
| Xem lịch sử kết quả | ✅ | ✅ |
| Quản lý người dùng | ❌ | ✅ |
| Quản lý từ vựng / ngữ pháp / đề thi | ❌ | ✅ |
