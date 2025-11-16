import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Shield, 
  Mail, 
  Scan, 
  Settings, 
  BarChart3,
  ChevronRight,
  Users,
  FolderOpen,
  Lock
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuSections = [
    {
      title: 'THÔNG TIN',
      items: [
        { id: 'overview', label: 'Tổng Quan', icon: LayoutDashboard },
        { id: 'reports', label: 'Báo Cáo', icon: BarChart3 },
        { id: 'tasks', label: 'Tác Vụ', icon: FileText }
      ]
    },
    {
      title: 'QUẢN LÝ',
      items: [
        { id: 'emails', label: 'Email', icon: Mail },
        { id: 'mfa', label: 'Xác Thực Đa Yếu Tố', icon: Shield },
        { id: 'scanner', label: 'Quét Mối Đe Dọa', icon: Scan }
      ]
    },
    {
      title: 'CẤU HÌNH',
      items: [
        { id: 'policies', label: 'Chính Sách', icon: FolderOpen, hasSubmenu: true },
        { id: 'settings', label: 'Cài Đặt', icon: Settings, hasSubmenu: true }
      ]
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col shadow-lg z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="text-3xl font-bold text-white">CYBERGUARD</div>
        <div className="text-sm text-gray-400 mt-2">SMB Email Security</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            <div className="px-6 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
              {section.title}
            </div>
            <div className="mt-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-6 py-3.5 text-base transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.hasSubmenu && (
                      <ChevronRight size={18} className="text-gray-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-sm text-gray-400 text-center">
          Phiên bản 2.1
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

