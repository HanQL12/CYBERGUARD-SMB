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
      <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-7 h-7 text-blue-600" />
            <div>
              <h2 className="text-3xl font-mono font-bold text-gray-900">
                CÀI ĐẶT HỆ THỐNG
              </h2>
              <p className="text-base text-gray-600 font-mono mt-2">
                Cấu hình các tùy chọn bảo mật và thông báo
              </p>
            </div>
          </div>
          <button
            className="px-5 py-2.5 rounded-md text-sm font-mono font-bold hover:bg-blue-700 transition bg-blue-600 text-white flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            LƯU THAY ĐỔI
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <Bell className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-mono font-bold text-gray-900">
            THÔNG BÁO
          </h3>
        </div>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono font-bold text-base text-gray-900">Cảnh Báo Qua Email</p>
              <p className="text-sm font-mono text-gray-600 mt-1">Nhận email khi phát hiện mối đe dọa</p>
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
              <p className="font-mono font-bold text-base text-gray-900">Thông Báo Mối Đe Dọa</p>
              <p className="text-sm font-mono text-gray-600 mt-1">Hiển thị thông báo real-time trên dashboard</p>
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
              <p className="font-mono font-bold text-base text-gray-900">Báo Cáo Hàng Tuần</p>
              <p className="text-sm font-mono text-gray-600 mt-1">Gửi báo cáo tổng hợp mỗi tuần</p>
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
      <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-mono font-bold text-gray-900">
            BẢO MẬT
          </h3>
        </div>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono font-bold text-base text-gray-900">Tự Động Chặn</p>
              <p className="text-sm font-mono text-gray-600 mt-1">Tự động chặn email độc hại</p>
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
              <p className="font-mono font-bold text-base text-gray-900">Cách Ly File</p>
              <p className="text-sm font-mono text-gray-600 mt-1">Tự động cách ly file đính kèm độc hại</p>
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
              <p className="font-mono font-bold text-base text-gray-900">Yêu Cầu MFA</p>
              <p className="text-sm font-mono text-gray-600 mt-1">Bắt buộc MFA cho tất cả người dùng</p>
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
      <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <Network className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-mono font-bold text-gray-900">
            TÍCH HỢP
          </h3>
        </div>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-mono font-bold text-base text-gray-900">VirusTotal API</p>
                <p className="text-sm font-mono text-gray-600 mt-1">Kết nối với VirusTotal để quét URL/file</p>
              </div>
            </div>
            <span className={`text-sm font-mono font-semibold ${
              settings.integration.virusTotal ? 'text-green-600' : 'text-gray-500'
            }`}>
              {settings.integration.virusTotal ? 'ĐÃ KẾT NỐI' : 'CHƯA KẾT NỐI'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-mono font-bold text-base text-gray-900">AI Agent</p>
                <p className="text-sm font-mono text-gray-600 mt-1">Phân tích CEO fraud bằng AI</p>
              </div>
            </div>
            <span className={`text-sm font-mono font-semibold ${
              settings.integration.aiAgent ? 'text-green-600' : 'text-gray-500'
            }`}>
              {settings.integration.aiAgent ? 'ĐÃ KẾT NỐI' : 'CHƯA KẾT NỐI'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-mono font-bold text-base text-gray-900">Đồng Bộ Gmail</p>
                <p className="text-sm font-mono text-gray-600 mt-1">Tự động quét email từ Gmail</p>
              </div>
            </div>
            <span className={`text-sm font-mono font-semibold ${
              settings.integration.gmailSync ? 'text-green-600' : 'text-gray-500'
            }`}>
              {settings.integration.gmailSync ? 'ĐÃ KẾT NỐI' : 'CHƯA KẾT NỐI'}
            </span>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <Key className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-mono font-bold text-gray-900">
            CÀI ĐẶT CHUNG
          </h3>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-mono font-bold mb-2 text-gray-700">
              Ngôn Ngữ
            </label>
            <select
              value={settings.general.language}
              onChange={(e) => updateSetting('general', 'language', e.target.value)}
              className="w-full px-4 py-2.5 rounded-md text-base font-mono bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-mono font-bold mb-2 text-gray-700">
              Múi Giờ
            </label>
            <select
              value={settings.general.timezone}
              onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
              className="w-full px-4 py-2.5 rounded-md text-base font-mono bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-mono font-bold mb-2 text-gray-700">
              Tần Suất Làm Mới (giây)
            </label>
            <input
              type="number"
              value={settings.general.refreshInterval}
              onChange={(e) => updateSetting('general', 'refreshInterval', parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-md text-base font-mono bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

