import React from 'react';
import { X, AlertTriangle, File, Globe, User, Shield, Lock, Network } from 'lucide-react';

const EmailDetailModal = ({ email, isOpen, onClose, onEnableMFA, onEnableSandbox, onDisconnect }) => {
  if (!isOpen || !email) return null;

  const threatType = email.threat_type || (email.is_phishing ? 'multiple' : 'safe');
  // Ensure urls and attachments are arrays
  const urls = Array.isArray(email.urls) ? email.urls : [];
  const attachments = Array.isArray(email.attachments) ? email.attachments : [];
  const ceoFraud = email.ceo_fraud_indicators || { detected: false };

  const getThreatTypeLabel = (type) => {
    const labels = {
      'url_malicious': 'URL ĐỘC HẠI',
      'file_malicious': 'FILE ĐỘC HẠI',
      'ceo_fraud': 'CEO FRAUD',
      'multiple': 'NHIỀU MỐI ĐE DỌA',
      'safe': 'AN TOÀN'
    };
    return labels[type] || type.toUpperCase();
  };

  const getThreatTypeColor = (type) => {
    if (type === 'safe') return '#44ff44';
    return '#ff4444';
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10, 14, 39, 0.9)' }}
      onClick={onClose}
    >
      <div 
        style={{ background: '#0f1a2e', border: '1px solid #1a3a52', maxWidth: '900px', maxHeight: '90vh' }}
        className="rounded-lg w-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#1a3a52' }}>
          <div>
            <h2 style={{ color: '#00d9ff' }} className="text-2xl font-mono font-bold mb-2">
              CHI TIẾT PHÂN TÍCH EMAIL
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded text-xs font-mono font-bold"
                style={{
                  background: email.is_phishing ? '#2d0000' : '#002d00',
                  color: getThreatTypeColor(threatType)
                }}
              >
                [{getThreatTypeLabel(threatType)}]
              </span>
              <span style={{ color: '#7a8a99' }} className="text-xs font-mono">
                Điểm Rủi Ro: <span style={{ color: '#ff4444' }}>{email.risk_score || 0}%</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: '#7a8a99' }}
            className="hover:opacity-80 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Email Info */}
          <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <p style={{ color: '#7a8a99' }} className="text-xs mb-1">NGƯỜI GỬI</p>
                <p style={{ color: '#00d9ff' }}>{email.from || 'Không xác định'}</p>
              </div>
              <div>
                <p style={{ color: '#7a8a99' }} className="text-xs mb-1">THỜI GIAN NHẬN</p>
                <p style={{ color: '#7a8a99' }}>{email.received_time || email.time || 'Gần đây'}</p>
              </div>
              <div className="col-span-2">
                <p style={{ color: '#7a8a99' }} className="text-xs mb-1">CHỦ ĐỀ</p>
                <p style={{ color: '#b8c5d6' }}>{email.subject || 'Không có chủ đề'}</p>
              </div>
            </div>
          </div>

          {/* URL Threats */}
          {urls.length > 0 && (
            <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5" style={{ color: '#00d9ff' }} />
                <h3 style={{ color: '#00d9ff' }} className="font-mono font-bold">MỐI ĐE DỌA URL</h3>
              </div>
              <div className="space-y-3">
                {urls.map((url, idx) => (
                  <div key={idx} className="p-3 rounded" style={{ background: url.is_malicious ? '#2d0000' : '#002d00', border: `1px solid ${url.is_malicious ? '#ff4444' : '#44ff44'}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: url.is_malicious ? '#ff4444' : '#44ff44' }} className="text-xs font-mono font-bold">
                        [{url.is_malicious ? 'ĐỘC HẠI' : 'AN TOÀN'}]
                      </span>
                      <span style={{ color: '#7a8a99' }} className="text-xs font-mono">
                        Rủi ro: {url.risk_level}
                      </span>
                    </div>
                    <p style={{ color: '#b8c5d6' }} className="text-sm font-mono break-all">{url.url}</p>
                    {url.threat_categories && url.threat_categories.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {url.threat_categories.map((cat, i) => (
                          <span key={i} style={{ background: '#1a3a52', color: '#ff4444' }} className="px-2 py-1 rounded text-xs font-mono">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                    {url.is_malicious && (
                      <div className="mt-3 p-3 rounded" style={{ background: '#1a3a52' }}>
                        <p style={{ color: '#ff4444' }} className="text-xs font-mono font-bold mb-2">
                          [BIỆN PHÁP]
                        </p>
                        <p style={{ color: '#7a8a99' }} className="text-xs font-mono mb-2">
                          Không truy cập URL này. Nếu cần thiết, kích hoạt MFA để bảo vệ.
                        </p>
                        <button
                          onClick={() => onEnableMFA && onEnableMFA(email.id, url.url)}
                          style={{ background: '#00d9ff', color: '#0a0e27' }}
                          className="px-3 py-1 rounded text-xs font-mono font-bold hover:opacity-80 transition"
                        >
                          [KÍCH HOẠT MFA BẢO VỆ]
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Attachments */}
          {attachments.length > 0 && (
            <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
              <div className="flex items-center gap-2 mb-4">
                <File className="w-5 h-5" style={{ color: '#00d9ff' }} />
                <h3 style={{ color: '#00d9ff' }} className="font-mono font-bold">FILE ĐÍNH KÈM</h3>
              </div>
              <div className="space-y-3">
                {attachments.map((file, idx) => (
                  <div key={idx} className="p-3 rounded" style={{ background: file.is_malicious ? '#2d0000' : '#002d00', border: `1px solid ${file.is_malicious ? '#ff4444' : '#44ff44'}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ color: file.is_malicious ? '#ff4444' : '#44ff44' }} className="text-xs font-mono font-bold">
                        [{file.is_malicious ? 'ĐỘC HẠI' : 'AN TOÀN'}]
                      </span>
                      <span style={{ color: '#7a8a99' }} className="text-xs font-mono">
                        {file.file_type} | Rủi ro: {file.risk_level}
                      </span>
                    </div>
                    <p style={{ color: '#b8c5d6' }} className="text-sm font-mono">{file.filename}</p>
                    {file.threat_categories && file.threat_categories.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {file.threat_categories.map((cat, i) => (
                          <span key={i} style={{ background: '#1a3a52', color: '#ff4444' }} className="px-2 py-1 rounded text-xs font-mono">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                    {file.is_malicious && (
                      <div className="mt-3 p-3 rounded" style={{ background: '#1a3a52' }}>
                        <p style={{ color: '#ff4444' }} className="text-xs font-mono font-bold mb-2">
                          [BIỆN PHÁP]
                        </p>
                        <p style={{ color: '#7a8a99' }} className="text-xs font-mono mb-2">
                          Không mở file này. Nếu cần thiết, sử dụng môi trường cô lập để kiểm tra.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEnableSandbox && onEnableSandbox(email.id, file.filename)}
                            style={{ background: '#00d9ff', color: '#0a0e27' }}
                            className="px-3 py-1 rounded text-xs font-mono font-bold hover:opacity-80 transition"
                          >
                            [MỞ TRONG SANDBOX]
                          </button>
                          <button
                            onClick={() => onDisconnect && onDisconnect()}
                            style={{ background: '#ff4444', color: '#fff' }}
                            className="px-3 py-1 rounded text-xs font-mono font-bold hover:opacity-80 transition"
                          >
                            [NGẮT KẾT NỐI NẾU PHÁT HIỆN ĐÁNG NGỜ]
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CEO Fraud Detection */}
          {ceoFraud.detected && (
            <div style={{ background: '#2d0000', border: '1px solid #ff4444' }} className="p-4 rounded">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5" style={{ color: '#ff4444' }} />
                <h3 style={{ color: '#ff4444' }} className="font-mono font-bold">PHÁT HIỆN CEO FRAUD</h3>
              </div>
              <div className="space-y-2">
                <p style={{ color: '#ff8888' }} className="text-sm font-mono">
                  Độ tin cậy: <span style={{ color: '#ff4444' }}>{ceoFraud.confidence || 0}%</span>
                </p>
                {ceoFraud.indicators && ceoFraud.indicators.length > 0 && (
                  <div>
                    <p style={{ color: '#7a8a99' }} className="text-xs font-mono mb-2">Dấu hiệu:</p>
                    <div className="flex flex-wrap gap-2">
                      {ceoFraud.indicators.map((ind, i) => (
                        <span key={i} style={{ background: '#1a3a52', color: '#ff4444' }} className="px-2 py-1 rounded text-xs font-mono">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 p-3 rounded" style={{ background: '#1a3a52' }}>
                  <p style={{ color: '#ff4444' }} className="text-xs font-mono font-bold mb-2">
                    [BIỆN PHÁP]
                  </p>
                  <p style={{ color: '#7a8a99' }} className="text-xs font-mono">
                    Xác minh yêu cầu qua kênh khác (điện thoại, gặp trực tiếp) trước khi chuyển tiền.
                    Đây có thể là email giả mạo CEO/Giám đốc để lừa chuyển tiền.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Protection Status */}
          {email.protection_status && (
            <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5" style={{ color: '#00d9ff' }} />
                <h3 style={{ color: '#00d9ff' }} className="font-mono font-bold">TRẠNG THÁI BẢO VỆ</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" style={{ color: email.protection_status.url_mfa_enabled ? '#44ff44' : '#7a8a99' }} />
                  <span style={{ color: '#7a8a99' }}>MFA URL:</span>
                  <span style={{ color: email.protection_status.url_mfa_enabled ? '#44ff44' : '#ff4444' }}>
                    {email.protection_status.url_mfa_enabled ? 'ĐÃ KÍCH HOẠT' : 'TẮT'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4" style={{ color: email.protection_status.file_sandbox_enabled ? '#44ff44' : '#7a8a99' }} />
                  <span style={{ color: '#7a8a99' }}>Sandbox:</span>
                  <span style={{ color: email.protection_status.file_sandbox_enabled ? '#44ff44' : '#ff4444' }}>
                    {email.protection_status.file_sandbox_enabled ? 'ĐÃ KÍCH HOẠT' : 'TẮT'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4" style={{ color: email.protection_status.network_monitoring ? '#44ff44' : '#7a8a99' }} />
                  <span style={{ color: '#7a8a99' }}>Giám Sát Mạng:</span>
                  <span style={{ color: email.protection_status.network_monitoring ? '#44ff44' : '#ff4444' }}>
                    {email.protection_status.network_monitoring ? 'HOẠT ĐỘNG' : 'TẮT'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" style={{ color: email.protection_status.auto_disconnect ? '#ff4444' : '#7a8a99' }} />
                  <span style={{ color: '#7a8a99' }}>Tự Động Ngắt:</span>
                  <span style={{ color: email.protection_status.auto_disconnect ? '#ff4444' : '#7a8a99' }}>
                    {email.protection_status.auto_disconnect ? 'SẴN SÀNG' : 'CHỜ'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDetailModal;

