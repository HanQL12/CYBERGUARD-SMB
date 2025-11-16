import React from 'react';
import { Activity, Search, Lock, Mail, FileText, BarChart3, Settings } from 'lucide-react';

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', label: 'Tổng Quan', icon: Activity },
    { id: 'scanner', label: 'Quét Mối Đe Dọa', icon: Search },
    { id: 'mfa', label: 'Quản Lý MFA', icon: Lock },
    { id: 'emails', label: 'Bảo Vệ Email', icon: Mail },
    { id: 'policies', label: 'Chính Sách', icon: FileText },
    { id: 'reports', label: 'Báo Cáo', icon: BarChart3 },
    { id: 'settings', label: 'Cài Đặt', icon: Settings }
  ];

  return (
    <div style={{ background: '#0f1a2e', borderBottom: '1px solid #1a3a52' }} className="px-6">
      <div className="max-w-7xl mx-auto flex gap-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="py-4 text-sm font-mono transition flex items-center gap-2"
            style={{
              color: activeTab === tab.id ? '#00d9ff' : '#7a8a99',
              borderBottom: activeTab === tab.id ? '2px solid #00d9ff' : 'none'
            }}
          >
            <tab.icon className="w-4 h-4" />
            &gt; {tab.label.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigationTabs;
