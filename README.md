# 🛡️ CYBERGUARD SMB - Email Security Dashboard

**Giải pháp Bảo mật Email toàn diện cho Doanh nghiệp Vừa và Nhỏ (SMB)**

CYBERGUARD SMB là một hệ thống dashboard bảo mật email thông minh, sử dụng AI và Machine Learning để phát hiện và bảo vệ chống lại các mối đe dọa email như phishing, malware, và CEO fraud (giả mạo CEO). Hệ thống được thiết kế đặc biệt cho ngữ cảnh doanh nghiệp Việt Nam.

![Version](https://img.shields.io/badge/version-2.1-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

---

## 📋 Mục Lục

- [Tính Năng Chính](#-tính-năng-chính)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt](#-cài-đặt)
- [Cấu Hình](#-cấu-hình)
- [Chạy Dự Án](#-chạy-dự-án)
- [Cấu Trúc Project](#-cấu-trúc-project)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Tài Liệu Tham Khảo](#-tài-liệu-tham-khảo)

---

## ✨ Tính Năng Chính

### 🔍 Phát Hiện & Phân Tích Thông Minh

- **✅ Phát hiện URL độc hại**: Quét và phân tích URL trong email bằng VirusTotal API với 90+ security vendors
- **✅ Phát hiện file đính kèm độc hại**: Phân tích hash SHA256 của file với VirusTotal
- **✅ Phát hiện email giả mạo CEO**: AI phân tích ngữ cảnh tiếng Việt, phát hiện lừa đảo chuyển tiền
- **✅ Phân loại tự động**: Gán nhãn SAFE/PHISHING dựa trên kết quả phân tích tuần tự (File > URL > CEO Fraud)
- **✅ Risk Scoring**: Đánh giá mức độ rủi ro từ 0-100% cho mỗi email

### 🛡️ Bảo Vệ Chủ Động

- **✅ Multi-Factor Authentication (MFA)**: Bảo vệ khi truy cập URL độc hại
- **✅ Sandbox Environment**: Môi trường cô lập để mở file đáng ngờ an toàn
- **✅ Network Monitoring**: Giám sát hoạt động mạng khi mở file
- **✅ Auto Disconnect**: Tự động ngắt kết nối khi phát hiện hành vi đáng ngờ

### 📊 Giám Sát & Báo Cáo

- **✅ Dashboard Tổng Quan**: Thống kê real-time về email đã quét, tỷ lệ phát hiện
- **✅ Phân Tích Chi Tiết**: Xem phân tích đầy đủ từng email, URL, file với modal chi tiết
- **✅ Báo Cáo & Xu Hướng**: Biểu đồ xu hướng hàng ngày, phân loại mối đe dọa
- **✅ Lịch Sử Quét**: Theo dõi lịch sử quét URL và email
- **✅ Export PDF**: Xuất báo cáo định kỳ về tình hình bảo mật

### 🎨 Giao Diện Người Dùng

- **✅ Theme Sáng**: Giao diện hiện đại với nền sáng, dễ nhìn, chuyên nghiệp
- **✅ Responsive Design**: Tự động điều chỉnh trên mobile, tablet, desktop
- **✅ Real-time Updates**: Tự động làm mới dữ liệu mỗi 30 giây
- **✅ Vietnamese Language**: 100% giao diện tiếng Việt

---

## 💻 Yêu Cầu Hệ Thống

### Frontend (React)
- **Node.js**: >= 16.x
- **npm**: >= 8.x hoặc **yarn**: >= 1.22.x
- **Browser**: Chrome, Firefox, Safari, Edge (phiên bản mới nhất)

### Backend (Python Flask)
- **Python**: >= 3.8
- **pip**: >= 21.0
- **Virtual Environment**: venv (tự động tạo khi setup)

### API Keys Cần Thiết
- **VirusTotal API Key**: [Lấy tại đây](https://www.virustotal.com/gui/join-us) (Free tier: 500 requests/day)
- **Google Gemini API Key** (khuyến nghị): [Lấy tại đây](https://makersuite.google.com/app/apikey) (Free tier)
- **Groq API Key** (tùy chọn): [Lấy tại đây](https://console.groq.com/) (Free, rất nhanh)
- **Hugging Face API Key** (tùy chọn): [Lấy tại đây](https://huggingface.co/settings/tokens) (Free)
- **Gmail API Credentials**: [Hướng dẫn setup](./backend/GMAIL_SETUP_GUIDE.md)

---

## 🚀 Cài Đặt

### Bước 1: Clone Repository

```bash
git clone https://github.com/HanQL12/CYBERGUARD-SMB.git
cd CYBERGUARD-SMB/phishing-dashboard
```

### Bước 2: Cài Đặt Frontend Dependencies

```bash
# Cài đặt Node.js packages
npm install

# Hoặc sử dụng yarn
yarn install
```

### Bước 3: Cài Đặt Backend Dependencies

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

**Hoặc cài đặt thủ công:**
```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Activate venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

### Bước 4: Cấu Hình Environment Variables

**Frontend** - Tạo file `.env` trong thư mục `phishing-dashboard/`:
```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

**Backend** - Tạo file `.env` trong thư mục `phishing-dashboard/backend/`:
```env
# VirusTotal API (Bắt buộc)
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here

# Chatbot API cho CEO Fraud Detection (Chọn 1 trong 3)
# Khuyến nghị: GEMINI_API_KEY
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
```

**Lưu ý**: File `.env` đã được thêm vào `.gitignore` và sẽ không được commit lên Git.

### Bước 5: Cấu Hình Gmail API (Tùy chọn - để quét email tự động)

Xem hướng dẫn chi tiết tại: [backend/GMAIL_SETUP_GUIDE.md](./backend/GMAIL_SETUP_GUIDE.md)

1. Tạo Google Cloud Project
2. Enable Gmail API
3. Tạo OAuth 2.0 Client ID (Desktop app)
4. Download `credentials.json` và đặt vào `backend/` folder
5. Chạy `gmail_scanner.py` để quét email tự động

---

## 🎯 Chạy Dự Án

### Chạy Backend Server (Terminal 1)

```bash
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Chạy Flask server
python app.py
```

Backend sẽ chạy tại: **http://localhost:5000**

Bạn sẽ thấy log:
```
Starting Email Security Analyzer API on port 5000
Debug mode: True
 * Running on http://0.0.0.0:5000
```

### Chạy Frontend (Terminal 2)

```bash
# Từ thư mục gốc phishing-dashboard
npm start
```

Frontend sẽ chạy tại: **http://localhost:3000**

Trình duyệt sẽ tự động mở. Nếu không, truy cập thủ công: `http://localhost:3000`

### Kiểm Tra Kết Nối

1. Mở browser console (F12)
2. Kiểm tra không có lỗi CORS
3. Kiểm tra tab **Tổng Quan** có hiển thị dữ liệu từ backend

---

## 📁 Cấu Trúc Project

```
phishing-dashboard/
├── backend/                    # Python Flask Backend
│   ├── app.py                  # Main Flask application
│   ├── gmail_helper.py        # Gmail API helper
│   ├── gmail_scanner.py       # Auto email scanner
│   ├── requirements.txt        # Python dependencies
│   ├── setup.sh/.bat/.ps1     # Setup scripts
│   ├── .env                    # Environment variables (không commit)
│   ├── credentials.json        # Gmail API credentials (không commit)
│   ├── token.json              # Gmail OAuth token (không commit)
│   ├── venv/                   # Virtual environment (không commit)
│   └── README.md               # Backend documentation
│
├── src/                        # React Frontend
│   ├── components/            # UI Components
│   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   ├── DashboardLayout.jsx # Main layout
│   │   ├── OverviewWidgets.jsx # Overview widgets
│   │   ├── Widget.jsx          # Reusable widget
│   │   ├── OverviewTab.jsx     # Overview tab
│   │   ├── ScannerTab.jsx      # URL scanner tab
│   │   ├── MFATab.jsx          # MFA management tab
│   │   ├── EmailProtectionTab.jsx # Email list tab
│   │   ├── EmailDetailModal.jsx   # Email detail modal
│   │   ├── ReportsTab.jsx      # Reports tab
│   │   ├── PolicyManagementTab.jsx
│   │   ├── SettingsTab.jsx
│   │   ├── StatCard.jsx        # Statistics card
│   │   └── Header.jsx          # Header component
│   ├── config/
│   │   └── api.js              # API configuration
│   ├── App.js                  # Main App component
│   └── index.css               # Global styles
│
├── public/                     # Static files
├── .gitignore                  # Git ignore rules
├── package.json                # Node.js dependencies
├── .env                        # Frontend environment (không commit)
└── README.md                   # File này
```

---

## 📡 API Documentation

### Backend Endpoints

Xem chi tiết tại: [backend/README.md](./backend/README.md)

#### 1. Health Check
```http
GET /health
```

#### 2. Dashboard Data
```http
GET /dashboard-data
```
Trả về thống kê và danh sách email đã phân tích.

#### 3. Scan URL
```http
POST /scan-url
Content-Type: application/json

{
  "url": "https://example.com"
}
```

#### 4. Analyze Email
```http
POST /analyze-email
Content-Type: application/json

{
  "subject": "Email subject",
  "body": "Email body text",
  "html": "Email HTML content",
  "attachments": [...],
  "urls": ["https://example.com"]
}
```

#### 5. Reports Data
```http
GET /reports-data?days=7
```
Trả về dữ liệu báo cáo với daily trends và threat types.

---

## 🔧 Troubleshooting

### Lỗi "Cannot connect to backend"

**Nguyên nhân**: Backend chưa chạy hoặc CORS chưa được cấu hình.

**Giải pháp**:
1. Đảm bảo backend đang chạy tại `http://localhost:5000`
2. Kiểm tra file `.env` có `REACT_APP_API_BASE_URL=http://localhost:5000`
3. Restart cả frontend và backend

### Lỗi "Module not found" (Backend)

**Nguyên nhân**: Chưa activate virtual environment hoặc chưa cài dependencies.

**Giải pháp**:
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### Lỗi "403 insufficientPermissions" (Gmail API)

**Nguyên nhân**: Token.json thiếu scope `gmail.modify`.

**Giải pháp**:
1. Xóa file `backend/token.json`
2. Chạy lại `gmail_scanner.py` để re-authenticate
3. Đảm bảo chọn đầy đủ permissions khi authorize

### Lỗi "VIRUSTOTAL_API_KEY not found"

**Nguyên nhân**: File `.env` chưa được tạo hoặc thiếu API key.

**Giải pháp**:
1. Tạo file `backend/.env`
2. Thêm `VIRUSTOTAL_API_KEY=your_key_here`
3. Restart backend server

### Port đã được sử dụng

**Giải pháp**:
- Backend: Đổi `PORT=5001` trong `backend/.env`
- Frontend: Sử dụng `PORT=3001 npm start` hoặc đổi trong `.env`

### UI hiển thị mock data thay vì real data

**Nguyên nhân**: Backend chưa trả về dữ liệu hoặc API call failed.

**Giải pháp**:
1. Kiểm tra browser console (F12) có lỗi không
2. Kiểm tra backend logs
3. Test API trực tiếp: `curl http://localhost:5000/dashboard-data`
4. Đảm bảo Gmail API đã được setup và có emails trong labels

---

## 📚 Tài Liệu Tham Khảo

- [Backend README](./backend/README.md) - Hướng dẫn chi tiết về backend API
- [Gmail Setup Guide](./backend/GMAIL_SETUP_GUIDE.md) - Hướng dẫn setup Gmail API
- [Chatbot API Guide](./backend/CHATBOT_API_GUIDE.md) - Hướng dẫn cấu hình chatbot APIs
- [Email Filtering Guide](./backend/EMAIL_FILTERING.md) - Hướng dẫn filter emails

---

## 🎨 Screenshots

![CYBERGUARD SMB Dashboard Demo](./public/UI.jpg)

### Dashboard Tổng Quan
- Thống kê real-time về email đã quét
- Widgets có thể đóng/mở
- Tự động refresh mỗi 30 giây

### Tab Email Protection
- Danh sách email với filter (All/Safe/Phishing)
- Modal phân tích chi tiết
- Badge mối đe dọa (URL/FILE/CEO FRAUD)

### Tab Reports
- Biểu đồ xu hướng hàng ngày
- Phân loại mối đe dọa
- Export PDF

---

## 🔒 Bảo Mật

- ✅ API keys được lưu trong `.env` (không commit vào Git)
- ✅ Gmail credentials (`credentials.json`, `token.json`) không commit
- ✅ CORS được cấu hình chỉ cho phép frontend
- ✅ Input validation và sanitization
- ✅ Không expose sensitive data ra frontend

---

## 🚀 Production Deployment

### Build Frontend

```bash
npm run build
```

Build files sẽ được tạo trong thư mục `build/`

### Deploy Backend

Sử dụng Gunicorn cho production:

```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Environment Variables (Production)

Đảm bảo set các biến môi trường:
- `FLASK_ENV=production`
- `FLASK_DEBUG=False`
- Các API keys hợp lệ

---

## 📝 License

© 2025 CYBERGUARD SMB - All rights reserved

---

## 🤝 Đóng Góp

Dự án này là một giải pháp bảo mật email cho doanh nghiệp. Mọi đóng góp đều được chào đón!

---

## 📞 Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi:
- Xem [Troubleshooting](#-troubleshooting) section
- Tạo issue trên [GitHub Repository](https://github.com/HanQL12/CYBERGUARD-SMB)
- Xem các file README trong thư mục `backend/`

---

**Made with ❤️ for Vietnamese SMBs**
