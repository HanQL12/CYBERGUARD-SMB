# 🛡️ CYBERGUARD SMB  
**Giải pháp Bảo mật Email cho doanh nghiệp trong kỷ nguyên số**  
_Prototype dành cho cuộc thi Ý tưởng Sáng tạo 2025_

![CYBERGUARD SMB Dashboard](./public/UI.jpg)

---

## 1. CYBERGUARD SMB là gì?
CYBERGUARD SMB là một dashboard bảo mật email dành cho doanh nghiệp vừa và nhỏ. Bản prototype tập trung trình diễn:

- Cách doanh nghiệp theo dõi **trạng thái bảo mật email** theo thời gian thực  
- Khả năng **mô phỏng phát hiện mối đe dọa**: Phishing, Malware, CEO Fraud  
- Giao diện **thuần tiếng Việt**, thân thiện và chuyên nghiệp để thuyết phục nhà đầu tư/ban giám khảo  

Chúng tôi hướng tới tầm nhìn **"mỗi doanh nghiệp SMB đều có một SOC thu nhỏ"** ngay trong văn phòng của họ.

---

## 2. Dashboard hiển thị được gì?

### Tổng quan (Overview)
- Tổng số email đã kiểm tra, tỷ lệ phishing, tốc độ phản ứng
- Danh sách cảnh báo gần nhất và tình trạng workflow

### Email Protection
- Bảng email chi tiết với trạng thái: Safe / Threat / CEO Fraud
- Hồ sơ từng email: người gửi, URL nghi vấn, file đính kèm, khuyến nghị xử lý

### Scanner & MFA
- Module nhập URL thủ công để kiểm tra nhanh
- Khu vực cấu hình xác thực đa yếu tố cho các workflow quan trọng

### Reports
- Biểu đồ xu hướng tấn công theo ngày/tuần/tháng
- Phân bố loại mối đe dọa (URL, File, CEO Fraud)
- Tóm tắt giúp lãnh đạo ra quyết định nhanh

Tất cả các tab đều dùng chung ngôn ngữ thiết kế: nền sáng, chữ lớn, dễ nhìn trên màn hình trình chiếu.

---

## 3. Cài đặt prototype để demo

### Yêu cầu hệ thống
- Node.js ≥ 16  
- Python ≥ 3.8  
- npm hoặc yarn  
- Git

### Bước 1: Clone dự án
```bash
git clone https://github.com/HanQL12/CYBERGUARD-SMB.git
cd CYBERGUARD-SMB/phishing-dashboard
```

### Bước 2: Cài đặt frontend
```bash
npm install
# hoặc
yarn install
```

### Bước 3: Cài đặt backend (prototype)
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Linux/Mac
pip install -r requirements.txt
```

### Bước 4: Chạy demo
- **Terminal 1 (backend)**  
  ```bash
  cd backend
  venv\Scripts\activate
  python app.py
  # Backend listening at http://localhost:5000
  ```
- **Terminal 2 (frontend)**  
  ```bash
  npm start
  # Frontend at http://localhost:3000
  ```

Trình duyệt sẽ mở sẵn giao diện dashboard. Nếu không, hãy nhập thủ công địa chỉ `http://localhost:3000`.

---

## 4. Cấu trúc prototype

```
phishing-dashboard/
├── public/                 # Logo, ảnh minh họa
├── src/                    # React components cho dashboard
│   ├── components/         # Tab Overview, Email Protection, Reports, MFA...
│   ├── config/             # Thông số kết nối backend (host/port)
│   ├── constants/          # Giá trị dùng chung giữa các tab
│   └── App.js              # Điều hướng tab & state tổng
└── backend/                # Server mock dữ liệu + xử lý demo
```

---

## 5. Lưu ý khi trình bày với ban giám khảo
- Đây là **prototype**, nên dữ liệu demo có thể chỉnh nhanh trong backend để kể câu chuyện phù hợp.
- Frontend đã được tối ưu để chạy trên màn hình lớn, font chữ lớn dễ đọc.
- Nếu không cần backend thật, bạn có thể bật frontend trước và dùng mock data có sẵn.
- Chi tiết về backend (cách mô phỏng phân tích email) nằm trong `backend/README.md`.

---

## 6. Liên hệ & hỗ trợ
- Email: hello@cyberguard-smb.vn  
- GitHub Issues: mở ticket nếu gặp lỗi khi chạy demo  
- Tài liệu backend: `backend/README.md`

---

**CYBERGUARD SMB – Giải pháp Bảo mật Email cho doanh nghiệp trong kỷ nguyên số.**  
_Prototype được xây dựng với ❤️ để truyền cảm hứng cho cộng đồng startup Việt Nam._
