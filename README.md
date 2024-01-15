****Cách 1 : ****

**Server**
Tạo file .env:
DATABASE_URL =
PORT=
 Chạy lần lượt các câu lệnh:
npm install
npm start


**Client**
Chạy lần lượt các câu lệnh:
npm install
npm start

**Crawler**
Tạo file .env:
SERVICE_URL=http://localhost:3000/
ADMIN_ID=[admin_id]
Chạy lần lượt các câu lệnh:
npm install
node main.js

****Cách 2 :****

Bước 1: Cài đặt các công cụ cần thiết để chạy chương trình bao gồm:
• Docker
• Docker-compose
• Visual Studio Code
Bước 2: Người dùng thực hiện tải repository này trên đường link :
• https://github.com/20187288-anhddt/datn
Bước 3: Mở Visual Studio Code, import dự án đã tải về máy ở bước 2
Bước 4 : Ở tại thư mục root của dự án, thực hiện lệnh terminal sau:
• docker-compose build
Đợi máy tính của các bạn tải các image cần thiết để chạy sản phẩm. Sau khi tải
xong, tiếp tục gõ lệnh :
• docker-compose up
Bước 5: Nếu các bước trên quá trình cài đặt không gặp lỗi, dự án sẽ được khởi
chạy dưới máy chủ localhost của các bạn.

