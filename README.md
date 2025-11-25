# 🛡️ CYBERGUARD SMB

**Giải pháp Bảo mật Email Thông minh cho Doanh nghiệp Vừa và Nhỏ**

[![Version](https://img.shields.io/badge/version-2.1-blue.svg)](https://github.com/HanQL12/CYBERGUARD-SMB)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)

---

## 🎯 Về CYBERGUARD SMB

CYBERGUARD SMB là một **startup giải pháp bảo mật email** được thiết kế đặc biệt cho các doanh nghiệp vừa và nhỏ (SMB) tại Việt Nam. Chúng tôi giải quyết bài toán **phát hiện và ngăn chặn các mối đe dọa email** như phishing, malware, và đặc biệt là **CEO fraud** (giả mạo CEO) - một vấn đề nghiêm trọng đang gia tăng trong môi trường doanh nghiệp Việt Nam.

### 💡 Ý Tưởng Khởi Nghiệp

Trong bối cảnh số hóa, email vẫn là kênh giao tiếp chính của doanh nghiệp, nhưng cũng là **vector tấn công phổ biến nhất**. Các doanh nghiệp lớn có ngân sách cho các giải pháp enterprise đắt đỏ, nhưng **SMB thường không có đủ nguồn lực** để triển khai các hệ thống bảo mật phức tạp.

**CYBERGUARD SMB** ra đời để:
- ✅ Cung cấp giải pháp **giá cả phải chăng** cho SMB
- ✅ Tự động hóa hoàn toàn quy trình phát hiện mối đe dọa
- ✅ Tập trung vào **ngữ cảnh tiếng Việt** và các mẫu tấn công phổ biến tại Việt Nam
- ✅ Giao diện đơn giản, dễ sử dụng, không cần chuyên gia IT

---

## ✨ Tính Năng Nổi Bật

### 🔍 Phát Hiện Đa Lớp Thông Minh

- **📎 Phân tích File đính kèm**: Tự động quét và phát hiện malware trong file đính kèm bằng VirusTotal (90+ security vendors)
- **🔗 Phân tích URL**: Kiểm tra tất cả links trong email, phát hiện phishing sites và malicious domains
- **🤖 AI Phát hiện CEO Fraud**: Sử dụng AI (Google Gemini) để phân tích ngữ cảnh tiếng Việt, phát hiện email giả mạo CEO yêu cầu chuyển tiền

### 🚀 Tự Động Hóa Hoàn Toàn

- **Tự động quét email**: Tích hợp Gmail API, tự động quét và phân loại email mới
- **Gán nhãn thông minh**: Tự động gán label PHISHING/SAFE cho email
- **Xử lý đa luồng**: Hỗ trợ 2 API keys để quét song song, tăng tốc độ xử lý

### 📊 Dashboard Trực Quan

- **Thống kê real-time**: Theo dõi số lượng email đã quét, tỷ lệ phát hiện, xu hướng tấn công
- **Báo cáo chi tiết**: Biểu đồ xu hướng hàng ngày, phân loại mối đe dọa, export PDF
- **Phân tích từng email**: Xem chi tiết phân tích của từng email, URL, file với risk score

### 🎨 Giao Diện Hiện Đại

- **Theme sáng, dễ nhìn**: Giao diện chuyên nghiệp với font size lớn, dễ đọc
- **Responsive design**: Tự động điều chỉnh trên mobile, tablet, desktop
- **100% tiếng Việt**: Giao diện hoàn toàn bằng tiếng Việt

---

## 🎨 Demo Giao Diện

![CYBERGUARD SMB Dashboard](./public/UI.jpg)

*Giao diện Dashboard với thống kê real-time và phân tích chi tiết*

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React Frontend │ ◄─────► │  Flask Backend   │ ◄─────► │  Gmail API      │
│   (Port 3000)    │         │   (Port 5000)    │         │  VirusTotal API │
│                  │         │                  │         │  Gemini AI      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Tech Stack

**Frontend:**
- React 19
- Tailwind CSS
- Recharts (Data visualization)
- Lucide React (Icons)

**Backend:**
- Python 3.8+
- Flask (REST API)
- Gmail API (Email integration)
- VirusTotal API (Threat detection)
- Google Gemini API (AI analysis)

---

## 🚀 Bắt Đầu Nhanh

### Yêu Cầu Hệ Thống

- **Node.js**: >= 16.x
- **Python**: >= 3.8
- **npm** hoặc **yarn**
- **API Keys** (xem bên dưới)

### Bước 1: Clone Repository

```bash
git clone https://github.com/HanQL12/CYBERGUARD-SMB.git
cd CYBERGUARD-SMB/phishing-dashboard
```

### Bước 2: Cài Đặt Frontend

```bash
# Cài đặt dependencies
npm install

# Hoặc sử dụng yarn
yarn install
```

### Bước 3: Cài Đặt Backend

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

### Bước 4: Cấu Hình API Keys

Tạo file `backend/.env`:

```env
# VirusTotal API (Bắt buộc - lấy tại https://www.virustotal.com/gui/join-us)
# Khuyến nghị: Sử dụng 2 keys để tăng tốc độ quét song song
VIRUSTOTAL_API_KEY_1=your_virustotal_api_key_1
VIRUSTOTAL_API_KEY_2=your_virustotal_api_key_2

# AI API cho CEO Fraud Detection (Chọn ít nhất 1)
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

**Lưu ý**: File `.env` đã được thêm vào `.gitignore` và sẽ không được commit lên Git.

### Bước 5: Cấu Hình Gmail (Tùy chọn - để quét email tự động)

1. Tạo Google Cloud Project tại [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Gmail API
3. Tạo OAuth 2.0 Client ID (Desktop app)
4. Download `credentials.json` và đặt vào thư mục `backend/`
5. Chạy `python gmail_scanner.py` để authenticate lần đầu

### Bước 6: Chạy Dự Án

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

python app.py
```

Backend sẽ chạy tại: **http://localhost:5000**

**Terminal 2 - Frontend:**
```bash
npm start
```

Frontend sẽ chạy tại: **http://localhost:3000**

Trình duyệt sẽ tự động mở. Nếu không, truy cập thủ công: `http://localhost:3000`

---

## 📡 API Endpoints

### Backend API

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/health` | GET | Health check |
| `/dashboard-data` | GET | Lấy thống kê và danh sách email |
| `/reports-data` | GET | Lấy dữ liệu báo cáo (daily trends, threat types) |
| `/tasks-data` | GET | Lấy danh sách email đã phân tích |
| `/scan-url` | POST | Quét URL độc hại |
| `/scan-email-urgent` | POST | Quét email đơn lẻ |
| `/scan-emails-urgent` | POST | Quét nhiều email song song |

Xem chi tiết tại: [backend/README.md](./backend/README.md)

---

## 🔄 Quy Trình Phân Tích Email

Hệ thống phân tích email theo **thứ tự ưu tiên** với **early exit** (dừng ngay khi phát hiện threat):

```
1. File Analysis (Priority 1)
   └─> Nếu có attachment → Hash SHA256 → VirusTotal
       └─> Nếu malicious → PHISHING (STOP)

2. URL Analysis (Priority 2)
   └─> Extract URLs → Submit VirusTotal → Wait 15s
       └─> Nếu malicious → PHISHING (STOP)

3. CEO Fraud Detection (Priority 3)
   └─> AI phân tích ngữ cảnh tiếng Việt (Gemini/Groq)
       └─> Nếu confidence >= 30% → PHISHING

4. All Safe → SAFE
```

### Đa Luồng Xử Lý

- **2 API keys**: Quét song song, mỗi key xử lý 1 email → **Tăng tốc 2x**
- **1 API key**: Quét tuần tự

---

## 📁 Cấu Trúc Dự Án

```
phishing-dashboard/
├── src/                          # React Frontend
│   ├── components/              # UI Components
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   ├── OverviewTab.jsx      # Dashboard tổng quan
│   │   ├── EmailProtectionTab.jsx # Danh sách email
│   │   ├── ScannerTab.jsx       # Quét URL thủ công
│   │   ├── ReportsTab.jsx       # Báo cáo & biểu đồ
│   │   └── ...
│   ├── config/
│   │   └── api.js               # API configuration
│   └── App.js                    # Main App component
│
├── backend/                      # Python Flask Backend
│   ├── app.py                   # Main Flask application
│   ├── gmail_helper.py          # Gmail API integration
│   ├── gmail_scanner.py         # Auto email scanner
│   ├── email_analyzer.py        # Email analysis logic
│   ├── ceo_fraud_detector.py    # AI CEO fraud detection
│   ├── virustotal_manager.py    # VirusTotal API manager
│   ├── constants.py             # Application constants
│   ├── requirements.txt         # Python dependencies
│   └── .env                      # Environment variables (không commit)
│
├── public/                       # Static files
│   ├── LOGO/                    # Logo files
│   └── UI.jpg                   # Demo screenshot
│
└── README.md                     # File này
```

---

## 🎯 Use Cases

### 1. Doanh Nghiệp Vừa và Nhỏ

- **Vấn đề**: Không có ngân sách cho giải pháp enterprise, nhưng cần bảo vệ email
- **Giải pháp**: CYBERGUARD SMB cung cấp giải pháp giá cả phải chăng, tự động hóa hoàn toàn

### 2. Phát Hiện CEO Fraud

- **Vấn đề**: Email giả mạo CEO yêu cầu chuyển tiền khẩn cấp
- **Giải pháp**: AI phân tích ngữ cảnh tiếng Việt, phát hiện các mẫu lừa đảo phổ biến

### 3. Quét URL Độc Hại

- **Vấn đề**: Nhân viên click vào link độc hại trong email
- **Giải pháp**: Tự động quét tất cả URLs với VirusTotal, cảnh báo ngay lập tức

---

## 🔧 Troubleshooting

### Backend không chạy

**Nguyên nhân**: Chưa activate virtual environment hoặc thiếu API keys.

**Giải pháp**:
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Kiểm tra file .env có API keys chưa
cat .env
```

### Frontend không kết nối được Backend

**Nguyên nhân**: Backend chưa chạy hoặc CORS chưa được cấu hình.

**Giải pháp**:
1. Đảm bảo backend đang chạy tại `http://localhost:5000`
2. Kiểm tra browser console (F12) có lỗi CORS không
3. Test API: `curl http://localhost:5000/health`

### Lỗi Gmail API "403 insufficientPermissions"

**Nguyên nhân**: Token.json thiếu scope `gmail.modify`.

**Giải pháp**:
```bash
cd backend
python fix_gmail_scopes.py
```

### Port đã được sử dụng

**Giải pháp**:
- Backend: Đổi `PORT=5001` trong `backend/.env`
- Frontend: Sử dụng `PORT=3001 npm start`

### UI hiển thị mock data

**Nguyên nhân**: Backend chưa trả về dữ liệu hoặc API call failed.

**Giải pháp**:
1. Kiểm tra backend logs
2. Test API: `curl http://localhost:5000/dashboard-data`
3. Đảm bảo Gmail API đã được setup và có emails trong labels

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

## 📊 Roadmap

### Version 2.2 (Q2 2025)
- [ ] Hỗ trợ Microsoft Outlook
- [ ] Mobile app (iOS/Android)
- [ ] Webhook notifications
- [ ] Advanced reporting với export Excel

### Version 3.0 (Q3 2025)
- [ ] Multi-tenant support
- [ ] White-label solution
- [ ] API marketplace
- [ ] Machine learning model tự train

---

## 🤝 Đóng Góp

CYBERGUARD SMB là một dự án khởi nghiệp đang phát triển. Mọi đóng góp đều được chào đón!

### Cách Đóng Góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📝 License

© 2025 CYBERGUARD SMB - All rights reserved

---

## 📞 Liên Hệ & Hỗ Trợ

- **GitHub Issues**: [Tạo issue mới](https://github.com/HanQL12/CYBERGUARD-SMB/issues)
- **Documentation**: Xem [backend/README.md](./backend/README.md) để biết thêm chi tiết về API

---

## 🙏 Acknowledgments

- VirusTotal - Threat intelligence platform
- Google Gemini - AI analysis
- Gmail API - Email integration
- React & Flask communities

---

**Made with ❤️ for Vietnamese SMBs**

*Bảo vệ doanh nghiệp của bạn, một email tại một thời điểm.*
