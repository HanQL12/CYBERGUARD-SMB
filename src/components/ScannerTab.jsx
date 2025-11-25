import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [lastScannedUrl, setLastScannedUrl] = useState(null);

  const handleScan = useCallback(async () => {
    setLastScannedUrl(scanUrl.trim());
    await onScan();
  }, [onScan, scanUrl]);

  // Update history only when scan is complete and has valid result
  useEffect(() => {
    // Only save to history if:
    // 1. Not currently scanning
    // 2. Has scan result
    // 3. Result URL matches the last scanned URL (to avoid saving when just typing)
    // 4. Result is valid (has riskLevel and not just an error state)
    if (!scanning && scanResult && lastScannedUrl) {
      const resultUrl = scanResult.url || lastScannedUrl;
      
      // Check if URL matches and result is valid
      if (resultUrl === lastScannedUrl && scanResult.riskLevel && scanResult.riskLevel !== 'UNKNOWN') {
        setScanHistory(prev => {
          // Check if this URL already exists in history (update existing entry)
          const existingIndex = prev.findIndex(item => item.url === resultUrl);
          
          const newEntry = {
            url: resultUrl,
            result: scanResult,
            timestamp: scanResult.timestamp 
              ? new Date(scanResult.timestamp).toLocaleString('vi-VN')
              : new Date().toLocaleString('vi-VN')
          };
          
          if (existingIndex >= 0) {
            // Update existing entry
            const updated = [...prev];
            updated[existingIndex] = newEntry;
            return updated;
          } else {
            // Add new entry
            return [newEntry, ...prev].slice(0, 10); // Keep last 10 scans
          }
        });
      }
    }
  }, [scanning, scanResult, lastScannedUrl]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const getThreatTypeLabel = useCallback((type) => {
    const labels = {
      'Phishing': 'Lừa Đảo',
      'Malware': 'Phần Mềm Độc Hại',
      'Spam': 'Thư Rác',
      'Safe': 'An Toàn'
    };
    return labels[type] || type;
  }, []);
  
  const recentHistory = useMemo(() => scanHistory.slice(0, 5), [scanHistory]);

  return (
    <div className="space-y-6">
      {/* Scanner Card */}
      <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
        <h2 className="text-gray-800 text-3xl font-mono font-bold mb-3">TRÌNH QUÉT MỐI ĐE DỌA URL/EMAIL</h2>
        <p className="text-gray-600 font-mono text-base mb-6">
          Được hỗ trợ bởi công cụ phân tích mối đe dọa dựa trên AI
        </p>
        
        <div className="space-y-5">
          <div>
            <label className="text-gray-700 block text-sm font-mono font-semibold mb-3">
              URL HOẶC ĐỊA CHỈ EMAIL
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={scanUrl}
                onChange={(e) => setScanUrl(e.target.value)}
                placeholder="https://example.com hoặc email@domain.com"
                className="flex-1 px-5 py-3.5 rounded-md text-base font-mono bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && !scanning && scanUrl.trim() && handleScan()}
                disabled={scanning}
              />
              {scanUrl && (
                <button
                  onClick={() => copyToClipboard(scanUrl)}
                  className="px-5 py-3.5 rounded-md text-sm font-mono font-semibold hover:bg-gray-200 transition bg-gray-100 text-gray-700"
                  title="Sao chép"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={handleScan}
            disabled={scanning || !scanUrl.trim()}
            className={`w-full py-3.5 rounded-md font-mono font-bold text-base transition flex items-center justify-center gap-2 ${
              scanning || !scanUrl.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>{scanning ? 'ĐANG PHÂN TÍCH VỚI ML ENGINE...' : 'QUÉT NGAY'}</span>
          </button>
        </div>

        {scanning && (
          <div className="bg-blue-50 border border-blue-200 mt-6 p-5 rounded">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600"></div>
              <div className="flex-1">
                <p className="text-blue-700 font-mono font-bold text-base">ĐANG XỬ LÝ VỚI NEURAL NETWORK...</p>
                <p className="text-gray-600 text-sm font-mono mt-2">
                  Phân tích cấu trúc URL, kiểm tra chữ ký malware, so sánh với cơ sở dữ liệu mối đe dọa
                </p>
                <p className="text-gray-500 text-xs font-mono mt-1">
                  Quá trình này có thể mất khoảng 15-20 giây
                </p>
              </div>
            </div>
          </div>
        )}

        {scanResult && !scanning && (
          <div className="bg-white border-2 border-gray-200 mt-6 p-6 rounded shadow-sm">
            <div className="flex items-start gap-4">
              <div 
                className={`p-3 rounded-full ${
                  scanResult.riskLevel === 'HIGH' ? 'bg-red-100' : 'bg-green-100'
                }`}
              >
                {scanResult.riskLevel === 'HIGH' ? (
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-gray-800 text-2xl font-mono font-bold">KẾT QUẢ QUÉT</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => copyToClipboard(scanResult.url)}
                      className="px-4 py-2 rounded-md text-sm font-mono font-semibold hover:bg-gray-200 transition flex items-center gap-2 bg-gray-100 text-gray-700"
                      title="Sao chép URL"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Đã sao chép!' : 'Sao chép'}
                    </button>
                    {scanResult.url.startsWith('http') && (
                      <a
                        href={scanResult.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-md text-sm font-mono font-semibold hover:bg-gray-200 transition flex items-center gap-2 bg-gray-100 text-gray-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Mở
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div>
                    <p className="text-gray-600 text-sm font-mono font-semibold mb-2">MỨC ĐỘ RỦI RO</p>
                    <p className={`text-xl font-mono font-bold ${
                      scanResult.riskLevel === 'HIGH' ? 'text-red-600' : 
                      scanResult.riskLevel === 'MEDIUM' ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {scanResult.riskLevel === 'HIGH' ? 'CAO' : 
                       scanResult.riskLevel === 'MEDIUM' ? 'TRUNG BÌNH' : 
                       'THẤP'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-mono font-semibold mb-2">LOẠI MỐI ĐE DỌA</p>
                    <p className="text-gray-800 text-xl font-mono font-bold">
                      {getThreatTypeLabel(scanResult.threatType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-mono font-semibold mb-2">ĐỘ TIN CẬY</p>
                    <p className="text-gray-800 text-xl font-mono font-bold">{scanResult.confidence || 0}%</p>
                    <p className="text-gray-500 text-xs font-mono mt-1">Dựa trên {scanResult.vendors || '0/90'} công cụ phát hiện</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-mono font-semibold mb-2">NGUỒN PHÂN TÍCH</p>
                    <p className="text-gray-800 text-xl font-mono font-bold">ML Engine</p>
                    <p className="text-gray-500 text-xs font-mono mt-1">Deep Learning Model</p>
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-gray-600 text-sm font-mono font-semibold mb-3">DANH MỤC PHÁT HIỆN</p>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.categories && scanResult.categories.map((cat, idx) => (
                      <span 
                        key={idx} 
                        className={`px-3 py-1.5 rounded-md text-sm font-mono font-bold ${
                          cat === 'safe' ? 'bg-green-100 text-green-700' : 
                          cat === 'suspicious' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}
                      >
                        [{cat.toUpperCase()}]
                      </span>
                    ))}
                  </div>
                  {scanResult.malicious !== undefined && (
                    <div className="mt-3 grid grid-cols-3 gap-3 text-sm font-mono">
                      <div className="bg-red-50 p-2 rounded">
                        <p className="text-red-700 font-bold">Độc hại: {scanResult.malicious || 0}</p>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded">
                        <p className="text-yellow-700 font-bold">Đáng ngờ: {scanResult.suspicious || 0}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-green-700 font-bold">An toàn: {scanResult.harmless || 0}</p>
                      </div>
                    </div>
                  )}
                </div>

                {scanResult.riskLevel === 'HIGH' && (
                  <div className="bg-red-50 border border-red-200 p-5 rounded">
                    <p className="text-red-700 font-mono font-bold mb-3 text-base">KHUYẾN NGHỊ TỪ AI:</p>
                    <ul className="text-gray-700 text-base font-mono space-y-2 list-disc list-inside">
                      <li>Chặn URL này ngay lập tức trong firewall</li>
                      <li>Kích hoạt MFA thích ứng cho các tài khoản có thể bị ảnh hưởng</li>
                      <li>Báo cáo cho đội bảo mật để điều tra</li>
                      <li>Gửi đào tạo nhận thức cho người dùng</li>
                    </ul>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-gray-200">
                  <p className="text-gray-500 text-sm font-mono">
                    Được phân tích bởi SecureML Engine v2.1 lúc {scanResult.timestamp ? new Date(scanResult.timestamp).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}
                  </p>
                  {scanResult.error && (
                    <p className="text-red-500 text-xs font-mono mt-2">
                      ⚠️ Lưu ý: {scanResult.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-gray-700" />
              <h3 className="text-gray-800 text-xl font-mono font-bold">LỊCH SỬ QUÉT</h3>
              <span className="text-gray-500 text-sm font-mono">({scanHistory.length} mục)</span>
            </div>
            {scanHistory.length > 0 && (
              <button
                onClick={() => setScanHistory([])}
                className="text-sm font-mono text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition"
              >
                Xóa lịch sử
              </button>
            )}
          </div>
          <div className="space-y-3">
            {recentHistory.map((item, idx) => {
              const riskLevel = item.result?.riskLevel || 'LOW';
              const isHigh = riskLevel === 'HIGH';
              const isMedium = riskLevel === 'MEDIUM';
              
              return (
                <div
                  key={`${item.url}-${item.timestamp}-${idx}`}
                  className="bg-gray-50 border border-gray-200 p-4 rounded flex items-center justify-between hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => {
                    setScanUrl(item.url);
                    // Scroll to top to see the input
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {isHigh ? (
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    ) : isMedium ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-base font-mono font-medium truncate" title={item.url}>
                        {item.url}
                      </p>
                      <p className="text-gray-500 text-sm font-mono">{item.timestamp}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-md text-sm font-mono font-bold flex-shrink-0 ml-3 ${
                      isHigh ? 'bg-red-100 text-red-700' : 
                      isMedium ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-green-100 text-green-700'
                    }`}
                  >
                    {isHigh ? 'CAO' : isMedium ? 'TRUNG BÌNH' : 'THẤP'}
                  </span>
                </div>
              );
            })}
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
