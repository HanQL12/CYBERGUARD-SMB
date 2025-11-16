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
      <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" style={{ color: '#00d9ff' }} />
            <div>
              <h2 style={{ color: '#00d9ff' }} className="text-2xl font-mono font-bold">
                QUẢN LÝ CHÍNH SÁCH BẢO MẬT
              </h2>
              <p style={{ color: '#7a8a99' }} className="text-sm font-mono mt-1">
                Cấu hình các chính sách tự động để bảo vệ email
              </p>
            </div>
          </div>
          <button
            style={{ background: '#00d9ff', color: '#0a0e27' }}
            className="px-4 py-2 rounded text-xs font-mono font-bold hover:opacity-80 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            TẠO CHÍNH SÁCH MỚI
          </button>
        </div>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {policies.map(policy => (
          <div
            key={policy.id}
            style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }}
            className="p-6 rounded"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5" style={{ color: '#00d9ff' }} />
                  <h3 style={{ color: '#00d9ff' }} className="text-lg font-mono font-bold">
                    {policy.name}
                  </h3>
                  <span
                    className="px-3 py-1 rounded text-xs font-mono font-bold"
                    style={{
                      background: policy.enabled ? '#002d00' : '#1a3a52',
                      color: policy.enabled ? '#44ff44' : '#7a8a99'
                    }}
                  >
                    {policy.enabled ? 'KÍCH HOẠT' : 'TẮT'}
                  </span>
                  <span
                    className="px-3 py-1 rounded text-xs font-mono font-bold"
                    style={{
                      background: '#1a3a52',
                      color: getActionColor(policy.action)
                    }}
                  >
                    {getActionLabel(policy.action)}
                  </span>
                </div>
                <p style={{ color: '#7a8a99' }} className="text-sm font-mono">
                  {policy.description}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePolicy(policy.id)}
                  style={{
                    background: policy.enabled ? '#2d0000' : '#002d00',
                    color: policy.enabled ? '#ff4444' : '#44ff44',
                    border: '1px solid #1a3a52'
                  }}
                  className="px-4 py-2 rounded text-xs font-mono hover:opacity-80 transition"
                >
                  {policy.enabled ? 'TẮT' : 'BẬT'}
                </button>
                <button
                  style={{ background: '#1a3a52', color: '#00d9ff', border: '1px solid #1a3a52' }}
                  className="px-4 py-2 rounded text-xs font-mono hover:opacity-80 transition"
                >
                  CHỈNH SỬA
                </button>
              </div>
            </div>

            {/* Policy Details */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-3 rounded">
                <p style={{ color: '#7a8a99' }} className="text-xs font-mono mb-1">LOẠI CHÍNH SÁCH</p>
                <p style={{ color: '#00d9ff' }} className="text-sm font-mono font-bold">
                  {policy.type.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-3 rounded">
                <p style={{ color: '#7a8a99' }} className="text-xs font-mono mb-1">HÀNH ĐỘNG</p>
                <p style={{ color: getActionColor(policy.action) }} className="text-sm font-mono font-bold">
                  {getActionLabel(policy.action)}
                </p>
              </div>
              <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-3 rounded">
                <p style={{ color: '#7a8a99' }} className="text-xs font-mono mb-1">TRẠNG THÁI</p>
                <div className="flex items-center gap-2">
                  {policy.enabled ? (
                    <CheckCircle className="w-4 h-4" style={{ color: '#44ff44' }} />
                  ) : (
                    <AlertTriangle className="w-4 h-4" style={{ color: '#7a8a99' }} />
                  )}
                  <p style={{ color: policy.enabled ? '#44ff44' : '#7a8a99' }} className="text-sm font-mono font-bold">
                    {policy.enabled ? 'HOẠT ĐỘNG' : 'TẮT'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5" style={{ color: '#00d9ff' }} />
          <div>
            <h4 style={{ color: '#00d9ff' }} className="font-mono font-bold mb-2">
              LƯU Ý VỀ CHÍNH SÁCH
            </h4>
            <ul style={{ color: '#7a8a99' }} className="text-sm font-mono space-y-1 list-disc list-inside">
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

