import React, { useState } from 'react';
import { CheckCircle, Activity, AlertTriangle, Shield, MapPin, Clock, User } from 'lucide-react';

const MFATab = () => {
  const [mfaLogs] = useState([
    {
      time: '14:23',
      user: 'admin@company.com',
      location: 'Hanoi, VN',
      mfa: 'VERIFIED',
      risk: 'LOW',
      method: 'TOTP',
      suspicious: false
    },
    {
      time: '14:15',
      user: 'user@company.com',
      location: 'Vị trí không xác định',
      mfa: 'VERIFIED',
      risk: 'HIGH',
      method: 'SMS',
      suspicious: true
    },
    {
      time: '13:45',
      user: 'manager@company.com',
      location: 'Ho Chi Minh, VN',
      mfa: 'NOT_REQUIRED',
      risk: 'LOW',
      method: '-',
      suspicious: false
    },
    {
      time: '13:30',
      user: 'finance@company.com',
      location: 'Da Nang, VN',
      mfa: 'VERIFIED',
      risk: 'MEDIUM',
      method: 'WebAuthn',
      suspicious: false
    }
  ]);

  const getRiskLabel = (risk) => {
    const labels = {
      'LOW': 'THẤP',
      'MEDIUM': 'TRUNG BÌNH',
      'HIGH': 'CAO'
    };
    return labels[risk] || risk;
  };

  const getMFALabel = (mfa) => {
    const labels = {
      'VERIFIED': 'ĐÃ XÁC THỰC',
      'NOT_REQUIRED': 'KHÔNG YÊU CẦU',
      'PENDING': 'ĐANG CHỜ'
    };
    return labels[mfa] || mfa;
  };

  return (
    <div className="space-y-6">
      <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
        <h2 style={{ color: '#00d9ff' }} className="text-2xl font-mono mb-6">
          XÁC THỰC ĐA YẾU TỐ THÍCH ỨNG
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div style={{ background: '#002d00', border: '1px solid #44ff44' }} className="p-4 rounded">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6" style={{ color: '#44ff44' }} />
              <p style={{ color: '#44ff44' }} className="font-mono font-bold">MFA CHỐNG PHISHING</p>
            </div>
            <p style={{ color: '#7a8a99' }} className="text-sm font-mono">
              ĐÃ KÍCH HOẠT - Sử dụng tiêu chuẩn WebAuthn/FIDO2
            </p>
          </div>
          
          <div style={{ background: '#0a0e27', border: '1px solid #00d9ff' }} className="p-4 rounded">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6" style={{ color: '#00d9ff' }} />
              <p style={{ color: '#00d9ff' }} className="font-mono font-bold">PHÁT HIỆN RỦI RO DỰA TRÊN ML</p>
            </div>
            <p style={{ color: '#7a8a99' }} className="text-sm font-mono">
              HOẠT ĐỘNG - Xác thực nhận biết ngữ cảnh
            </p>
          </div>
        </div>

        <h3 style={{ color: '#00d9ff' }} className="text-lg font-mono mb-4">
          HOẠT ĐỘNG ĐĂNG NHẬP (24 GIỜ QUA)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1a3a52' }}>
                <th style={{ color: '#7a8a99' }} className="px-6 py-3 text-left text-xs font-mono uppercase">THỜI GIAN</th>
                <th style={{ color: '#7a8a99' }} className="px-6 py-3 text-left text-xs font-mono uppercase">NGƯỜI DÙNG</th>
                <th style={{ color: '#7a8a99' }} className="px-6 py-3 text-left text-xs font-mono uppercase">VỊ TRÍ</th>
                <th style={{ color: '#7a8a99' }} className="px-6 py-3 text-left text-xs font-mono uppercase">MFA</th>
                <th style={{ color: '#7a8a99' }} className="px-6 py-3 text-left text-xs font-mono uppercase">PHƯƠNG THỨC</th>
                <th style={{ color: '#7a8a99' }} className="px-6 py-3 text-left text-xs font-mono uppercase">RỦI RO</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#1a3a52' }}>
              {mfaLogs.map((log, idx) => (
                <React.Fragment key={idx}>
                  <tr className="hover:opacity-80 transition">
                    <td style={{ color: '#00d9ff' }} className="px-6 py-4 text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {log.time}
                      </div>
                    </td>
                    <td style={{ color: '#b8c5d6' }} className="px-6 py-4 text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {log.user}
                      </div>
                    </td>
                    <td style={{ color: '#b8c5d6' }} className="px-6 py-4 text-sm font-mono">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {log.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        style={{ 
                          background: log.mfa === 'VERIFIED' ? '#002d00' : '#1a3a52', 
                          color: log.mfa === 'VERIFIED' ? '#44ff44' : '#7a8a99' 
                        }} 
                        className="px-2 py-1 text-xs font-mono font-bold rounded"
                      >
                        {getMFALabel(log.mfa)}
                      </span>
                    </td>
                    <td style={{ color: '#7a8a99' }} className="px-6 py-4 text-sm font-mono">
                      {log.method}
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        style={{ 
                          background: log.risk === 'HIGH' ? '#2d0000' : log.risk === 'MEDIUM' ? '#1a3a52' : '#002d00', 
                          color: log.risk === 'HIGH' ? '#ff4444' : log.risk === 'MEDIUM' ? '#ff8800' : '#44ff44' 
                        }} 
                        className="px-2 py-1 text-xs font-mono font-bold rounded"
                      >
                        {getRiskLabel(log.risk)}
                      </span>
                    </td>
                  </tr>
                  {log.suspicious && (
                    <tr style={{ background: '#2d0000' }}>
                      <td colSpan="6" className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" style={{ color: '#ff4444' }} />
                          <p style={{ color: '#ff4444' }} className="text-sm font-mono">
                            ML Engine phát hiện mẫu đăng nhập đáng ngờ - MFA tự động được kích hoạt
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="mt-8 p-4 rounded">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5" style={{ color: '#00d9ff' }} />
            <div>
              <h4 style={{ color: '#00d9ff' }} className="font-mono font-bold mb-3">
                CÁC TRƯỜNG HỢP KÍCH HOẠT MFA THÍCH ỨNG BẰNG AI:
              </h4>
              <ul style={{ color: '#7a8a99' }} className="text-sm font-mono space-y-2 list-disc list-inside">
                <li>Phát hiện vị trí đăng nhập bất thường bởi mô hình ML địa lý</li>
                <li>Click vào URL rủi ro cao trong email (phát hiện bởi công cụ phân tích mối đe dọa)</li>
                <li>Nhiều lần đăng nhập thất bại với phát hiện hành vi bất thường</li>
                <li>Đăng nhập từ dấu vết thiết bị mới không có trong cơ sở dữ liệu tin cậy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* MFA Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
            <p style={{ color: '#7a8a99' }} className="text-xs font-mono mb-2">TỔNG ĐĂNG NHẬP</p>
            <p style={{ color: '#00d9ff' }} className="text-2xl font-mono font-bold">24</p>
            <p style={{ color: '#7a8a99' }} className="text-xs font-mono mt-1">24 giờ qua</p>
          </div>
          <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
            <p style={{ color: '#7a8a99' }} className="text-xs font-mono mb-2">MFA ĐÃ KÍCH HOẠT</p>
            <p style={{ color: '#44ff44' }} className="text-2xl font-mono font-bold">18</p>
            <p style={{ color: '#7a8a99' }} className="text-xs font-mono mt-1">75% tổng số</p>
          </div>
          <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
            <p style={{ color: '#7a8a99' }} className="text-xs font-mono mb-2">RỦI RO CAO</p>
            <p style={{ color: '#ff4444' }} className="text-2xl font-mono font-bold">2</p>
            <p style={{ color: '#7a8a99' }} className="text-xs font-mono mt-1">Đã được bảo vệ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFATab;
