# 🔧 CYBERGUARD SMB – Backend Prototype  
**Mô phỏng lõi phân tích email cho bản demo “Giải pháp Bảo mật Email trong kỷ nguyên số”**

[![Version](https://img.shields.io/badge/version-2.1-blue.svg)](#)
[![Prototype](https://img.shields.io/badge/mode-backend__prototype-orange)](#)
[![Status](https://img.shields.io/badge/ready-for_demo-success)](#)

Backend này cung cấp **mock services** để dashboard phía trước trình diễn được các luồng phân tích: thu thập email, phân tầng rủi ro, phát hiện CEO fraud và dựng báo cáo xu hướng.

---

## 1. Vai trò của backend trong prototype
- Cung cấp **REST API** để frontend hiển thị dữ liệu real-time (tổng email, tỷ lệ phishing, line chart, v.v.)
- Mô phỏng pipeline **File → URL → CEO Fraud** giống hệ thống thật nhưng chạy nhanh cho demo
- Cho phép **chạy độc lập** trên máy thí sinh, không cần kết nối dịch vụ đắt đỏ

---

## 2. Tính năng lõi
| Nhóm | Mô tả ngắn |
|------|------------|
| **Phân tích tuần tự** | Ưu tiên File → URL → CEO Fraud, dừng ngay khi phát hiện mối đe dọa |
| **Báo cáo động** | API `/dashboard-data` và `/reports-data` trả về thống kê + mock emails |
| **Scanner** | API `/scan-url` và `/scan-email-urgent` giúp tab Scanner và Email Protection nhận dữ liệu |
| **Gmail simulation** | Module `gmail_helper.py` tạo danh sách email demo (hoặc kết nối Gmail thật nếu cấu hình) |
| **Logging & Error Handling** | `error_handlers.py` & `validators.py` đảm bảo prototype chạy ổn định |

---

## 3. Cài đặt & chạy thử

### 3.1 Chuẩn bị
- Python 3.8 trở lên
- `pip` đã cập nhật
- (Tùy chọn) API keys nếu muốn thử kết nối thật

### 3.2 Cài đặt nhanh
```bash
cd backend
python -m venv venv
venv\Scripts\activate           # Windows
# source venv/bin/activate      # Linux/Mac
pip install -r requirements.txt
```

### 3.3 File `.env`
Prototype có thể chạy 100% mock dữ liệu, nhưng để trình diễn “gần thực tế” hơn bạn có thể thêm các biến:
```env
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000

# (Tuỳ chọn) nếu muốn bật các dịch vụ thật
VIRUSTOTAL_API_KEY_1=...
GEMINI_API_KEY=...
```

> Nếu bỏ trống, hệ thống tự động chuyển sang chế độ mô phỏng.

### 3.4 Chạy server
```bash
venv\Scripts\activate
python app.py
# Server lắng nghe tại http://localhost:5000
```

---

## 4. Các endpoint phục vụ demo

| Endpoint | Mục đích demo |
|----------|---------------|
| `GET /health` | Kiểm tra nhanh backend đang bật |
| `GET /dashboard-data` | Feed chính cho tab Overview & Email Protection |
| `GET /reports-data?days=7` | Dữ liệu biểu đồ trong tab Reports |
| `POST /scan-url` | Hiển thị kết quả trong tab Scanner |
| `POST /scan-email-urgent` | Mô phỏng phân tích một email đơn lẻ |

**Lưu ý:** Payload/response đã được tinh giản để phù hợp trình diễn. Nếu cần cấu trúc chi tiết cho triển khai thật, xem trong `app.py`.

---

## 5. Pipeline mô phỏng (Email Analyzer)
1. **File stage** – Kiểm tra attachments (hash → kết quả giả lập)  
2. **URL stage** – Phân tích tất cả links, trả về số lượng vendor cảnh báo  
3. **CEO Fraud stage** – Gọi `ceo_fraud_detector.py` (mặc định dùng prompt Gemini 2.0, có fallback nội bộ)  
4. **Kết luận** – Gán nhãn SAFE / THREAT, tạo chỉ số hiển thị cho frontend

Module liên quan:
- `email_analyzer.py` – tổ chức pipeline
- `ceo_fraud_detector.py` – logic AI/pattern
- `virustotal_manager.py` – quản lý nhiều API key (nếu bật chế độ thật)
- `constants.py` – timeout, giới hạn cache, ngưỡng cảnh báo

---

## 6. Tích hợp Gmail (tuỳ chọn)
Prototype có thể hoạt động với mock data. Nếu muốn trình diễn tự động hơn:

```bash
python gmail_scanner.py        # Sau khi đã đặt credentials.json và token
```

Script sẽ:
1. Lấy email chưa đọc từ hộp thư demo
2. Gọi `/analyze-email` để mô phỏng phân tích
3. Gán nhãn và trả dữ liệu cho dashboard

Nếu gặp lỗi scope, chạy:  
```bash
python fix_gmail_scopes.py
```

---

## 7. Thư mục & module quan trọng
```
backend/
├── app.py                # Flask app + route demo
├── email_analyzer.py     # Pipeline File → URL → CEO Fraud
├── ceo_fraud_detector.py # Prompt + fallback phân tích CEO Fraud
├── gmail_helper.py       # Sinh dữ liệu demo hoặc kết nối Gmail
├── virustotal_manager.py # Quản lý nhiều API key (nếu dùng data thật)
├── error_handlers.py     # Chuẩn hóa thông báo lỗi
├── validators.py         # Validate input cho các endpoint
├── constants.py          # Timeout, cache, ngưỡng cảnh báo
└── requirements.txt      # Thư viện Python cần thiết
```

---

## 8. Tips khi trình diễn
- Nếu không có kết nối Internet, hãy để `.env` rỗng → backend tự dùng mock data.
- Muốn “bơm” thêm email demo? Chỉnh trong `gmail_helper.py` (hàm `get_dashboard_data`).
- Khi cần reset dữ liệu, chỉ cần restart `python app.py`.
- Logs được ghi vào `app.log` – dùng để kể câu chuyện “AI vừa phát hiện dấu hiệu lừa đảo…”.

---

## 9. Khắc phục sự cố thường gặp
| Vấn đề | Cách xử lý nhanh |
|--------|------------------|
| Không chạy được vì thiếu module | `pip install -r requirements.txt` sau khi bật venv |
| Port 5000 bị chiếm | Sửa `PORT` trong `.env` hoặc `set PORT=5001` trước khi chạy |
| Frontend không nhận dữ liệu | Kiểm tra console backend xem có lỗi JSON hay không |
| Muốn tắt hẳn kết nối ra ngoài | Bỏ toàn bộ API key trong `.env`, backend vẫn chạy mock |

---

## 10. Ghi chú bản quyền
Prototype này chỉ phục vụ **demo ý tưởng**. Khi triển khai thương mại, cần bổ sung:
- Cơ chế xác thực người dùng
- Hệ thống lưu trữ và mã hóa dữ liệu thật
- Quy trình tuân thủ (SOC2, ISO 27001, …)

---

**CYBERGUARD SMB Backend Prototype**  
_“Bộ não” đứng sau dashboard – giúp bạn kể trọn vẹn câu chuyện bảo mật email trong vòng 5 phút trên sân khấu._  
