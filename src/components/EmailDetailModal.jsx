import React from 'react';
import { X, AlertTriangle, File, Globe, User, Shield, Lock, Network } from 'lucide-react';

const EmailDetailModal = ({ email, isOpen, onClose, onEnableMFA, onEnableSandbox, onDisconnect }) => {
  if (!isOpen || !email) return null;

  // Parse email data - handle different formats
  const threatType = email.threat_type || (email.is_phishing ? 'multiple' : 'safe');
  
  // URLs: can be array of objects or array of strings
  let urls = [];
  if (Array.isArray(email.urls)) {
    urls = email.urls.map(url => {
      if (typeof url === 'string') {
        return { url, is_malicious: email.is_phishing, risk_level: email.is_phishing ? 'high' : 'low' };
      }
      return url;
    });
  } else if (email.url_count > 0) {
    // If we have url_count but no urls array, create placeholder
    urls = [{ url: 'URL được phát hiện trong email', is_malicious: email.is_phishing, risk_level: email.is_phishing ? 'high' : 'low' }];
  }
  
  // Attachments: can be array of objects or empty
  const attachments = Array.isArray(email.attachments) ? email.attachments : [];
  
  // CEO Fraud: check various possible formats
  const ceoFraud = email.ceo_fraud_indicators || 
                   email.ceo_fraud || 
                   (email.is_phishing && email.risk === 'high' ? { detected: true, confidence: 70 } : { detected: false });

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-gray-200 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-3xl font-mono font-bold mb-3 text-gray-900">
              CHI TIẾT PHÂN TÍCH EMAIL
            </h2>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-md text-sm font-mono font-bold ${
                  email.is_phishing ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}
              >
                [{getThreatTypeLabel(threatType)}]
              </span>
              <span className="text-base font-mono text-gray-600">
                Điểm Rủi Ro: <span className="text-red-600 font-bold">{email.risk_score || 0}%</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-white">
          {/* Email Info */}
          <div className="bg-gray-50 border border-gray-200 p-5 rounded shadow-sm">
            <div className="grid grid-cols-2 gap-5 text-base font-mono">
              <div>
                <p className="text-sm mb-2 font-semibold text-gray-600">NGƯỜI GỬI</p>
                <p className="text-gray-900 font-medium">{email.from || email.sender || 'Không xác định'}</p>
              </div>
              <div>
                <p className="text-sm mb-2 font-semibold text-gray-600">THỜI GIAN NHẬN</p>
                <p className="text-gray-600">{email.received_time || email.time || email.date || 'Gần đây'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm mb-2 font-semibold text-gray-600">CHỦ ĐỀ</p>
                <p className="text-gray-900 font-medium">{email.subject || 'Không có chủ đề'}</p>
              </div>
            </div>
          </div>

          {/* URL Threats */}
          {urls.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 p-5 rounded shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <Globe className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-mono font-bold text-gray-900">MỐI ĐE DỌA URL</h3>
              </div>
              <div className="space-y-4">
                {urls.map((url, idx) => (
                  <div key={idx} className={`p-4 rounded border-2 ${
                    url.is_malicious ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-mono font-bold px-3 py-1 rounded ${
                        url.is_malicious ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        [{url.is_malicious ? 'ĐỘC HẠI' : 'AN TOÀN'}]
                      </span>
                      <span className="text-base font-mono text-gray-600 font-semibold">
                        Rủi ro: {url.risk_level}
                      </span>
                    </div>
                    <p className="text-base font-mono break-all text-gray-900 font-medium">{url.url || url}</p>
                    {url.threat_categories && Array.isArray(url.threat_categories) && url.threat_categories.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {url.threat_categories.map((cat, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-md text-sm font-mono font-semibold bg-red-100 text-red-700">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                    {url.is_malicious && !url.threat_categories && (
                      <div className="flex gap-2 mt-3">
                        <span className="px-3 py-1.5 rounded-md text-sm font-mono font-semibold bg-red-100 text-red-700">
                          phishing
                        </span>
                      </div>
                    )}
                    {url.is_malicious && (
                      <div className="mt-4 p-4 rounded bg-white border border-red-200">
                        <p className="text-red-700 text-sm font-mono font-bold mb-3">
                          [BIỆN PHÁP]
                        </p>
                        <p className="text-gray-700 text-base font-mono mb-3">
                          Không truy cập URL này. Nếu cần thiết, kích hoạt MFA để bảo vệ.
                        </p>
                        <button
                          onClick={() => onEnableMFA && onEnableMFA(email.id, url.url || url)}
                          className="px-4 py-2 rounded-md text-sm font-mono font-bold hover:bg-blue-700 transition bg-blue-600 text-white"
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
            <div className="bg-gray-50 border border-gray-200 p-5 rounded shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <File className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-mono font-bold text-gray-900">FILE ĐÍNH KÈM</h3>
              </div>
              <div className="space-y-4">
                {attachments.map((file, idx) => (
                  <div key={idx} className={`p-4 rounded border-2 ${
                    file.is_malicious ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-mono font-bold px-3 py-1 rounded ${
                        file.is_malicious ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        [{file.is_malicious ? 'ĐỘC HẠI' : 'AN TOÀN'}]
                      </span>
                      <span className="text-base font-mono text-gray-600 font-semibold">
                        {file.file_type} | Rủi ro: {file.risk_level}
                      </span>
                    </div>
                    <p className="text-base font-mono text-gray-900 font-medium">{file.filename}</p>
                    {file.threat_categories && file.threat_categories.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {file.threat_categories.map((cat, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-md text-sm font-mono font-semibold bg-red-100 text-red-700">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                    {file.is_malicious && (
                      <div className="mt-4 p-4 rounded bg-white border border-red-200">
                        <p className="text-red-700 text-sm font-mono font-bold mb-3">
                          [BIỆN PHÁP]
                        </p>
                        <p className="text-gray-700 text-base font-mono mb-3">
                          Không mở file này. Nếu cần thiết, sử dụng môi trường cô lập để kiểm tra.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => onEnableSandbox && onEnableSandbox(email.id, file.filename)}
                            className="px-4 py-2 rounded-md text-sm font-mono font-bold hover:bg-blue-700 transition bg-blue-600 text-white"
                          >
                            [MỞ TRONG SANDBOX]
                          </button>
                          <button
                            onClick={() => onDisconnect && onDisconnect()}
                            className="px-4 py-2 rounded-md text-sm font-mono font-bold hover:bg-red-700 transition bg-red-600 text-white"
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
          {(ceoFraud.detected || (email.is_phishing && email.risk === 'high')) && (
            <div className="bg-red-50 border-2 border-red-300 p-5 rounded shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <User className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-mono font-bold text-red-700">PHÁT HIỆN CEO FRAUD</h3>
              </div>
              <div className="space-y-4">
                <p className="text-base font-mono text-gray-800">
                  Độ tin cậy: <span className="text-red-600 font-bold">{ceoFraud.confidence || (email.is_phishing ? 70 : 0)}%</span>
                </p>
                {ceoFraud.indicators && Array.isArray(ceoFraud.indicators) && ceoFraud.indicators.length > 0 && (
                  <div>
                    <p className="text-sm font-mono mb-3 font-semibold text-gray-700">Dấu hiệu:</p>
                    <div className="flex flex-wrap gap-2">
                      {ceoFraud.indicators.map((ind, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-md text-sm font-mono font-semibold bg-red-100 text-red-700">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(!ceoFraud.indicators || !Array.isArray(ceoFraud.indicators) || ceoFraud.indicators.length === 0) && email.is_phishing && (
                  <div>
                    <p className="text-sm font-mono mb-3 font-semibold text-gray-700">Dấu hiệu:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 rounded-md text-sm font-mono font-semibold bg-red-100 text-red-700">
                        Email có dấu hiệu lừa đảo
                      </span>
                      {email.url_count > 0 && (
                        <span className="px-3 py-1.5 rounded-md text-sm font-mono font-semibold bg-red-100 text-red-700">
                          Có URL đáng ngờ
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="mt-4 p-4 rounded bg-white border border-red-200">
                  <p className="text-red-700 text-sm font-mono font-bold mb-3">
                    [BIỆN PHÁP]
                  </p>
                  <p className="text-gray-700 text-base font-mono">
                    Xác minh yêu cầu qua kênh khác (điện thoại, gặp trực tiếp) trước khi chuyển tiền.
                    Đây có thể là email giả mạo CEO/Giám đốc để lừa chuyển tiền.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Protection Status - Always show */}
          <div className="bg-gray-50 border border-gray-200 p-5 rounded shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-mono font-bold text-gray-900">TRẠNG THÁI BẢO VỆ</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-base font-mono">
                <div className="flex items-center gap-3">
                  <Lock className={`w-5 h-5 ${
                    (email.protection_status?.url_mfa_enabled || urls.some(u => u.is_malicious)) ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <span className="text-gray-600 font-medium">MFA URL:</span>
                  <span className={`font-bold ${
                    (email.protection_status?.url_mfa_enabled || urls.some(u => u.is_malicious)) ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(email.protection_status?.url_mfa_enabled || urls.some(u => u.is_malicious)) ? 'ĐÃ KÍCH HOẠT' : 'TẮT'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Network className={`w-5 h-5 ${
                    (email.protection_status?.file_sandbox_enabled || attachments.some(a => a.is_malicious)) ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <span className="text-gray-600 font-medium">Sandbox:</span>
                  <span className={`font-bold ${
                    (email.protection_status?.file_sandbox_enabled || attachments.some(a => a.is_malicious)) ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(email.protection_status?.file_sandbox_enabled || attachments.some(a => a.is_malicious)) ? 'ĐÃ KÍCH HOẠT' : 'TẮT'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Network className={`w-5 h-5 ${
                    email.protection_status?.network_monitoring ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <span className="text-gray-600 font-medium">Giám Sát Mạng:</span>
                  <span className={`font-bold ${
                    email.protection_status?.network_monitoring ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {email.protection_status?.network_monitoring ? 'HOẠT ĐỘNG' : 'TẮT'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    email.protection_status?.auto_disconnect ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <span className="text-gray-600 font-medium">Tự Động Ngắt:</span>
                  <span className={`font-bold ${
                    email.protection_status?.auto_disconnect ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {email.protection_status?.auto_disconnect ? 'SẴN SÀNG' : 'CHỜ'}
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

