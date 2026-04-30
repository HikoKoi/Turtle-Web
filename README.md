# 🐢 Turtle Web IDE - Nền tảng học lập trình cho trẻ em

Turtle Web IDE là một môi trường lập trình Python trực tuyến được thiết kế đặc biệt cho trẻ em, giúp các bé làm quen với tư duy logic thông qua đồ họa Rùa (Turtle Graphics).

## 🚀 Hướng dẫn cài đặt nhanh (Cho máy mới tinh)

### 1. Yêu cầu hệ thống
Máy tính của bạn cần cài đặt sẵn:
*   [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/)
*   [Node.js (Bản LTS)](https://nodejs.org/)
*   [Git](https://git-scm.com/)

### 2. Triển khai Backend (Server & Database)
Mọi thứ đã được đóng gói trong Docker, bạn chỉ cần chạy:
```bash
cd Back-end
docker compose up -d --build
```
*Sau khi Docker chạy xong, khởi tạo dữ liệu:*
```bash
docker compose exec web python manage.py migrate
```

### 3. Triển khai Frontend (Giao diện)
Mở một terminal mới và chạy:
```bash
cd Front-end
npm install
npm run dev
```

### 4. Truy cập
*   **Website**: `http://localhost:5173`
*   **Admin Tools**: `http://localhost:8000/admin`

---

## 🛠️ Công nghệ sử dụng
*   **Backend**: Django, Django Rest Framework, Celery, Redis.
*   **Frontend**: React.js, Tailwind CSS, CodeMirror.
*   **Infrastructure**: Docker, PostgreSQL.

## 📁 Cấu trúc dự án
*   `/Back-end`: Chứa mã nguồn server, API và cấu hình Docker.
*   `/Front-end`: Chứa mã nguồn giao diện React.

---

## 👥 Tác giả
Dự án được phát triển bởi **HikoKoi**.
*   **Github**: [https://github.com/HikoKoi/Turtle-Web](https://github.com/HikoKoi/Turtle-Web.git)

---
*Chúc các bé có những giờ học lập trình thật vui vẻ!* 🐢✨