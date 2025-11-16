import React, { useState } from 'react';
import { Settings, Save, Bell, Shield, Network, User, Key, Globe, Mail } from 'lucide-react';

const SettingsTab = () => {
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      threatDetected: true,
      weeklyReport: false
    },
    security: {
      autoBlock: true,
      quarantineEnabled: true,
      mfaRequired: false
    },
    integration: {
      virusTotal: true,
      aiAgent: true,
      gmailSync: true
    },
    general: {
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      refreshInterval: 30
    }
  });

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6" style={{ color: '#00d9ff' }} />
            <div>
              <h2 style={{ color: '#00d9ff' }} className="text-2xl font-mono font-bold">
                CÀI ĐẶT HỆ THỐNG
              </h2>
              <p style={{ color: '#7a8a99' }} className="text-sm font-mono mt-1">
                Cấu hình các tùy chọn bảo mật và thông báo
              </p>
            </div>
          </div>
          <button
            style={{ background: '#00d9ff', color: '#0a0e27' }}
            className="px-4 py-2 rounded text-xs font-mono font-bold hover:opacity-80 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            LƯU THAY ĐỔI
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5" style={{ color: '#00d9ff' }} />
          <h3 style={{ color: '#00d9ff' }} className="text-lg font-mono font-bold">
            THÔNG BÁO
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#b8c5d6' }} className="font-mono font-bold">Cảnh Báo Qua Email</p>
              <p style={{ color: '#7a8a99' }} className="text-xs font-mono">Nhận email khi phát hiện mối đe dọa</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.emailAlerts}
                onChange={(e) => updateSetting('notifications', 'emailAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#b8c5d6' }} className="font-mono font-bold">Thông Báo Mối Đe Dọa</p>
              <p style={{ color: '#7a8a99' }} className="text-xs font-mono">Hiển thị thông báo real-time trên dashboard</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.threatDetected}
                onChange={(e) => updateSetting('notifications', 'threatDetected', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#b8c5d6' }} className="font-mono font-bold">Báo Cáo Hàng Tuần</p>
              <p style={{ color: '#7a8a99' }} className="text-xs font-mono">Gửi báo cáo tổng hợp mỗi tuần</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.weeklyReport}
                onChange={(e) => updateSetting('notifications', 'weeklyReport', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5" style={{ color: '#00d9ff' }} />
          <h3 style={{ color: '#00d9ff' }} className="text-lg font-mono font-bold">
            BẢO MẬT
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#b8c5d6' }} className="font-mono font-bold">Tự Động Chặn</p>
              <p style={{ color: '#7a8a99' }} className="text-xs font-mono">Tự động chặn email độc hại</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.autoBlock}
                onChange={(e) => updateSetting('security', 'autoBlock', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#b8c5d6' }} className="font-mono font-bold">Cách Ly File</p>
              <p style={{ color: '#7a8a99' }} className="text-xs font-mono">Tự động cách ly file đính kèm độc hại</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.quarantineEnabled}
                onChange={(e) => updateSetting('security', 'quarantineEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#b8c5d6' }} className="font-mono font-bold">Yêu Cầu MFA</p>
              <p style={{ color: '#7a8a99' }} className="text-xs font-mono">Bắt buộc MFA cho tất cả người dùng</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.mfaRequired}
                onChange={(e) => updateSetting('security', 'mfaRequired', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Integration Settings */}
      <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
        <div className="flex items-center gap-3 mb-4">
          <Network className="w-5 h-5" style={{ color: '#00d9ff' }} />
          <h3 style={{ color: '#00d9ff' }} className="text-lg font-mono font-bold">
            TÍCH HỢP
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: '#00d9ff' }} />
              <div>
                <p style={{ color: '#b8c5d6' }} className="font-mono font-bold">VirusTotal API</p>
                <p style={{ color: '#7a8a99' }} className="text-xs font-mono">Kết nối với VirusTotal để quét URL/file</p>
              </div>
            </div>
            <span style={{ color: settings.integration.virusTotal ? '#44ff44' : '#7a8a99' }} className="text-xs font-mono">
              {settings.integration.virusTotal ? 'ĐÃ KẾT NỐI' : 'CHƯA KẾT NỐI'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: '#00d9ff' }} />
              <div>
                <p style={{ color: '#b8c5d6' }} className="font-mono font-bold">AI Agent</p>
                <p style={{ color: '#7a8a99' }} className="text-xs font-mono">Phân tích CEO fraud bằng AI</p>
              </div>
            </div>
            <span style={{ color: settings.integration.aiAgent ? '#44ff44' : '#7a8a99' }} className="text-xs font-mono">
              {settings.integration.aiAgent ? 'ĐÃ KẾT NỐI' : 'CHƯA KẾT NỐI'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" style={{ color: '#00d9ff' }} />
              <div>
                <p style={{ color: '#b8c5d6' }} className="font-mono font-bold">Đồng Bộ Gmail</p>
                <p style={{ color: '#7a8a99' }} className="text-xs font-mono">Tự động quét email từ Gmail</p>
              </div>
            </div>
            <span style={{ color: settings.integration.gmailSync ? '#44ff44' : '#7a8a99' }} className="text-xs font-mono">
              {settings.integration.gmailSync ? 'ĐÃ KẾT NỐI' : 'CHƯA KẾT NỐI'}
            </span>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-5 h-5" style={{ color: '#00d9ff' }} />
          <h3 style={{ color: '#00d9ff' }} className="text-lg font-mono font-bold">
            CÀI ĐẶT CHUNG
          </h3>
        </div>
        <div className="space-y-4">
          <div>
            <label style={{ color: '#b8c5d6' }} className="block text-sm font-mono font-bold mb-2">
              Ngôn Ngữ
            </label>
            <select
              value={settings.general.language}
              onChange={(e) => updateSetting('general', 'language', e.target.value)}
              style={{
                background: '#0a0e27',
                border: '1px solid #1a3a52',
                color: '#00d9ff',
                colorScheme: 'dark'
              }}
              className="w-full px-4 py-2 rounded text-sm font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label style={{ color: '#b8c5d6' }} className="block text-sm font-mono font-bold mb-2">
              Múi Giờ
            </label>
            <select
              value={settings.general.timezone}
              onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
              style={{
                background: '#0a0e27',
                border: '1px solid #1a3a52',
                color: '#00d9ff',
                colorScheme: 'dark'
              }}
              className="w-full px-4 py-2 rounded text-sm font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>
          <div>
            <label style={{ color: '#b8c5d6' }} className="block text-sm font-mono font-bold mb-2">
              Tần Suất Làm Mới (giây)
            </label>
            <input
              type="number"
              value={settings.general.refreshInterval}
              onChange={(e) => updateSetting('general', 'refreshInterval', parseInt(e.target.value))}
              style={{
                background: '#0a0e27',
                border: '1px solid #1a3a52',
                color: '#00d9ff'
              }}
              className="w-full px-4 py-2 rounded text-sm font-mono focus:outline-none focus:border-cyan-500"
              min="10"
              max="300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;

