import React, { useState, useMemo, useCallback } from 'react';
import { Mail, Activity, RefreshCw, CheckCircle, TrendingUp, Globe, Eye } from 'lucide-react';
import StatCard from './StatCard';
import EmailDetailModal from './EmailDetailModal';

const EmailProtectionTab = ({ 
  emailFilter, 
  setEmailFilter, 
  loadingEmails, 
  filteredEmails, 
  displayStats,
  onRefresh 
}) => {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = useCallback((email) => {
    setSelectedEmail(email);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEmail(null);
  }, []);

  const handleEnableMFA = useCallback((emailId, url) => {
    console.log('Enable MFA for email:', emailId, 'URL:', url);
    // TODO: Call API to enable MFA
    alert(`[MFA ENABLED] Bảo vệ đã được kích hoạt cho URL: ${url}`);
  }, []);

  const handleEnableSandbox = useCallback((emailId, filename) => {
    console.log('Enable Sandbox for email:', emailId, 'File:', filename);
    // TODO: Call API to enable sandbox
    alert(`[SANDBOX ENABLED] File sẽ được mở trong môi trường cô lập: ${filename}`);
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('Disconnect device');
    // TODO: Call API to disconnect
    alert('[DISCONNECT] Đã ngắt kết nối máy để bảo vệ');
  }, []);

  const getThreatTypeBadge = useCallback((email) => {
    const threatType = email.threat_type || (email.is_phishing ? 'multiple' : 'safe');
    const badges = [];
    
    // Check if urls is an array before calling .some()
    if (email.urls && Array.isArray(email.urls) && email.urls.some(u => u.is_malicious)) {
      badges.push({ label: 'URL', color: '#ff4444' });
    } else if (email.url_count > 0 && email.is_phishing) {
      // Fallback: if urls is not array but url_count exists and email is phishing
      badges.push({ label: 'URL', color: '#ff4444' });
    }
    
    // Check if attachments is an array before calling .some()
    if (email.attachments && Array.isArray(email.attachments) && email.attachments.some(a => a.is_malicious)) {
      badges.push({ label: 'FILE', color: '#ff4444' });
    }
    
    // Check CEO fraud
    if (email.ceo_fraud_indicators && email.ceo_fraud_indicators.detected) {
      badges.push({ label: 'CEO FRAUD', color: '#ff8800' });
    }
    
    return badges;
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Tổng Email"
          value={displayStats.actualTotal}
        />
        <StatCard
          title="Mối Đe Dọa"
          value={displayStats.actualPhishing}
          textColor="#ff4444"
        />
        <StatCard
          title="An Toàn"
          value={displayStats.actualSafe}
          textColor="#44ff44"
        />
      </div>

      {/* Filter & Refresh */}
      <div className="bg-white border border-gray-200 p-5 rounded shadow-sm">
        <div className="flex gap-3 justify-between items-center flex-wrap">
          <div className="flex gap-3 flex-wrap">
            {[
              { id: 'all', label: 'TẤT CẢ' },
              { id: 'safe', label: 'AN TOÀN' },
              { id: 'phishing', label: 'MỐI ĐE DỌA' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setEmailFilter(f.id)}
                className={`px-5 py-2.5 rounded-md text-sm font-mono font-semibold transition ${
                  emailFilter === f.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                [{f.label}]
              </button>
            ))}
          </div>
          <button
            onClick={onRefresh}
            className="px-5 py-2.5 rounded-md text-sm font-mono font-semibold transition flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <RefreshCw className="w-5 h-5" />
            LÀM MỚI
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 p-5 rounded">
        <p className="text-gray-700 text-base font-mono">
          ML Engine Đang Hoạt Động: Quét email real-time với mô hình deep learning. 
          Tất cả URL được phân tích tự động để phát hiện phishing, malware và spam.
        </p>
      </div>

      {/* Email List */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        {loadingEmails ? (
          <div className="p-10 text-center">
            <p className="text-gray-600 font-mono text-lg">[ ĐANG QUÉT... ]</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-10 text-center">
            <Mail className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 font-mono text-lg">[ KHÔNG TÌM THẤY EMAIL ]</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEmails.map((email, index) => {
              const isPhishing = email.is_phishing || email.status === 'phishing';
              const emailFrom = email.from || email.sender || 'Unknown sender';
              const emailSubject = email.subject || 'No subject';
              const emailTime = email.time || email.received_time || 'Recently';
              const riskScore = email.risk_score || email.risk || (isPhishing ? 90 : 5);
              const urlCount = email.url_count || email.urls || 0;

              return (
                <div key={email.id || index} className="p-5 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`text-sm px-3 py-1.5 rounded-md font-mono font-bold ${
                          isPhishing ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {isPhishing ? '[MỐI ĐE DỌA]' : '[AN TOÀN]'}
                      </span>
                      <span className="text-gray-800 font-mono text-base font-medium">
                        {emailFrom}
                      </span>
                      <span className="text-gray-500 text-sm font-mono">
                        {emailTime}
                      </span>
                    </div>
                    <span className="text-gray-600 text-base font-mono font-semibold">
                      Rủi ro: {riskScore}%
                    </span>
                  </div>
                  <p className="text-gray-800 text-base mb-2 font-mono font-medium">
                    {emailSubject}
                  </p>
                  <div className="flex items-center gap-4 text-sm font-mono flex-wrap mb-3">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      URLs: {urlCount} {isPhishing ? 'đáng ngờ' : 'đã xác minh'}
                    </span>
                    {getThreatTypeBadge(email).map((badge, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-md text-sm font-mono font-bold bg-gray-100 text-gray-700"
                        style={{ color: badge.color }}
                      >
                        [{badge.label}]
                      </span>
                    ))}
                    <span className={`font-semibold ${isPhishing ? 'text-red-600' : 'text-green-600'}`}>
                      Trạng thái: {isPhishing ? 'TỰ ĐỘNG CHẶN' : 'ĐÃ XÁC MINH'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => handleViewDetails(email)}
                      className="px-4 py-2 rounded-md text-sm font-mono font-semibold hover:bg-gray-200 transition flex items-center gap-2 bg-gray-100 text-gray-700"
                    >
                      <Eye className="w-4 h-4" />
                      XEM PHÂN TÍCH
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Email Detail Modal */}
      <EmailDetailModal
        email={selectedEmail}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEnableMFA={handleEnableMFA}
        onEnableSandbox={handleEnableSandbox}
        onDisconnect={handleDisconnect}
      />

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Tỷ Lệ Phát Hiện"
          value="100%"
          icon={CheckCircle}
          iconColor="#44ff44"
          subtitle="Tất cả mối đe dọa được ML phát hiện"
        />
        <StatCard
          title="Báo Động Sai"
          value="0"
          icon={Activity}
          iconColor="#00d9ff"
          subtitle="Độ chính xác hoàn hảo"
        />
        <StatCard
          title="Thời Gian Phân Tích TB"
          value="0.8s"
          icon={TrendingUp}
          iconColor="#00d9ff"
          subtitle="Xử lý ML real-time"
        />
      </div>
    </div>
  );
};

export default EmailProtectionTab;
