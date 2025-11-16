# 🔧 CYBERGUARD SMB - Backend API

**Python Flask Backend cho Email Security Analyzer**

Backend API xử lý phân tích email với sequential flow: **File > URL > CEO Fraud**. Hệ thống tích hợp với VirusTotal để phân tích URL/file và AI chatbots để phát hiện CEO fraud trong ngữ cảnh tiếng Việt.

---

## 📋 Mục Lục

- [Tính Năng](#-tính-năng)
- [Yêu Cầu](#-yêu-cầu)
- [Cài Đặt](#-cài-đặt)
- [Cấu Hình](#-cấu-hình)
- [Chạy Server](#-chạy-server)
- [API Endpoints](#-api-endpoints)
- [Sequential Analysis Flow](#-sequential-analysis-flow)
- [Gmail Integration](#-gmail-integration)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Tính Năng

- ✅ **Sequential Analysis**: Phân tích tuần tự File > URL > CEO Fraud với early exit
- ✅ **VirusTotal Integration**: Phân tích URL và file với 90+ security vendors
- ✅ **AI CEO Fraud Detection**: Sử dụng Google Gemini, Groq, hoặc Hugging Face
- ✅ **Gmail API Integration**: Tự động quét và phân loại email từ Gmail
- ✅ **Caching**: Client-side caching để giảm Gmail API calls
- ✅ **RESTful API**: REST API với CORS support
- ✅ **Error Handling**: Xử lý lỗi robust với logging chi tiết

---

## 💻 Yêu Cầu

- **Python**: >= 3.8
- **pip**: >= 21.0
- **Virtual Environment**: venv (tự động tạo)

### API Keys Cần Thiết

- **VirusTotal API Key**: [Lấy tại đây](https://www.virustotal.com/gui/join-us) (Bắt buộc)
- **Google Gemini API Key**: [Lấy tại đây](https://makersuite.google.com/app/apikey) (Khuyến nghị cho CEO fraud)
- **Groq API Key**: [Lấy tại đây](https://console.groq.com/) (Tùy chọn, rất nhanh)
- **Hugging Face API Key**: [Lấy tại đây](https://huggingface.co/settings/tokens) (Tùy chọn, fallback)

---

## 🚀 Cài Đặt

### Cách 1: Sử dụng Setup Script (Khuyến nghị)

**Windows PowerShell:**
```powershell
cd backend
.\setup.ps1
```

**Windows CMD:**
```cmd
cd backend
.\setup.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

### Cách 2: Cài Đặt Thủ Công

```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Cài đặt dependencies
pip install -r requirements.txt
```

### Kiểm Tra Cài Đặt

```bash
# Activate venv trước
python check_apis.py
```

Script này sẽ kiểm tra:
- ✅ Python version
- ✅ Virtual environment
- ✅ Dependencies đã cài đặt
- ✅ API keys trong `.env`
- ✅ Gmail credentials

---

## ⚙️ Cấu Hình

### 1. Tạo File `.env`

Tạo file `.env` trong thư mục `backend/`:

```env
# VirusTotal API (Bắt buộc)
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here

# Chatbot API cho CEO Fraud Detection (Chọn ít nhất 1)
# Khuyến nghị: GEMINI_API_KEY (chính xác nhất cho tiếng Việt)
GEMINI_API_KEY=your_gemini_api_key_here

# Tùy chọn (fallback)
GROQ_API_KEY=your_groq_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
```

### 2. Cấu Hình Gmail API (Tùy chọn)

Xem hướng dẫn chi tiết: [GMAIL_SETUP_GUIDE.md](./GMAIL_SETUP_GUIDE.md)

1. Tạo Google Cloud Project
2. Enable Gmail API
3. Tạo OAuth 2.0 Client ID (Desktop app)
4. Download `credentials.json` và đặt vào `backend/` folder

---

## 🎯 Chạy Server

### Development Mode

```bash
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Chạy server
python app.py
```

Server sẽ chạy tại: **http://localhost:5000**

### Production Mode

Sử dụng Gunicorn:

```bash
# Activate venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Chạy với Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Kiểm Tra Server

```bash
# Health check
curl http://localhost:5000/health

# Hoặc mở browser
http://localhost:5000/health
```

Kết quả mong đợi:
```json
{
  "status": "healthy",
  "service": "Email Security Analyzer"
}
```

---

## 📡 API Endpoints

### 1. Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Email Security Analyzer"
}
```

### 2. Dashboard Data

```http
GET /dashboard-data?refresh=false
```

**Query Parameters:**
- `refresh` (optional): `true` để bỏ qua cache, `false` (default) để dùng cache

**Response:**
```json
{
  "statistics": {
    "total_emails_scanned": 100,
    "phishing_detected": 15,
    "safe_emails": 85,
    "workflow_status": "active",
    "last_updated": "2025-01-21T10:30:00",
    "phishing_rate": "15.0%"
  },
  "emails": {
    "emails": [...]
  }
}
```

### 3. Scan URL

```http
POST /scan-url
Content-Type: application/json

{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "is_malicious": true,
  "malicious": 16,
  "suspicious": 2,
  "harmless": 53,
  "risk_level": "HIGH",
  "threat_type": "Phishing",
  "confidence": 95,
  "vendors": "16/90",
  "categories": ["phishing", "malware"],
  "timestamp": "2025-01-21T10:30:00"
}
```

### 4. Analyze Email (Main Endpoint)

```http
POST /analyze-email
Content-Type: application/json

{
  "subject": "Email subject",
  "body": "Email body text",
  "html": "Email HTML content",
  "attachments": [
    {
      "filename": "file.pdf",
      "data": "base64_encoded_file_data",
      "mimeType": "application/pdf"
    }
  ],
  "urls": ["https://example.com"]
}
```

**Response:**
```json
{
  "is_phishing": true,
  "threats": ["malicious_url", "ceo_fraud"],
  "label": "Label_8387377442759074354",
  "details": {
    "file_analysis": {...},
    "url_analysis": {...},
    "ceo_fraud_analysis": {...}
  },
  "analysis_order": "url",
  "risk_score": 95
}
```

### 5. Reports Data

```http
GET /reports-data?days=7&refresh=false
```

**Query Parameters:**
- `days` (optional): Số ngày (7, 30, 90) - default: 7
- `refresh` (optional): `true` để bỏ qua cache

**Response:**
```json
{
  "summary": {
    "total_emails": 100,
    "threats_detected": 15,
    "detection_rate": "15%",
    "avg_analysis_time": "0.8s"
  },
  "daily_trends": [
    {
      "date": "21/01",
      "threats": 3,
      "safe": 12,
      "blocked": 3
    }
  ],
  "threat_types": [
    {
      "type": "URL Độc Hại",
      "count": 10,
      "percentage": 67
    }
  ]
}
```

### 6. Analyze File

```http
POST /analyze-file
Content-Type: application/json

{
  "filename": "file.pdf",
  "data": "base64_encoded_file_data",
  "mimeType": "application/pdf"
}
```

### 7. Detect CEO Fraud

```http
POST /detect-ceo-fraud
Content-Type: application/json

{
  "subject": "Email subject",
  "body": "Email body",
  "html": "Email HTML"
}
```

---

## 🔄 Sequential Analysis Flow

Hệ thống phân tích email theo thứ tự ưu tiên với **early exit**:

### Priority 1: File Analysis
1. Nếu email có attachment → Download file
2. Tính SHA256 hash
3. Query VirusTotal với hash
4. Nếu `malicious > 0` → **Return PHISHING (STOP)**

### Priority 2: URL Analysis
1. Extract URLs từ email (subject, body, html)
2. Submit từng URL đến VirusTotal
3. Wait 15 seconds (theo logic Check Mail.json)
4. Check `malicious > 0` → **Return PHISHING (STOP)**
5. Check suspicious patterns (typo domains, etc.)

### Priority 3: CEO Fraud Detection
1. Combine subject + body + html
2. Gửi đến AI chatbot (Gemini > Groq > Hugging Face)
3. AI phân tích ngữ cảnh tiếng Việt
4. Nếu detected với confidence >= 30% → **Return PHISHING**
5. Fallback: Pattern-based detection (keywords)

### All Safe
Nếu tất cả 3 bước đều safe → **Return SAFE**

---

## 📧 Gmail Integration

### Auto Email Scanner

Chạy script `gmail_scanner.py` để tự động quét email:

```bash
# Activate venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Chạy scanner
python gmail_scanner.py
```

**Tính năng:**
- ✅ Quét email chưa đọc từ inbox
- ✅ Bỏ qua email từ social/promotions
- ✅ Gửi email đến `/analyze-email` endpoint
- ✅ Tự động gán label (PHISHING/SAFE)
- ✅ Đánh dấu email đã đọc

**Labels:**
- `PHISHING_LABEL`: `Label_8387377442759074354`
- `SAFE_LABEL`: `Label_291990169998442549`

### Gmail Helper

Module `gmail_helper.py` cung cấp:
- `get_dashboard_data()`: Lấy thống kê và emails với caching
- `get_reports_data()`: Lấy dữ liệu báo cáo
- `get_emails_by_label()`: Lấy emails theo label
- `get_email_details()`: Lấy chi tiết email

---

## 🧪 Testing

### Test với curl

```bash
# Health check
curl http://localhost:5000/health

# Scan URL
curl -X POST http://localhost:5000/scan-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Analyze email
curl -X POST http://localhost:5000/analyze-email \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Khẩn cấp chuyển gấp 100tr",
    "body": "Chuyển gấp cho anh 100tr đến stk 01234567988 tech em nhé",
    "html": "",
    "attachments": []
  }'
```

### Test với Python

```bash
python test_api.py
```

Script này sẽ test tất cả endpoints.

### Test Gmail Integration

```bash
# Kiểm tra API keys và credentials
python check_apis.py

# Test Gmail connection
python -c "from gmail_helper import GmailHelper; h = GmailHelper(); print('OK' if h.authenticate() else 'FAIL')"
```

---

## 🐛 Troubleshooting

### Lỗi "Module not found"

**Nguyên nhân**: Chưa activate virtual environment.

**Giải pháp**:
```bash
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

### Lỗi "VIRUSTOTAL_API_KEY not found"

**Nguyên nhân**: File `.env` chưa được tạo hoặc thiếu API key.

**Giải pháp**:
1. Tạo file `backend/.env`
2. Thêm `VIRUSTOTAL_API_KEY=your_key_here`
3. Restart server

### Lỗi "403 insufficientPermissions" (Gmail API)

**Nguyên nhân**: Token.json thiếu scope `gmail.modify`.

**Giải pháp**:
1. Xóa file `token.json`
2. Chạy lại `gmail_scanner.py` để re-authenticate
3. Đảm bảo chọn đầy đủ permissions

### Lỗi "Port 5000 already in use"

**Giải pháp**:
- Đổi `PORT=5001` trong `.env`
- Hoặc kill process đang dùng port 5000

### API trả về 404

**Nguyên nhân**: Route không tồn tại hoặc method sai.

**Giải pháp**:
- Kiểm tra endpoint URL
- Kiểm tra HTTP method (GET/POST)
- Xem logs trong console

### CEO Fraud Detection không chính xác

**Giải pháp**:
1. Sử dụng Gemini API (chính xác nhất cho tiếng Việt)
2. Kiểm tra API key có hợp lệ không
3. Xem logs để debug response từ AI

---

## 📝 Notes

- **VirusTotal API**: Free tier = 500 requests/day
- **Gemini API**: Free tier, tốt nhất cho tiếng Việt
- **Groq API**: Free, rất nhanh nhưng ít chính xác hơn Gemini
- **Hugging Face**: Free, fallback option
- **Caching**: Dashboard data được cache 60 giây để giảm Gmail API calls
- **Early Exit**: Nếu phát hiện threat ở bước nào, dừng ngay không check tiếp

---

## 🔒 Security

- ✅ API keys trong `.env` (không commit)
- ✅ Gmail credentials được bảo vệ
- ✅ CORS chỉ cho phép frontend
- ✅ Input validation
- ✅ Error messages không expose sensitive info

---

## 📚 Tài Liệu Tham Khảo

- [Gmail Setup Guide](./GMAIL_SETUP_GUIDE.md) - Hướng dẫn setup Gmail API
- [Chatbot API Guide](./CHATBOT_API_GUIDE.md) - Hướng dẫn cấu hình chatbot APIs
- [Email Filtering Guide](./EMAIL_FILTERING.md) - Hướng dẫn filter emails
- [Main README](../README.md) - Frontend documentation

---

**Made with ❤️ for CYBERGUARD SMB**
