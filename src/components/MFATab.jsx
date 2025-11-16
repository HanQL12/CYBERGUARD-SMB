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
      <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
        <h2 className="text-gray-800 text-3xl font-mono font-bold mb-6">
          XÁC THỰC ĐA YẾU TỐ THÍCH ỨNG
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-green-50 border border-green-200 p-5 rounded">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-7 h-7 text-green-600" />
              <p className="text-green-700 font-mono font-bold text-lg">MFA CHỐNG PHISHING</p>
            </div>
            <p className="text-gray-600 text-base font-mono">
              ĐÃ KÍCH HOẠT - Sử dụng tiêu chuẩn WebAuthn/FIDO2
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-5 rounded">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-7 h-7 text-blue-600" />
              <p className="text-blue-700 font-mono font-bold text-lg">PHÁT HIỆN RỦI RO DỰA TRÊN ML</p>
            </div>
            <p className="text-gray-600 text-base font-mono">
              HOẠT ĐỘNG - Xác thực nhận biết ngữ cảnh
            </p>
          </div>
        </div>

        <h3 className="text-gray-800 text-xl font-mono font-bold mb-5">
          HOẠT ĐỘNG ĐĂNG NHẬP (24 GIỜ QUA)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-gray-600 px-6 py-4 text-left text-sm font-mono font-semibold uppercase">THỜI GIAN</th>
                <th className="text-gray-600 px-6 py-4 text-left text-sm font-mono font-semibold uppercase">NGƯỜI DÙNG</th>
                <th className="text-gray-600 px-6 py-4 text-left text-sm font-mono font-semibold uppercase">VỊ TRÍ</th>
                <th className="text-gray-600 px-6 py-4 text-left text-sm font-mono font-semibold uppercase">MFA</th>
                <th className="text-gray-600 px-6 py-4 text-left text-sm font-mono font-semibold uppercase">PHƯƠNG THỨC</th>
                <th className="text-gray-600 px-6 py-4 text-left text-sm font-mono font-semibold uppercase">RỦI RO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mfaLogs.map((log, idx) => (
                <React.Fragment key={idx}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="text-gray-800 px-6 py-4 text-base font-mono">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {log.time}
                      </div>
                    </td>
                    <td className="text-gray-700 px-6 py-4 text-base font-mono">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        {log.user}
                      </div>
                    </td>
                    <td className="text-gray-700 px-6 py-4 text-base font-mono">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {log.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className={`px-3 py-1.5 text-sm font-mono font-bold rounded-md ${
                          log.mfa === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {getMFALabel(log.mfa)}
                      </span>
                    </td>
                    <td className="text-gray-600 px-6 py-4 text-base font-mono">
                      {log.method}
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className={`px-3 py-1.5 text-sm font-mono font-bold rounded-md ${
                          log.risk === 'HIGH' 
                            ? 'bg-red-100 text-red-700' 
                            : log.risk === 'MEDIUM' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {getRiskLabel(log.risk)}
                      </span>
                    </td>
                  </tr>
                  {log.suspicious && (
                    <tr className="bg-red-50">
                      <td colSpan="6" className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <p className="text-red-700 text-base font-mono font-semibold">
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

        <div className="bg-blue-50 border border-blue-200 mt-8 p-5 rounded">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="text-blue-700 font-mono font-bold mb-4 text-lg">
                CÁC TRƯỜNG HỢP KÍCH HOẠT MFA THÍCH ỨNG BẰNG AI:
              </h4>
              <ul className="text-gray-700 text-base font-mono space-y-2 list-disc list-inside">
                <li>Phát hiện vị trí đăng nhập bất thường bởi mô hình ML địa lý</li>
                <li>Click vào URL rủi ro cao trong email (phát hiện bởi công cụ phân tích mối đe dọa)</li>
                <li>Nhiều lần đăng nhập thất bại với phát hiện hành vi bất thường</li>
                <li>Đăng nhập từ dấu vết thiết bị mới không có trong cơ sở dữ liệu tin cậy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* MFA Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          <div className="bg-gray-50 border border-gray-200 p-5 rounded">
            <p className="text-gray-600 text-sm font-mono font-semibold mb-3">TỔNG ĐĂNG NHẬP</p>
            <p className="text-gray-800 text-4xl font-mono font-bold">24</p>
            <p className="text-gray-500 text-sm font-mono mt-2">24 giờ qua</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-5 rounded">
            <p className="text-gray-600 text-sm font-mono font-semibold mb-3">MFA ĐÃ KÍCH HOẠT</p>
            <p className="text-green-600 text-4xl font-mono font-bold">18</p>
            <p className="text-gray-500 text-sm font-mono mt-2">75% tổng số</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-5 rounded">
            <p className="text-gray-600 text-sm font-mono font-semibold mb-3">RỦI RO CAO</p>
            <p className="text-red-600 text-4xl font-mono font-bold">2</p>
            <p className="text-gray-500 text-sm font-mono mt-2">Đã được bảo vệ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFATab;
