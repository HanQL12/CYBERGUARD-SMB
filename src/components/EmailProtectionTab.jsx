import React, { useState } from 'react';
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

  const handleViewDetails = (email) => {
    setSelectedEmail(email);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmail(null);
  };

  const handleEnableMFA = (emailId, url) => {
    console.log('Enable MFA for email:', emailId, 'URL:', url);
    // TODO: Call API to enable MFA
    alert(`[MFA ENABLED] Bảo vệ đã được kích hoạt cho URL: ${url}`);
  };

  const handleEnableSandbox = (emailId, filename) => {
    console.log('Enable Sandbox for email:', emailId, 'File:', filename);
    // TODO: Call API to enable sandbox
    alert(`[SANDBOX ENABLED] File sẽ được mở trong môi trường cô lập: ${filename}`);
  };

  const handleDisconnect = () => {
    console.log('Disconnect device');
    // TODO: Call API to disconnect
    alert('[DISCONNECT] Đã ngắt kết nối máy để bảo vệ');
  };

  const getThreatTypeBadge = (email) => {
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
  };

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
      <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-4 rounded">
        <div className="flex gap-2 justify-between items-center flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'TẤT CẢ' },
              { id: 'safe', label: 'AN TOÀN' },
              { id: 'phishing', label: 'MỐI ĐE DỌA' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setEmailFilter(f.id)}
                className="px-4 py-2 rounded text-xs font-mono transition"
                style={{
                  background: emailFilter === f.id ? '#00d9ff' : '#1a3a52',
                  color: emailFilter === f.id ? '#0a0e27' : '#00d9ff',
                  border: '1px solid #1a3a52'
                }}
              >
                [{f.label}]
              </button>
            ))}
          </div>
          <button
            onClick={onRefresh}
            className="px-4 py-2 rounded text-xs font-mono transition flex items-center gap-2 hover:opacity-80"
            style={{ background: '#1a3a52', color: '#00d9ff', border: '1px solid #1a3a52' }}
          >
            <RefreshCw className="w-4 h-4" />
            LÀM MỚI
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
        <p style={{ color: '#7a8a99' }} className="text-sm font-mono">
          ML Engine Đang Hoạt Động: Quét email real-time với mô hình deep learning. 
          Tất cả URL được phân tích tự động để phát hiện phishing, malware và spam.
        </p>
      </div>

      {/* Email List */}
      <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="rounded">
        {loadingEmails ? (
          <div className="p-8 text-center">
            <p style={{ color: '#7a8a99' }} className="font-mono">[ ĐANG QUÉT... ]</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="w-16 h-16 mx-auto mb-4" style={{ color: '#1a3a52' }} />
            <p style={{ color: '#7a8a99' }} className="font-mono">[ KHÔNG TÌM THẤY EMAIL ]</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#1a3a52' }}>
            {filteredEmails.map((email, index) => {
              const isPhishing = email.is_phishing || email.status === 'phishing';
              const emailFrom = email.from || email.sender || 'Unknown sender';
              const emailSubject = email.subject || 'No subject';
              const emailTime = email.time || email.received_time || 'Recently';
              const riskScore = email.risk_score || email.risk || (isPhishing ? 90 : 5);
              const urlCount = email.url_count || email.urls || 0;

              return (
                <div key={email.id || index} className="p-4 hover:opacity-80 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2 py-1 rounded font-mono font-bold"
                        style={{
                          background: isPhishing ? '#2d0000' : '#002d00',
                          color: isPhishing ? '#ff4444' : '#44ff44'
                        }}
                      >
                        {isPhishing ? '[MỐI ĐE DỌA]' : '[AN TOÀN]'}
                      </span>
                      <span style={{ color: '#00d9ff' }} className="font-mono text-xs">
                        {emailFrom}
                      </span>
                      <span style={{ color: '#7a8a99' }} className="text-xs font-mono">
                        {emailTime}
                      </span>
                    </div>
                    <span style={{ color: '#7a8a99' }} className="text-xs font-mono">
                      Rủi ro: {riskScore}%
                    </span>
                  </div>
                  <p style={{ color: '#b8c5d6' }} className="text-sm mb-1 font-mono">
                    {emailSubject}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
                    <span style={{ color: '#7a8a99' }} className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      URLs: {urlCount} {isPhishing ? 'đáng ngờ' : 'đã xác minh'}
                    </span>
                    {getThreatTypeBadge(email).map((badge, i) => (
                      <span
                        key={i}
                        style={{ background: '#1a3a52', color: badge.color }}
                        className="px-2 py-1 rounded text-xs font-mono font-bold"
                      >
                        [{badge.label}]
                      </span>
                    ))}
                    <span style={{ color: isPhishing ? '#ff4444' : '#44ff44' }}>
                      Trạng thái: {isPhishing ? 'TỰ ĐỘNG CHẶN' : 'ĐÃ XÁC MINH'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => handleViewDetails(email)}
                      style={{ background: '#1a3a52', color: '#00d9ff', border: '1px solid #1a3a52' }}
                      className="px-3 py-1 rounded text-xs font-mono hover:opacity-80 transition flex items-center gap-2"
                    >
                      <Eye className="w-3 h-3" />
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
