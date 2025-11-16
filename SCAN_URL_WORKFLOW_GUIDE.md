# Hướng Dẫn Tạo Workflow `/scan-url` cho N8N

## 📋 Tổng Quan

Workflow này cho phép user tự scan URL từ dashboard (tab Scanner). Nó sử dụng VirusTotal API để kiểm tra URL có độc hại không.

## 🎯 Mục Đích

- Nhận POST request từ dashboard với `{ url: "..." }`
- Gửi URL đến VirusTotal để scan
- Trả về kết quả với format chuẩn cho dashboard

## 📥 Request Format

```json
POST https://nguyennam0408.app.n8n.cloud/webhook/scan-url
Content-Type: application/json

{
  "url": "https://example.com"
}
```

## 📤 Response Format

```json
{
  "url": "https://example.com",
  "is_malicious": true,
  "risk_level": "HIGH",
  "threat_type": "Phishing",
  "confidence": 85,
  "vendors": "45/90",
  "categories": ["phishing", "malware"],
  "timestamp": "2025-01-15T10:30:00Z",
  "virustotal_stats": {
    "malicious": 45,
    "suspicious": 2,
    "harmless": 40,
    "undetected": 3,
    "total": 90
  }
}
```

## 🔧 Cách Tạo Workflow trong N8N

### Bước 1: Import Workflow

1. Mở N8N
2. Click **Workflows** → **Import from File**
3. Chọn file `API 3 - scan-url.json`
4. Workflow sẽ được tạo với tất cả nodes

### Bước 2: Cấu Hình

#### Node 1: Webhook - POST /scan-url
- **Path**: `scan-url`
- **HTTP Method**: `POST`
- **Response Mode**: `Response Node`

#### Node 2: Workflow Configuration
- **VirusTotal API Key**: Thay bằng API key của bạn
  - Hoặc dùng biến môi trường: `{{ $env.VIRUSTOTAL_API_KEY }}`

#### Node 3-5: VirusTotal Integration
- Giữ nguyên cấu hình
- API key sẽ được lấy từ Workflow Configuration

#### Node 6: Format Response
- Code đã được viết sẵn để format kết quả
- Không cần sửa gì

#### Node 7: Respond to Webhook
- Trả về JSON response
- Status code: 200

### Bước 3: Kích Hoạt

1. Click **Active** toggle để bật workflow
2. Copy webhook URL: `https://nguyennam0408.app.n8n.cloud/webhook/scan-url`
3. Test bằng cách gửi POST request

## 🧪 Test Workflow

### Dùng curl:
```bash
curl -X POST https://nguyennam0408.app.n8n.cloud/webhook/scan-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Dùng PowerShell:
```powershell
Invoke-RestMethod -Uri "https://nguyennam0408.app.n8n.cloud/webhook/scan-url" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"url": "https://example.com"}'
```

## 📊 Logic Xử Lý

1. **Nhận URL** từ POST request body
2. **Submit URL** đến VirusTotal API v3
3. **Đợi 15 giây** để VirusTotal scan xong
4. **Lấy kết quả** từ VirusTotal
5. **Format response**:
   - `is_malicious`: `true` nếu `malicious > 0`
   - `risk_level`: 
     - `HIGH` nếu `malicious > 10`
     - `MEDIUM` nếu `malicious > 5`
     - `LOW` nếu `malicious <= 5`
   - `confidence`: `(malicious / total) * 100`
   - `categories`: Từ VirusTotal + thêm "phishing", "malware" nếu malicious
6. **Trả về JSON** cho dashboard

## ⚠️ Lưu Ý

1. **VirusTotal Rate Limit**: 
   - Free tier: 4 requests/minute
   - Nếu vượt quá, sẽ bị rate limit

2. **Wait Time**: 
   - Hiện tại đợi 15 giây
   - Có thể cần tăng nếu URL chưa được scan trước đó

3. **API Key**: 
   - Không commit API key vào git
   - Dùng Environment Variables trong N8N

## 🔗 Tích Hợp với Dashboard

Dashboard đã được cấu hình để:
- Gọi `/scan-url` khi user click "Scan URL"
- Hiển thị kết quả với format chuẩn
- Fallback sang mock data nếu API không available

Không cần sửa code frontend, chỉ cần tạo workflow này là xong!

## 📝 Checklist

- [ ] Import workflow `API 3 - scan-url.json`
- [ ] Cập nhật VirusTotal API key
- [ ] Kích hoạt workflow
- [ ] Test với curl/PowerShell
- [ ] Kiểm tra response format đúng
- [ ] Test từ dashboard Scanner tab

