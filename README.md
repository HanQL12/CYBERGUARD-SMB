# CYBERGUARD SMB - Dashboard Bảo Mật Email

Giải pháp Bảo mật Email toàn diện cho doanh nghiệp vừa và nhỏ (SMB) trong kỷ nguyên số. Tập trung vào phát hiện URL độc hại, file đính kèm độc hại, và email giả mạo CEO (ngữ cảnh Việt Nam).

## 🎯 Mục Tiêu Chính

Dashboard cung cấp các chức năng bảo vệ email toàn diện:

### 🔍 Phát Hiện & Phân Tích
- ✅ **Phát hiện URL độc hại** - Quét và phân tích URL trong email bằng ML
- ✅ **Phát hiện file đính kèm độc hại** - Phân tích file với công nghệ sandbox
- ✅ **Phát hiện email giả mạo CEO** - AI phân tích ngữ cảnh tiếng Việt, phát hiện lừa đảo chuyển tiền
- ✅ **Phân loại tự động** - Gán nhãn SAFE/THREAT dựa trên kết quả phân tích

### 🛡️ Bảo Vệ Chủ Động
- ✅ **Multi-Factor Authentication (MFA)** - Bảo vệ khi truy cập URL độc hại
- ✅ **Sandbox Environment** - Môi trường cô lập để mở file đáng ngờ an toàn
- ✅ **Network Monitoring** - Giám sát hoạt động mạng khi mở file
- ✅ **Auto Disconnect** - Tự động ngắt kết nối khi phát hiện hành vi đáng ngờ

### 📊 Giám Sát & Báo Cáo
- ✅ **Dashboard Tổng Quan** - Thống kê real-time về email đã quét
- ✅ **Phân Tích Chi Tiết** - Xem phân tích đầy đủ từng email, URL, file
- ✅ **Lịch Sử & Audit Log** - Theo dõi tất cả hoạt động và sự cố
- ✅ **Báo Cáo Tự Động** - Xuất báo cáo định kỳ về tình hình bảo mật

## 🚀 Bắt Đầu Nhanh

### Yêu Cầu Hệ Thống
- Node.js >= 16.x
- npm hoặc yarn
- N8N instance (hoặc mock server cho demo)

### Cài Đặt

```bash
# Clone hoặc di chuyển vào thư mục project
cd phishing-dashboard

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

### Sử Dụng Mock Server (Prototype/Demo)

Để test mà không cần N8N backend:

```bash
# Terminal 1: Chạy React app
npm start

# Terminal 2: Chạy mock API server
node mock-server.js
```

Sau đó cập nhật `N8N_CONFIG.baseUrl` trong `src/App.js`:
```javascript
baseUrl: 'http://localhost:3001'  // Thay vì n8n URL
```

## 📋 Quy Trình Xử Lý Email Tự Động

### Bước 1: Phát Hiện và Gán Nhãn
1. **Quét URL trong email** → Gửi đến VirusTotal API → Phân loại: An toàn / Độc hại
2. **Quét file đính kèm** → Phân tích hash với VirusTotal → Phân loại: An toàn / Độc hại
3. **Phân tích nội dung email** → AI Agent phân tích ngữ cảnh tiếng Việt → Phát hiện CEO fraud

**Kết Quả:** 
- Label: `SAFE` hoặc `THREAT`
- `threat_type`: `url_malicious` | `file_malicious` | `ceo_fraud` | `multiple` | `safe`
- Risk score: 0-100% (dựa trên mức độ nguy hiểm)
- Chi tiết: Danh sách URL/file độc hại, chỉ số CEO fraud

### Bước 2: Cảnh Báo và Đề Xuất Biện Pháp
- **URL độc hại** → Hiển thị cảnh báo: "⚠️ URL này có thể độc hại. Không truy cập. Nếu bắt buộc, kích hoạt MFA để bảo vệ"
- **File độc hại** → Hiển thị cảnh báo: "⚠️ File này có thể chứa malware. Không mở trực tiếp. Nếu cần, mở trong môi trường cô lập (Sandbox)"
- **CEO fraud** → Hiển thị cảnh báo: "🚨 Email có dấu hiệu giả mạo CEO. Xác minh qua kênh khác (điện thoại, chat nội bộ) trước khi thực hiện chuyển tiền"

### Bước 3: Bảo Vệ Thụ Động (Khi Người Dùng Vẫn Muốn Truy Cập)
- **MFA khi truy cập URL độc hại** - Yêu cầu xác thực 2 lớp, bảo vệ khi password bị lộ
- **Môi trường cô lập khi mở file** - Sandbox với network monitoring, cách ly hoàn toàn với hệ thống
- **Network Monitoring** - Giám sát traffic mạng, phát hiện hành vi đáng ngờ (mã hóa file, gửi dữ liệu ra ngoài)
- **Auto Disconnect** - Tự động ngắt kết nối mạng khi phát hiện ransomware hoặc hành vi độc hại

## 🎛️ Các Chức Năng Dashboard

### 1. 📊 Tab Tổng Quan (Overview)
- **Thống kê real-time**: Tổng số email đã quét, số email độc hại, email an toàn
- **Tỷ lệ phát hiện**: Phần trăm email phishing trong tổng số
- **Biểu đồ xu hướng**: Theo dõi xu hướng tấn công theo thời gian
- **Trạng thái hệ thống**: Workflow status, thời gian cập nhật cuối
- **Refresh tự động**: Cập nhật dữ liệu mỗi 30 giây

### 2. 🔍 Tab Scanner (Quét URL Thủ Công)
- **Quét URL trực tiếp**: Nhập URL để kiểm tra ngay lập tức
- **Kết quả chi tiết**: 
  - Mức độ rủi ro (HIGH/MEDIUM/LOW)
  - Loại mối đe dọa (Phishing/Malware/Spam)
  - Độ tin cậy (%)
  - Số lượng vendor phát hiện (X/90)
  - Danh mục mối đe dọa
- **Lịch sử quét**: Xem lại các URL đã quét trước đó

### 3. 🔐 Tab MFA (Multi-Factor Authentication)
- **Quản lý MFA**: Xem danh sách các URL đã được bảo vệ bằng MFA
- **Trạng thái bảo vệ**: Active/Inactive
- **Lịch sử truy cập**: Theo dõi các lần truy cập URL độc hại với MFA
- **Cấu hình**: Thiết lập phương thức MFA (SMS/Email/App)

### 4. 📧 Tab Email Protection (Bảo Vệ Email)
- **Danh sách email**: Hiển thị tất cả email đã được phân tích
- **Lọc email**: Theo trạng thái (All/Safe/Phishing)
- **Phân tích chi tiết**: Click vào email để xem:
  - Thông tin người gửi, chủ đề, thời gian
  - Danh sách URL độc hại (nếu có)
  - Danh sách file đính kèm (nếu có)
  - Chỉ số CEO fraud (nếu có)
  - Risk score và threat type
- **Hành động bảo vệ**:
  - **Enable MFA**: Kích hoạt MFA cho URL độc hại
  - **Open in Sandbox**: Mở file trong môi trường cô lập
  - **Disconnect Device**: Ngắt kết nối khi phát hiện nguy hiểm
- **Badge mối đe dọa**: Hiển thị loại mối đe dọa (URL/FILE/CEO FRAUD)

## 📁 Cấu Trúc Project

```
phishing-dashboard/
├── src/
│   ├── components/              # UI Components
│   │   ├── Header.jsx          # Header với workflow status
│   │   ├── NavigationTabs.jsx  # Điều hướng giữa các tab
│   │   ├── OverviewTab.jsx     # Tab tổng quan với thống kê
│   │   ├── ScannerTab.jsx      # Tab quét URL thủ công
│   │   ├── MFATab.jsx          # Tab quản lý MFA
│   │   ├── EmailProtectionTab.jsx  # Tab danh sách email
│   │   ├── EmailDetailModal.jsx    # Modal phân tích chi tiết email
│   │   ├── StatCard.jsx        # Component hiển thị thống kê
│   │   └── Footer.jsx          # Footer
│   ├── config/
│   │   └── api.js              # Cấu hình API và helper functions
│   ├── hooks/
│   │   └── usePhishingStats.js # Custom hook cho phishing stats
│   ├── utils/
│   │   └── validators.js       # Validation utilities (URL, email)
│   └── App.js                  # Component chính
├── mock-server.js              # Mock API server cho prototype
├── API_AND_N8N_GUIDE.md       # Hướng dẫn API và N8N workflows
├── SCAN_URL_WORKFLOW_GUIDE.md  # Hướng dẫn tạo workflow scan-url
└── README.md                    # File này
```

## 🔧 Tech Stack

- **React 19** - UI Framework hiện đại
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Thư viện biểu đồ và đồ thị
- **Lucide React** - Icon library
- **N8N** - Backend automation và workflow engine
- **VirusTotal API** - Phân tích URL và file độc hại
- **AI Agent** (OpenAI/Claude) - Phân tích ngữ cảnh CEO fraud

## 📚 Tài Liệu

- **API_AND_N8N_GUIDE.md** - Chi tiết về tất cả API endpoints và cách setup N8N workflows
- **SCAN_URL_WORKFLOW_GUIDE.md** - Hướng dẫn tạo workflow `/scan-url`
- **mock-server.js** - Mock API server để demo ngay không cần backend

## 🎨 Giao Diện

Dashboard sử dụng dark theme với phong cách terminal/hacker để tạo cảm giác chuyên nghiệp:

- **Background chính**: `#0a0e27` (Dark blue)
- **Cards/Panels**: `#0f1a2e` với border `#1a3a52`
- **Màu chủ đạo**: `#00d9ff` (Cyan) - cho các element quan trọng
- **Màu cảnh báo**: `#ff4444` (Red) - cho mối đe dọa
- **Màu an toàn**: `#44ff44` (Green) - cho trạng thái an toàn
- **Font**: Monospace - tạo aesthetic giống terminal
- **Responsive**: Tự động điều chỉnh trên mobile/tablet

## 🔗 API Endpoints

Xem chi tiết trong `API_AND_N8N_GUIDE.md`

### ✅ API Đã Có:
- `GET /phishing-stats` - Lấy thống kê tổng quan
- `GET /get-emails` - Lấy danh sách email đã phân tích
- `POST /scan-url` - Quét URL độc hại (cần tạo workflow)

### 🚧 API Cần Tạo:
- `POST /analyze-file` - Phân tích file đính kèm (VirusTotal)
- `POST /detect-ceo-fraud` - Phát hiện CEO fraud (AI Agent)
- `POST /enable-url-mfa` - Kích hoạt MFA cho URL
- `POST /enable-file-sandbox` - Kích hoạt sandbox cho file
- `POST /monitor-network` - Bắt đầu giám sát network
- `POST /disconnect-device` - Ngắt kết nối thiết bị

## 🛡️ Tính Năng Bảo Vệ Nâng Cao

### Real-time Monitoring
- Giám sát email real-time qua Gmail trigger
- Tự động quét và phân loại khi email mới đến
- Cảnh báo ngay lập tức khi phát hiện mối đe dọa

### Threat Intelligence
- Tích hợp VirusTotal để phân tích URL và file
- Sử dụng AI để phân tích ngữ cảnh email (CEO fraud)
- Cập nhật threat database liên tục

### Incident Response
- Tự động gán nhãn email (Phishing/Safe)
- Cung cấp hành động bảo vệ ngay lập tức
- Log và audit trail đầy đủ

### Compliance & Reporting
- Thống kê chi tiết về tình hình bảo mật
- Export báo cáo định kỳ
- Audit log cho compliance

## 🔒 Bảo Mật

- API keys được lưu trong N8N environment variables
- Không expose sensitive data ra frontend
- HTTPS cho tất cả API calls
- Input validation và sanitization

## 🚀 Deployment

### Production Build
```bash
npm run build
```

Build files sẽ được tạo trong thư mục `build/`

### Environment Variables
Tạo file `.env`:
```
REACT_APP_API_BASE_URL=https://your-n8n-instance.com/webhook
```

## 📝 License

© 2025 SecureML Platform - All rights reserved

## 🤝 Đóng Góp

Dự án này là một giải pháp bảo mật email cho doanh nghiệp. Mọi đóng góp đều được chào đón!

## 📞 Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng xem:
- `API_AND_N8N_GUIDE.md` - Hướng dẫn API
- `SCAN_URL_WORKFLOW_GUIDE.md` - Hướng dẫn workflow
- Issues trên repository
