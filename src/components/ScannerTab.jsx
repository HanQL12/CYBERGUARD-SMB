import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, CheckCircle, Copy, ExternalLink, Shield, History } from 'lucide-react';
import StatCard from './StatCard';

const ScannerTab = ({ 
  scanUrl, 
  setScanUrl, 
  scanning, 
  scanResult, 
  onScan, 
  displayStats 
}) => {
  const [scanHistory, setScanHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleScan = async () => {
    await onScan();
    // History will be updated when scanResult changes
  };

  // Update history when scanResult changes
  useEffect(() => {
    if (scanResult && scanUrl) {
      setScanHistory(prev => {
        // Check if this URL already exists in history
        const exists = prev.some(item => item.url === scanUrl);
        if (exists) return prev;
        
        return [{
          url: scanUrl,
          result: scanResult,
          timestamp: new Date().toLocaleString('vi-VN')
        }, ...prev].slice(0, 10); // Keep last 10 scans
      });
    }
  }, [scanResult, scanUrl]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getThreatTypeLabel = (type) => {
    const labels = {
      'Phishing': 'Lừa Đảo',
      'Malware': 'Phần Mềm Độc Hại',
      'Spam': 'Thư Rác',
      'Safe': 'An Toàn'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Scanner Card */}
      <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
        <h2 style={{ color: '#00d9ff' }} className="text-2xl font-mono mb-2">TRÌNH QUÉT MỐI ĐE DỌA URL/EMAIL</h2>
        <p style={{ color: '#7a8a99' }} className="font-mono text-sm mb-6">
          Được hỗ trợ bởi công cụ phân tích mối đe dọa dựa trên AI
        </p>
        
        <div className="space-y-4">
          <div>
            <label style={{ color: '#7a8a99' }} className="block text-xs font-mono mb-2">
              URL HOẶC ĐỊA CHỈ EMAIL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scanUrl}
                onChange={(e) => setScanUrl(e.target.value)}
                placeholder="https://example.com hoặc email@domain.com"
                style={{ 
                  background: '#0a0e27',
                  border: '1px solid #1a3a52',
                  color: '#00d9ff'
                }}
                className="flex-1 px-4 py-3 rounded text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                onKeyPress={(e) => e.key === 'Enter' && !scanning && scanUrl.trim() && handleScan()}
                disabled={scanning}
              />
              {scanUrl && (
                <button
                  onClick={() => copyToClipboard(scanUrl)}
                  style={{ background: '#1a3a52', color: '#00d9ff', border: '1px solid #1a3a52' }}
                  className="px-4 py-3 rounded text-xs font-mono hover:opacity-80 transition"
                  title="Sao chép"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={handleScan}
            disabled={scanning || !scanUrl.trim()}
            style={{ 
              background: scanning || !scanUrl.trim() ? '#1a3a52' : '#00d9ff',
              color: scanning || !scanUrl.trim() ? '#7a8a99' : '#0a0e27'
            }}
            className="w-full py-3 rounded font-mono font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-5 h-5" />
            <span>{scanning ? 'ĐANG PHÂN TÍCH VỚI ML ENGINE...' : 'QUÉT NGAY'}</span>
          </button>
        </div>

        {scanning && (
          <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="mt-6 p-4 rounded">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
              <div>
                <p style={{ color: '#00d9ff' }} className="font-mono font-bold">ĐANG XỬ LÝ VỚI NEURAL NETWORK...</p>
                <p style={{ color: '#7a8a99' }} className="text-xs font-mono mt-1">
                  Phân tích cấu trúc URL, kiểm tra chữ ký malware, so sánh với cơ sở dữ liệu mối đe dọa
                </p>
              </div>
            </div>
          </div>
        )}

        {scanResult && !scanning && (
          <div style={{ background: '#0a0e27', border: '2px solid #1a3a52' }} className="mt-6 p-6 rounded">
            <div className="flex items-start gap-4">
              <div 
                className="p-3 rounded-full"
                style={{ background: scanResult.riskLevel === 'HIGH' ? '#2d0000' : '#002d00' }}
              >
                {scanResult.riskLevel === 'HIGH' ? (
                  <AlertTriangle className="w-8 h-8" style={{ color: '#ff4444' }} />
                ) : (
                  <CheckCircle className="w-8 h-8" style={{ color: '#44ff44' }} />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ color: '#00d9ff' }} className="text-xl font-mono font-bold">KẾT QUẢ QUÉT</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(scanResult.url)}
                      style={{ background: '#1a3a52', color: '#00d9ff', border: '1px solid #1a3a52' }}
                      className="px-3 py-1 rounded text-xs font-mono hover:opacity-80 transition flex items-center gap-1"
                      title="Sao chép URL"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? 'Đã sao chép!' : 'Sao chép'}
                    </button>
                    {scanResult.url.startsWith('http') && (
                      <a
                        href={scanResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ background: '#1a3a52', color: '#00d9ff', border: '1px solid #1a3a52' }}
                        className="px-3 py-1 rounded text-xs font-mono hover:opacity-80 transition flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Mở
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p style={{ color: '#7a8a99' }} className="text-xs font-mono">MỨC ĐỘ RỦI RO</p>
                    <p style={{ color: scanResult.riskLevel === 'HIGH' ? '#ff4444' : '#44ff44' }} className="text-lg font-mono font-bold">
                      {scanResult.riskLevel === 'HIGH' ? 'CAO' : scanResult.riskLevel === 'MEDIUM' ? 'TRUNG BÌNH' : 'THẤP'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#7a8a99' }} className="text-xs font-mono">LOẠI MỐI ĐE DỌA</p>
                    <p style={{ color: '#00d9ff' }} className="text-lg font-mono font-bold">
                      {getThreatTypeLabel(scanResult.threatType)}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#7a8a99' }} className="text-xs font-mono">ĐỘ TIN CẬY ML</p>
                    <p style={{ color: '#00d9ff' }} className="text-lg font-mono font-bold">{scanResult.confidence}%</p>
                  </div>
                  <div>
                    <p style={{ color: '#7a8a99' }} className="text-xs font-mono">NGUỒN THÔNG TIN MỐI ĐE DỌA</p>
                    <p style={{ color: '#00d9ff' }} className="text-lg font-mono font-bold">{scanResult.vendors}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p style={{ color: '#7a8a99' }} className="text-xs font-mono mb-2">DANH MỤC PHÁT HIỆN</p>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.categories.map((cat, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 rounded text-xs font-mono font-bold"
                        style={{
                          background: cat === 'safe' ? '#002d00' : '#2d0000',
                          color: cat === 'safe' ? '#44ff44' : '#ff4444'
                        }}
                      >
                        [{cat.toUpperCase()}]
                      </span>
                    ))}
                  </div>
                </div>

                {scanResult.riskLevel === 'HIGH' && (
                  <div style={{ background: '#2d0000', border: '1px solid #ff4444' }} className="p-4 rounded">
                    <p style={{ color: '#ff4444' }} className="font-mono font-bold mb-2">KHUYẾN NGHỊ TỪ AI:</p>
                    <ul style={{ color: '#ff8888' }} className="text-sm font-mono space-y-1 list-disc list-inside">
                      <li>Chặn URL này ngay lập tức trong firewall</li>
                      <li>Kích hoạt MFA thích ứng cho các tài khoản có thể bị ảnh hưởng</li>
                      <li>Báo cáo cho đội bảo mật để điều tra</li>
                      <li>Gửi đào tạo nhận thức cho người dùng</li>
                    </ul>
                  </div>
                )}

                <p style={{ color: '#7a8a99' }} className="text-xs font-mono mt-4">
                  Được phân tích bởi SecureML Engine v2.1 lúc {scanResult.timestamp}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5" style={{ color: '#00d9ff' }} />
            <h3 style={{ color: '#00d9ff' }} className="text-lg font-mono font-bold">LỊCH SỬ QUÉT</h3>
          </div>
          <div className="space-y-2">
            {scanHistory.slice(0, 5).map((item, idx) => (
              <div
                key={idx}
                style={{ background: '#0a0e27', border: '1px solid #1a3a52' }}
                className="p-3 rounded flex items-center justify-between hover:opacity-80 transition cursor-pointer"
                onClick={() => setScanUrl(item.url)}
              >
                <div className="flex items-center gap-3">
                  {item.result.riskLevel === 'HIGH' ? (
                    <AlertTriangle className="w-4 h-4" style={{ color: '#ff4444' }} />
                  ) : (
                    <CheckCircle className="w-4 h-4" style={{ color: '#44ff44' }} />
                  )}
                  <div>
                    <p style={{ color: '#00d9ff' }} className="text-sm font-mono">{item.url}</p>
                    <p style={{ color: '#7a8a99' }} className="text-xs font-mono">{item.timestamp}</p>
                  </div>
                </div>
                <span
                  className="px-2 py-1 rounded text-xs font-mono font-bold"
                  style={{
                    background: item.result.riskLevel === 'HIGH' ? '#2d0000' : '#002d00',
                    color: item.result.riskLevel === 'HIGH' ? '#ff4444' : '#44ff44'
                  }}
                >
                  {item.result.riskLevel === 'HIGH' ? 'CAO' : 'THẤP'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Số Lần Quét Hôm Nay"
          value={displayStats.totalEmails}
          subtitle="Phân tích bằng ML"
        />
        <StatCard
          title="Mối Đe Dọa Tìm Thấy"
          value={displayStats.threatsDetected}
          textColor="#ff4444"
          subtitle="Tự động chặn"
        />
        <StatCard
          title="Thời Gian Phản Hồi TB"
          value="1.2s"
          textColor="#00d9ff"
          subtitle="Bảo vệ real-time"
        />
      </div>
    </div>
  );
};

export default ScannerTab;
