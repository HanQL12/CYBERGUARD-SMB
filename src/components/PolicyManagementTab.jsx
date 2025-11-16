import React, { useState } from 'react';
import { FileText, Shield, AlertTriangle, CheckCircle, Save, Plus, Trash2 } from 'lucide-react';

const PolicyManagementTab = () => {
  const [policies, setPolicies] = useState([
    {
      id: 1,
      name: 'Chính Sách URL Độc Hại',
      type: 'url_scanning',
      enabled: true,
      action: 'block',
      description: 'Tự động chặn email chứa URL độc hại được phát hiện bởi VirusTotal'
    },
    {
      id: 2,
      name: 'Chính Sách File Đính Kèm',
      type: 'file_scanning',
      enabled: true,
      action: 'quarantine',
      description: 'Cách ly file đính kèm độc hại vào thư mục an toàn'
    },
    {
      id: 3,
      name: 'Chính Sách CEO Fraud',
      type: 'ceo_fraud',
      enabled: true,
      action: 'alert',
      description: 'Cảnh báo khi phát hiện email có dấu hiệu giả mạo CEO'
    },
    {
      id: 4,
      name: 'Chính Sách MFA Tự Động',
      type: 'auto_mfa',
      enabled: false,
      action: 'enable_mfa',
      description: 'Tự động kích hoạt MFA khi phát hiện URL độc hại'
    }
  ]);

  const [editingPolicy, setEditingPolicy] = useState(null);

  const togglePolicy = (id) => {
    setPolicies(policies.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const getActionColor = (action) => {
    const colors = {
      'block': '#ff4444',
      'quarantine': '#ff8800',
      'alert': '#00d9ff',
      'enable_mfa': '#44ff44'
    };
    return colors[action] || '#7a8a99';
  };

  const getActionLabel = (action) => {
    const labels = {
      'block': 'CHẶN',
      'quarantine': 'CÁCH LY',
      'alert': 'CẢNH BÁO',
      'enable_mfa': 'KÍCH HOẠT MFA'
    };
    return labels[action] || action.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            <div>
              <h2 className="text-3xl font-mono font-bold text-gray-900">
                QUẢN LÝ CHÍNH SÁCH BẢO MẬT
              </h2>
              <p className="text-base text-gray-600 font-mono mt-2">
                Cấu hình các chính sách tự động để bảo vệ email
              </p>
            </div>
          </div>
          <button
            className="px-5 py-2.5 rounded-md text-sm font-mono font-bold hover:bg-blue-700 transition bg-blue-600 text-white flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            TẠO CHÍNH SÁCH MỚI
          </button>
        </div>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {policies.map(policy => (
          <div
            key={policy.id}
            className="bg-white border border-gray-200 p-6 rounded shadow-sm"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-mono font-bold text-gray-900">
                    {policy.name}
                  </h3>
                  <span
                    className={`px-4 py-1.5 rounded-md text-sm font-mono font-bold ${
                      policy.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {policy.enabled ? 'KÍCH HOẠT' : 'TẮT'}
                  </span>
                  <span
                    className="px-4 py-1.5 rounded-md text-sm font-mono font-bold bg-gray-100 text-gray-700"
                    style={{ color: getActionColor(policy.action) }}
                  >
                    {getActionLabel(policy.action)}
                  </span>
                </div>
                <p className="text-base text-gray-600 font-mono">
                  {policy.description}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => togglePolicy(policy.id)}
                  className={`px-5 py-2.5 rounded-md text-sm font-mono font-bold hover:opacity-90 transition ${
                    policy.enabled 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {policy.enabled ? 'TẮT' : 'BẬT'}
                </button>
                <button
                  className="px-5 py-2.5 rounded-md text-sm font-mono font-bold hover:bg-gray-200 transition bg-gray-100 text-gray-700"
                >
                  CHỈNH SỬA
                </button>
              </div>
            </div>

            {/* Policy Details */}
            <div className="grid grid-cols-3 gap-4 mt-5">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                <p className="text-sm font-mono mb-2 font-semibold text-gray-600">LOẠI CHÍNH SÁCH</p>
                <p className="text-base font-mono font-bold text-gray-900">
                  {policy.type.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                <p className="text-sm font-mono mb-2 font-semibold text-gray-600">HÀNH ĐỘNG</p>
                <p className="text-base font-mono font-bold" style={{ color: getActionColor(policy.action) }}>
                  {getActionLabel(policy.action)}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                <p className="text-sm font-mono mb-2 font-semibold text-gray-600">TRẠNG THÁI</p>
                <div className="flex items-center gap-2">
                  {policy.enabled ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-gray-400" />
                  )}
                  <p className={`text-base font-mono font-bold ${
                    policy.enabled ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {policy.enabled ? 'HOẠT ĐỘNG' : 'TẮT'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 p-5 rounded shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-blue-600" />
          <div>
            <h4 className="text-blue-700 font-mono font-bold mb-3 text-lg">
              LƯU Ý VỀ CHÍNH SÁCH
            </h4>
            <ul className="text-gray-700 text-base font-mono space-y-2 list-disc list-inside">
              <li>Chính sách được áp dụng tự động cho tất cả email mới</li>
              <li>Thay đổi chính sách có hiệu lực ngay lập tức</li>
              <li>Hệ thống sẽ ghi log tất cả hành động theo chính sách</li>
              <li>Chính sách có thể được tùy chỉnh theo từng nhóm người dùng</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyManagementTab;

