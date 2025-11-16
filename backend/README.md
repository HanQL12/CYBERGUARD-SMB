# Email Security Analyzer Backend API

Backend API để phân tích email với sequential flow: **File > URL > CEO Fraud**

## 🚀 Quick Start

### 1. Setup Virtual Environment

**Windows PowerShell:**
```powershell
.\setup.ps1
```

**Windows CMD:**
```cmd
.\setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Manual:**
```bash
# Create venv
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure API Keys

Copy `.env.example` to `.env` và thêm API keys:

```bash
# VirusTotal API Key (đã có)
VIRUSTOTAL_API_KEY=fc8fef0c12df79ad7d5cae8d649eb6a0d2c7474503915f775c181c7288a7102d

# Hugging Face API Key (Free)
# Get tại: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=your_api_key_here
```

### 3. Run Server

```bash
# Activate venv first
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Run server
python app.py
```

Server sẽ chạy tại: `http://localhost:5000`

## 📡 API Endpoints

### 1. Health Check
```
GET /health
```

### 2. Analyze Email (Main Endpoint)
```
POST /analyze-email

Request Body:
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
    "urls": ["https://example.com"]  // Optional
}

Response:
{
    "is_phishing": true/false,
    "threats": ["malicious_file", "malicious_url", "ceo_fraud"],
    "label": "Label_8387377442759074354",
    "details": {...},
    "analysis_order": "file" | "url" | "ceo_fraud" | "all_safe"
}
```

### 3. Analyze URL
```
POST /analyze-url

Request Body:
{
    "url": "https://example.com"
}
```

### 4. Analyze File
```
POST /analyze-file

Request Body:
{
    "filename": "file.pdf",
    "data": "base64_encoded_file_data",
    "mimeType": "application/pdf"
}
```

### 5. Detect CEO Fraud
```
POST /detect-ceo-fraud

Request Body:
{
    "subject": "Email subject",
    "body": "Email body",
    "html": "Email HTML"
}
```

## 🔍 Sequential Analysis Flow

1. **File Analysis** (Priority 1)
   - Nếu có attachment → Download, hash SHA256, check VirusTotal
   - Nếu malicious → Return PHISHING (STOP)

2. **URL Analysis** (Priority 2)
   - Extract URLs từ email
   - Submit từng URL đến VirusTotal
   - Wait 15 seconds (Check Mail.json logic)
   - Check `malicious > 0` → Return PHISHING (STOP)

3. **CEO Fraud Detection** (Priority 3)
   - Dùng Hugging Face API (Free chatbot)
   - Không có whitelist/blacklist
   - Chatbot tự phân tích ngôn ngữ
   - Nếu detected → Return PHISHING

4. **All Safe** → Return SAFE

## 🧪 Testing

### Test với curl:

```bash
# Health check
curl http://localhost:5000/health

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

### Test với Python:

```python
import requests

response = requests.post('http://localhost:5000/analyze-email', json={
    "subject": "Test email",
    "body": "This is a test",
    "html": "",
    "attachments": []
})

print(response.json())
```

## 🐛 Debugging

- Logs được in ra console với format: `timestamp - level - message`
- Set `FLASK_DEBUG=True` trong `.env` để enable debug mode
- Check logs để xem chi tiết từng bước phân tích

## 📝 Notes

- **VirusTotal API**: Free tier = 500 requests/day
- **Hugging Face API**: Free, không cần credit card
- **CEO Fraud Detection**: Fallback về pattern-based nếu API fail
- **Early Exit**: Nếu phát hiện threat ở bước nào, dừng ngay không check tiếp

## 🔧 Troubleshooting

**Lỗi "Module not found":**
```bash
# Đảm bảo đã activate venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

**Lỗi API key:**
- Check file `.env` có đúng format không
- Đảm bảo không có spaces thừa

**Port đã được sử dụng:**
- Đổi `PORT=5001` trong `.env`

