// Mock API Server cho Prototype Demo
// Chạy: node mock-server.js
// Port: 3001

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock Database
let emails = [
  {
    id: 1,
    from: 'ceo@company.com',
    subject: 'URGENT: Chuyển tiền gấp 50 triệu',
    received_time: new Date().toISOString(),
    is_phishing: true,
    risk_score: 95,
    threat_type: 'ceo_fraud',
    urls: [
      {
        url: 'https://malicious-bank-site.com/verify',
        is_malicious: true,
        risk_level: 'HIGH',
        threat_categories: ['phishing']
      }
    ],
    url_count: 1,
    attachments: [
      {
        filename: 'invoice_fake.pdf',
        file_type: 'application/pdf',
        file_hash: 'abc123def456',
        is_malicious: true,
        risk_level: 'HIGH',
        threat_categories: ['malware']
      }
    ],
    ceo_fraud_indicators: {
      detected: true,
      confidence: 92,
      indicators: ['urgent_language', 'money_transfer_request', 'suspicious_sender', 'vietnamese_context']
    },
    protection_status: {
      url_mfa_enabled: false,
      file_sandbox_enabled: false,
      network_monitoring: false,
      auto_disconnect: false
    }
  },
  {
    id: 2,
    from: 'security@paypal.com',
    subject: 'Payment confirmation #12345',
    received_time: new Date(Date.now() - 900000).toISOString(),
    is_phishing: false,
    risk_score: 5,
    threat_type: 'safe',
    urls: [
      {
        url: 'https://paypal.com/verify',
        is_malicious: false,
        risk_level: 'LOW',
        threat_categories: []
      }
    ],
    url_count: 1,
    attachments: [],
    ceo_fraud_indicators: {
      detected: false,
      confidence: 0,
      indicators: []
    },
    protection_status: {
      url_mfa_enabled: false,
      file_sandbox_enabled: false,
      network_monitoring: false,
      auto_disconnect: false
    }
  },
  {
    id: 3,
    from: 'newsletter@bank-verify.com',
    subject: 'Verify your account now',
    received_time: new Date(Date.now() - 120000).toISOString(),
    is_phishing: true,
    risk_score: 88,
    threat_type: 'url_malicious',
    urls: [
      {
        url: 'https://fake-bank-site.com/login',
        is_malicious: true,
        risk_level: 'HIGH',
        threat_categories: ['phishing', 'malware']
      },
      {
        url: 'https://another-malicious.com',
        is_malicious: true,
        risk_level: 'MEDIUM',
        threat_categories: ['spam']
      }
    ],
    url_count: 2,
    attachments: [],
    ceo_fraud_indicators: {
      detected: false,
      confidence: 0,
      indicators: []
    },
    protection_status: {
      url_mfa_enabled: false,
      file_sandbox_enabled: false,
      network_monitoring: false,
      auto_disconnect: false
    }
  }
];

// GET /get-emails
app.get('/get-emails', (req, res) => {
  res.json({ emails });
});

// GET /phishing-stats
app.get('/phishing-stats', (req, res) => {
  const total = emails.length;
  const phishing = emails.filter(e => e.is_phishing).length;
  const safe = total - phishing;
  
  res.json({
    total_emails_scanned: total,
    phishing_detected: phishing,
    safe_emails: safe,
    phishing_rate: total > 0 ? `${Math.round((phishing / total) * 100)}%` : '0%',
    workflow_status: 'active',
    last_updated: new Date().toISOString()
  });
});

// POST /scan-url
app.post('/scan-url', (req, res) => {
  const { url } = req.body;
  
  // Mock: Random malicious detection
  const isMalicious = Math.random() > 0.4;
  
  res.json({
    url: url,
    is_malicious: isMalicious,
    risk_level: isMalicious ? 'HIGH' : 'LOW',
    threat_type: isMalicious ? 'Phishing' : 'Safe',
    confidence: isMalicious ? Math.floor(Math.random() * 20 + 80) : Math.floor(Math.random() * 20 + 5),
    vendors: isMalicious ? `${Math.floor(Math.random() * 30 + 15)}/90` : `${Math.floor(Math.random() * 10)}/90`,
    categories: isMalicious ? ['phishing', 'malware', 'spam'] : ['safe'],
    timestamp: new Date().toLocaleString()
  });
});

// POST /analyze-file
app.post('/analyze-file', (req, res) => {
  const { file_hash, filename, file_type } = req.body;
  
  // Mock: Random malicious detection
  const isMalicious = Math.random() > 0.5;
  
  res.json({
    filename: filename || 'unknown',
    file_hash: file_hash || 'unknown',
    file_type: file_type || 'unknown',
    is_malicious: isMalicious,
    risk_level: isMalicious ? 'HIGH' : 'LOW',
    threat_categories: isMalicious ? ['malware', 'ransomware'] : [],
    virustotal_results: {
      positives: isMalicious ? Math.floor(Math.random() * 30 + 15) : Math.floor(Math.random() * 5),
      total: 90,
      scan_date: new Date().toISOString()
    },
    confidence: isMalicious ? Math.floor(Math.random() * 20 + 80) : Math.floor(Math.random() * 20 + 5)
  });
});

// POST /detect-ceo-fraud
app.post('/detect-ceo-fraud', (req, res) => {
  const { email_content, sender, subject } = req.body;
  
  // Mock: Simple keyword detection
  const content = (email_content || '').toLowerCase();
  const vietnameseKeywords = ['chuyển tiền', 'urgent', 'gấp', 'triệu', 'tỷ', 'tài khoản'];
  const detected = vietnameseKeywords.some(keyword => content.includes(keyword));
  
  res.json({
    detected: detected,
    confidence: detected ? Math.floor(Math.random() * 20 + 80) : Math.floor(Math.random() * 20),
    indicators: detected ? [
      'urgent_language',
      'money_transfer_request',
      'suspicious_sender',
      'vietnamese_context'
    ] : [],
    analysis: {
      urgency_score: detected ? 0.9 : 0.2,
      money_mention: detected,
      sender_verification: false,
      language_pattern: detected ? 'vietnamese_ceo_fraud' : 'normal'
    }
  });
});

// POST /enable-url-mfa
app.post('/enable-url-mfa', (req, res) => {
  const { email_id, url, user_id } = req.body;
  
  // Update email protection status
  const email = emails.find(e => e.id === email_id);
  if (email) {
    email.protection_status.url_mfa_enabled = true;
  }
  
  res.json({
    success: true,
    mfa_enabled: true,
    message: 'MFA protection enabled for URL access',
    mfa_token: `mfa_${Date.now()}`
  });
});

// POST /enable-file-sandbox
app.post('/enable-file-sandbox', (req, res) => {
  const { email_id, filename, file_hash, user_id } = req.body;
  
  // Update email protection status
  const email = emails.find(e => e.id === email_id);
  if (email) {
    email.protection_status.file_sandbox_enabled = true;
    email.protection_status.network_monitoring = true;
  }
  
  res.json({
    success: true,
    sandbox_enabled: true,
    sandbox_url: `https://sandbox.company.com/file/${file_hash || 'unknown'}`,
    monitoring_active: true
  });
});

// POST /monitor-network
app.post('/monitor-network', (req, res) => {
  const { email_id, file_hash, user_id } = req.body;
  
  // Update email protection status
  const email = emails.find(e => e.id === email_id);
  if (email) {
    email.protection_status.network_monitoring = true;
  }
  
  res.json({
    success: true,
    monitoring_active: true,
    alerts: []
  });
});

// POST /disconnect-device
app.post('/disconnect-device', (req, res) => {
  const { user_id, device_id, reason } = req.body;
  
  res.json({
    success: true,
    disconnected: true,
    message: 'Device disconnected successfully',
    reason: reason || 'Suspicious activity detected'
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📧 GET  /get-emails`);
  console.log(`📊 GET  /phishing-stats`);
  console.log(`🔍 POST /scan-url`);
  console.log(`📎 POST /analyze-file`);
  console.log(`👤 POST /detect-ceo-fraud`);
  console.log(`🔒 POST /enable-url-mfa`);
  console.log(`📦 POST /enable-file-sandbox`);
  console.log(`🌐 POST /monitor-network`);
  console.log(`⚠️  POST /disconnect-device`);
});

