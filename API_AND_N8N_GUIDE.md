# API Documentation & N8N Setup Guide

## 📋 Tổng Quan API

### Base URL
```
https://nguyennam0408.app.n8n.cloud/webhook
```

## ✅ API Đã Có (Cần Cập Nhật)

### 1. GET `/get-emails`
**Mục đích:** Lấy danh sách email đã phân tích

**Response cần có:**
```json
{
  "emails": [
    {
      "id": 1,
      "from": "sender@example.com",
      "subject": "Email subject",
      "received_time": "2025-01-15T10:30:00Z",
      "is_phishing": true,
      "risk_score": 85,
      "threat_type": "url_malicious" | "file_malicious" | "ceo_fraud" | "multiple" | "safe",
      
      "urls": [
        {
          "url": "https://malicious-site.com",
          "is_malicious": true,
          "risk_level": "HIGH",
          "threat_categories": ["phishing", "malware"]
        }
      ],
      "url_count": 2,
      
      "attachments": [
        {
          "filename": "invoice.pdf",
          "file_type": "application/pdf",
          "file_hash": "abc123...",
          "is_malicious": true,
          "risk_level": "HIGH",
          "threat_categories": ["malware", "ransomware"]
        }
      ],
      
      "ceo_fraud_indicators": {
        "detected": true,
        "confidence": 92,
        "indicators": ["urgent_language", "money_transfer_request", "vietnamese_context"]
      },
      
      "protection_status": {
        "url_mfa_enabled": false,
        "file_sandbox_enabled": false,
        "network_monitoring": false,
        "auto_disconnect": false
      }
    }
  ]
}
```

### 2. GET `/phishing-stats`
**Response:**
```json
{
  "total_emails_scanned": 284,
  "phishing_detected": 37,
  "safe_emails": 247,
  "phishing_rate": "13%",
  "workflow_status": "active",
  "last_updated": "2025-01-15T10:30:00Z"
}
```

### 3. POST `/scan-url`
**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "is_malicious": true,
  "risk_level": "HIGH",
  "threat_type": "Phishing",
  "confidence": 95,
  "vendors": "45/90",
  "categories": ["phishing", "malware"],
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## 🆕 API Cần Tạo Mới

### 4. POST `/analyze-file`
**Tích hợp:** VirusTotal API

**Request:**
```json
{
  "file_hash": "abc123def456...",
  "filename": "invoice.pdf",
  "file_type": "application/pdf"
}
```

**Response:**
```json
{
  "filename": "invoice.pdf",
  "file_hash": "abc123def456...",
  "file_type": "application/pdf",
  "is_malicious": true,
  "risk_level": "HIGH",
  "threat_categories": ["malware", "ransomware"],
  "virustotal_results": {
    "positives": 45,
    "total": 90,
    "scan_date": "2025-01-15T10:30:00Z"
  },
  "confidence": 92
}
```

**N8N Workflow:**
1. Webhook (POST) - Nhận request
2. HTTP Request - Call VirusTotal: `https://www.virustotal.com/vtapi/v2/file/report?apikey={KEY}&resource={file_hash}`
3. Code Node - Xử lý kết quả:
   ```javascript
   const vtResult = $input.first().json;
   const positives = vtResult.positives || 0;
   const isMalicious = positives > 5; // Threshold
   
   return {
     filename: $json.body.filename,
     file_hash: $json.body.file_hash,
     is_malicious: isMalicious,
     risk_level: isMalicious ? (positives > 20 ? 'HIGH' : 'MEDIUM') : 'LOW',
     threat_categories: isMalicious ? ['malware'] : [],
     virustotal_results: {
       positives: positives,
       total: vtResult.total || 90,
       scan_date: vtResult.scan_date
     },
     confidence: Math.round((positives / (vtResult.total || 90)) * 100)
   };
   ```
4. Respond to Webhook

### 5. POST `/detect-ceo-fraud`
**Tích hợp:** AI Agent (OpenAI/Claude)

**Request:**
```json
{
  "email_content": "Kính gửi anh/chị, tôi cần anh/chị chuyển ngay 50 triệu...",
  "sender": "ceo@company.com",
  "subject": "URGENT: Chuyển tiền gấp"
}
```

**Response:**
```json
{
  "detected": true,
  "confidence": 92,
  "indicators": ["urgent_language", "money_transfer_request", "vietnamese_context"],
  "analysis": {
    "urgency_score": 0.95,
    "money_mention": true,
    "sender_verification": false,
    "language_pattern": "vietnamese_ceo_fraud"
  }
}
```

**N8N Workflow:**
1. Webhook (POST)
2. OpenAI/Claude Node với prompt:
   ```
   Phân tích email này có phải là CEO fraud (lừa chuyển tiền) trong ngữ cảnh Việt Nam không?
   
   Email: {{$json.body.email_content}}
   Người gửi: {{$json.body.sender}}
   Chủ đề: {{$json.body.subject}}
   
   Tìm: "chuyển tiền", "urgent", "gấp", số tiền lớn (triệu, tỷ)
   Trả về JSON: {detected, confidence, indicators, analysis}
   ```
3. Code Node - Parse AI response
4. Respond to Webhook

### 6. POST `/enable-url-mfa`
**Request:**
```json
{
  "email_id": 123,
  "url": "https://malicious-site.com",
  "user_id": "user@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "mfa_enabled": true,
  "message": "MFA protection enabled",
  "mfa_token": "token123..."
}
```

### 7. POST `/enable-file-sandbox`
**Request:**
```json
{
  "email_id": 123,
  "filename": "invoice.pdf",
  "file_hash": "abc123...",
  "user_id": "user@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "sandbox_enabled": true,
  "sandbox_url": "https://sandbox.company.com/file/abc123",
  "monitoring_active": true
}
```

### 8. POST `/monitor-network`
**Request:**
```json
{
  "email_id": 123,
  "file_hash": "abc123...",
  "user_id": "user@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "monitoring_active": true,
  "alerts": []
}
```

### 9. POST `/disconnect-device`
**Request:**
```json
{
  "user_id": "user@company.com",
  "device_id": "device123",
  "reason": "Suspicious network activity detected"
}
```

**Response:**
```json
{
  "success": true,
  "disconnected": true,
  "message": "Device disconnected successfully"
}
```

## 🔄 Email Processing Pipeline (N8N)

### Workflow Chính:

```
1. Email đến (IMAP/Webhook)
   ↓
2. Extract URLs
   ↓
3. Loop URLs → Call /analyze-url hoặc VirusTotal
   ↓
4. Extract Attachments
   ↓
5. Loop Attachments → Call /analyze-file (VirusTotal)
   ↓
6. Extract Email Content
   ↓
7. Call /detect-ceo-fraud (AI Agent)
   ↓
8. Tổng hợp kết quả:
   - threat_type: url_malicious | file_malicious | ceo_fraud | multiple | safe
   - risk_score: max từ các threats
   - is_phishing: true nếu có bất kỳ threat nào
   ↓
9. Lưu vào Database
   ↓
10. Trả về qua /get-emails
```

### Code Node (Tổng Hợp Kết Quả):

```javascript
const urlResults = $('Analyze URLs').all();
const fileResults = $('Analyze Files').all();
const ceoFraudResult = $('Detect CEO Fraud').first().json;

// Xác định threat type
let threatType = 'safe';
const threats = [];

if (urlResults.some(r => r.json.is_malicious)) {
  threats.push('url_malicious');
}
if (fileResults.some(r => r.json.is_malicious)) {
  threats.push('file_malicious');
}
if (ceoFraudResult.detected) {
  threats.push('ceo_fraud');
}

if (threats.length === 0) {
  threatType = 'safe';
} else if (threats.length === 1) {
  threatType = threats[0];
} else {
  threatType = 'multiple';
}

// Tính risk score
let riskScore = 0;
if (threats.includes('url_malicious')) riskScore = Math.max(riskScore, 85);
if (threats.includes('file_malicious')) riskScore = Math.max(riskScore, 90);
if (threats.includes('ceo_fraud')) riskScore = Math.max(riskScore, ceoFraudResult.confidence);

return {
  threat_type: threatType,
  risk_score: riskScore,
  is_phishing: threats.length > 0,
  urls: urlResults.map(r => r.json),
  attachments: fileResults.map(r => r.json),
  ceo_fraud_indicators: ceoFraudResult
};
```

## 🔧 Tích Hợp Vào Code

### 1. Cập Nhật N8N_CONFIG

Trong `src/App.js`:
```javascript
const N8N_CONFIG = {
  baseUrl: 'https://nguyennam0408.app.n8n.cloud/webhook',
  endpoints: {
    stats: '/phishing-stats',
    scanUrl: '/scan-url',
    getEmails: '/get-emails',
    analyzeFile: '/analyze-file',
    detectCeoFraud: '/detect-ceo-fraud',
    enableUrlMFA: '/enable-url-mfa',
    enableFileSandbox: '/enable-file-sandbox',
    monitorNetwork: '/monitor-network',
    disconnectDevice: '/disconnect-device'
  }
};
```

### 2. Tạo Service Functions

Tạo `src/services/emailService.js`:
```javascript
const API_BASE = 'https://nguyennam0408.app.n8n.cloud/webhook';

export const emailService = {
  async analyzeFile(fileHash, filename, fileType) {
    const res = await fetch(`${API_BASE}/analyze-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_hash: fileHash, filename, file_type: fileType })
    });
    return await res.json();
  },

  async detectCeoFraud(emailContent, sender, subject) {
    const res = await fetch(`${API_BASE}/detect-ceo-fraud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_content: emailContent, sender, subject })
    });
    return await res.json();
  },

  async enableUrlMFA(emailId, url, userId) {
    const res = await fetch(`${API_BASE}/enable-url-mfa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_id: emailId, url, user_id: userId })
    });
    return await res.json();
  },

  async enableFileSandbox(emailId, filename, fileHash, userId) {
    const res = await fetch(`${API_BASE}/enable-file-sandbox`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_id: emailId, filename, file_hash: fileHash, user_id: userId })
    });
    return await res.json();
  },

  async disconnectDevice(userId, deviceId, reason) {
    const res = await fetch(`${API_BASE}/disconnect-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, device_id: deviceId, reason })
    });
    return await res.json();
  }
};
```

## 🔑 Environment Variables (N8N)

Thêm vào n8n Settings:
- `VIRUSTOTAL_API_KEY` - API key từ VirusTotal
- `OPENAI_API_KEY` - API key từ OpenAI (nếu dùng)
- `CLAUDE_API_KEY` - API key từ Claude (nếu dùng)

## 🧪 Testing với Mock Server

Nếu chưa có n8n, dùng mock server:

```bash
# Chạy mock server
node mock-server.js

# Cập nhật baseUrl trong App.js
baseUrl: 'http://localhost:3001'
```

Mock server có tất cả endpoints với mock data để test ngay.

## 📝 VirusTotal API Setup

1. Đăng ký tại: https://www.virustotal.com/
2. Lấy API key
3. Rate limit: 4 requests/minute (free tier)
4. Endpoint: `https://www.virustotal.com/vtapi/v2/file/report`

## 🤖 AI Agent Setup

### OpenAI:
- Model: `gpt-4` hoặc `gpt-3.5-turbo`
- Prompt template xem trong workflow guide

### Claude:
- Model: `claude-3-opus` hoặc `claude-3-sonnet`
- Tương tự OpenAI

## 🎯 Ưu Tiên Triển Khai

### Phase 1: Prototype (Ngay)
1. ✅ Cập nhật `/get-emails` structure
2. ✅ Dùng mock-server.js để test
3. ✅ Thêm mock data cho attachments và ceo_fraud

### Phase 2: Tích Hợp Thực Tế
1. Tích hợp VirusTotal vào `/analyze-file`
2. Tích hợp AI Agent vào `/detect-ceo-fraud`
3. Tạo protection action endpoints

### Phase 3: Hoàn Thiện
1. Network monitoring thực tế
2. Auto disconnect integration
3. Real-time updates

