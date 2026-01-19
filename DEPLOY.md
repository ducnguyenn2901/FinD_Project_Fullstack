# Hướng Dẫn Deploy Project FinD

Dự án này bao gồm Frontend (React/Vite) và Backend (Node.js/Express). Để hoạt động ổn định trên môi trường production, bạn nên deploy tách biệt 2 phần này.

Dưới đây là hướng dẫn deploy miễn phí và phổ biến nhất sử dụng **Vercel** (Frontend), **Render** (Backend) và **MongoDB Atlas** (Database).

## Phần 1: Chuẩn bị Database (MongoDB Atlas)

1.  Đăng ký tài khoản tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Tạo một **Cluster** mới (chọn gói **M0 Sandbox** để miễn phí).
3.  Trong phần **Security** -> **Database Access**: Tạo một user mới (nhớ lưu lại username và password).
4.  Trong phần **Security** -> **Network Access**: Chọn **Add IP Address** -> **Allow Access from Anywhere** (0.0.0.0/0) để Backend có thể kết nối.
5.  Lấy **Connection String**:
    *   Bấm **Connect** -> **Drivers**.
    *   Copy chuỗi kết nối (dạng `mongodb+srv://<username>:<password>@cluster0...`).
    *   Thay thế `<password>` bằng mật khẩu bạn vừa tạo.

## Phần 2: Deploy Backend (Render)

Chúng ta sẽ deploy Backend trước để lấy URL API cung cấp cho Frontend.

1.  Đẩy code của bạn lên **GitHub**.
2.  Đăng ký tài khoản tại [Render](https://render.com/).
3.  Tạo mới **Web Service**.
4.  Kết nối với repo GitHub của bạn.
5.  Cấu hình như sau:
    *   **Root Directory**: `.` (để trống hoặc dấu chấm)
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm run server`
    *   **Environment Variables** (Kéo xuống dưới để thêm):
        *   `NODE_ENV`: `production`
        *   `MONGO_URI`: (Dán Connection String lấy từ Phần 1 vào đây)
        *   `JWT_SECRET`: (Nhập một chuỗi ký tự ngẫu nhiên dài và bảo mật)
        *   `PORT`: `4000` (hoặc để Render tự cấp phát, nhưng code đang mặc định 4000)
6.  Bấm **Create Web Service**.
7.  Đợi deploy xong, copy **URL của Backend** (dạng `https://project-find-backend.onrender.com`).

## Phần 3: Deploy Frontend (Vercel)

1.  Đăng ký tài khoản tại [Vercel](https://vercel.com/).
2.  Bấm **Add New** -> **Project**.
3.  Import repo GitHub của bạn.
4.  Cấu hình như sau:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `.` (Mặc định)
    *   **Environment Variables**:
        *   `VITE_API_URL`: (Dán URL của Backend lấy từ Phần 2 vào đây, *lưu ý không có dấu / ở cuối*)
5.  Bấm **Deploy**.

## Phần 4: Cập nhật lại Backend

Sau khi Frontend đã có domain (ví dụ `https://project-find.vercel.app`), bạn nên quay lại cấu hình Backend để tăng cường bảo mật (CORS) nếu cần, hoặc cập nhật biến môi trường `FRONTEND_URL` cho Backend nếu Backend có gửi email hoặc redirect.

1.  Vào lại dashboard của **Render** -> Chọn service Backend.
2.  Vào phần **Environment**.
3.  Thêm biến `FRONTEND_URL` với giá trị là domain của Frontend vừa deploy.

---

## Kiểm tra sau khi deploy

1.  Truy cập vào trang Frontend trên Vercel.
2.  Thử đăng ký tài khoản mới (để kiểm tra kết nối Database).
3.  Thử đăng nhập và thực hiện một giao dịch (để kiểm tra API).

Chúc bạn thành công!
