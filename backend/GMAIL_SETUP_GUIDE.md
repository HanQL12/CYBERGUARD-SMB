# Gmail API Setup Guide

## 🔐 Bước 1: Tạo Google Cloud Project & Credentials

### 1.1. Tạo Project
1. Vào: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Đặt tên: "Email Security Analyzer"
4. Click "Create"

### 1.2. Enable Gmail API
1. Vào: https://console.cloud.google.com/apis/library
2. Tìm "Gmail API"
3. Click "Enable"

### 1.3. Tạo OAuth Credentials
1. Vào: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth client ID"
3. Nếu chưa có OAuth consent screen:
   - Click "Configure Consent Screen"
   - Chọn "External" → "Create"
   - Điền thông tin cơ bản (App name, User support email)
   - Click "Save and Continue" → "Save and Continue" → "Back to Dashboard"
4. Tạo OAuth Client ID:
   - Application type: **Desktop app**
   - Name: "Email Security Analyzer"
   - Click "Create"
5. **Download credentials**:
   - Click "Download JSON"
   - Đổi tên file thành `credentials.json`
   - Đặt vào thư mục `backend/`

## 📥 Bước 2: Download credentials.json

Sau khi tạo OAuth credentials, bạn sẽ có file JSON. Đổi tên thành `credentials.json` và đặt vào:

```
phishing-dashboard/backend/credentials.json
```

## 🚀 Bước 3: Chạy Scanner

### 3.1. Start Backend Server (Terminal 1)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python app.py
```

### 3.2. Chạy Gmail Scanner (Terminal 2)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python gmail_scanner.py
```

**Lần đầu chạy:**
- Browser sẽ mở tự động
- Đăng nhập Google account của bạn
- Cho phép quyền truy cập Gmail
- File `token.json` sẽ được tạo tự động (lưu credentials)

**Các lần sau:**
- Chỉ cần chạy `python gmail_scanner.py`
- Không cần đăng nhập lại (dùng token.json)

## 📧 Quét Email

Scanner sẽ:
1. ✅ Lấy emails chưa đọc từ Gmail của bạn
2. ✅ Gửi đến backend API để phân tích
3. ✅ Tự động gán label (Phishing/Safe)
4. ✅ Đánh dấu đã đọc

## 🔄 Chạy Tự Động (Optional)

Tạo scheduled task để chạy tự động mỗi 5 phút:

**Windows Task Scheduler:**
```powershell
# Tạo task chạy mỗi 5 phút
schtasks /create /tn "Email Security Scanner" /tr "python C:\path\to\backend\gmail_scanner.py" /sc minute /mo 5
```

Hoặc dùng Python scheduler:
```python
import schedule
import time

def scan_job():
    scanner = GmailScanner()
    scanner.scan_emails()

schedule.every(5).minutes.do(scan_job)

while True:
    schedule.run_pending()
    time.sleep(60)
```

## ⚙️ Configuration

Thay đổi trong `gmail_scanner.py`:

```python
# Backend API URL
BACKEND_API_URL = 'http://localhost:5000'  # Hoặc URL khác

# Số lượng email quét mỗi lần
max_emails = 10  # Default: 10
```

## 🐛 Troubleshooting

**Lỗi "credentials.json not found":**
- Đảm bảo file `credentials.json` ở trong thư mục `backend/`
- Đảm bảo tên file đúng: `credentials.json` (không phải `credentials (1).json`)

**Lỗi "Backend API not running":**
- Start backend server trước: `python app.py`
- Check URL trong `gmail_scanner.py`

**Lỗi "Permission denied":**
- Check OAuth consent screen đã được publish (hoặc thêm test user)
- Re-authenticate: Xóa `token.json` và chạy lại

## ✅ Checklist

- [ ] Google Cloud Project created
- [ ] Gmail API enabled
- [ ] OAuth credentials created (Desktop app)
- [ ] `credentials.json` downloaded và đặt vào `backend/`
- [ ] Backend server đang chạy (`python app.py`)
- [ ] Chạy `python gmail_scanner.py` thành công
- [ ] Emails được quét và label tự động

