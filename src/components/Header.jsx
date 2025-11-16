import React, { useState, useEffect } from 'react';
import { Shield, Clock, MapPin, Search } from 'lucide-react';

const Header = ({ workflowStatus }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
      setCurrentDate(now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{ background: '#0f1a2e', borderBottom: '1px solid #1a3a52' }} className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 style={{ color: '#00d9ff' }} className="text-3xl font-bold font-mono">
              CYBERGUARD SMB
            </h1>
            <p style={{ color: '#7a8a99' }} className="text-sm font-mono">
              Phát Hiện Mối Đe Dọa bằng ML| Trạng thái: {workflowStatus === 'active' ? 'HOẠT ĐỘNG' : 'ĐANG TẢI...'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${workflowStatus === 'active' ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`}></div>
              <span style={{ color: workflowStatus === 'active' ? '#44ff44' : '#7a8a99' }} className="text-xs font-mono">
                {workflowStatus === 'active' ? 'TRỰC TUYẾN' : 'NGOẠI TUYẾN'}
              </span>
            </div>
            <button 
              style={{ background: '#1a3a52', color: '#00d9ff', border: '1px solid #1a3a52' }}
              className="px-4 py-2 rounded text-xs font-mono hover:opacity-80 transition"
            >
              &gt; CÀI ĐẶT
            </button>
            <button 
              style={{ background: '#1a3a52', color: '#00d9ff', border: '1px solid #1a3a52' }}
              className="px-4 py-2 rounded text-xs font-mono hover:opacity-80 transition"
            >
              &gt; ĐĂNG XUẤT
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" style={{ color: '#00d9ff' }} />
              <p style={{ color: '#7a8a99' }} className="text-xs font-mono">THỜI GIAN HIỆN TẠI</p>
            </div>
            <p style={{ color: '#00d9ff' }} className="text-2xl font-bold font-mono">{currentTime}</p>
            <p style={{ color: '#7a8a99' }} className="text-xs font-mono mt-1">{currentDate}</p>
          </div>

          <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" style={{ color: '#00d9ff' }} />
              <p style={{ color: '#7a8a99' }} className="text-xs font-mono">VỊ TRÍ</p>
            </div>
            <p style={{ color: '#7a8a99' }} className="text-sm font-mono">Không xác định được</p>
          </div>

          <div style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
              <p style={{ color: '#7a8a99' }} className="text-xs font-mono mb-2">TÌM KIẾM</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm trên web..."
                style={{ 
                  background: '#0a0e27',
                  border: '1px solid #1a3a52',
                  color: '#00d9ff'
                }}
                className="flex-1 px-3 py-1 rounded text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                style={{ background: '#00d9ff', color: '#0a0e27' }}
                className="px-4 py-1 rounded text-xs font-mono font-bold hover:opacity-80 transition"
              >
                TÌM KIẾM
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
