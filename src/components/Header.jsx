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
    <header className="bg-white border-b border-gray-200 p-6 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-mono text-gray-900">
              CYBERGUARD SMB
            </h1>
            <p className="text-base text-gray-600 font-mono mt-1">
              Phát Hiện Mối Đe Dọa bằng ML| Trạng thái: {workflowStatus === 'active' ? 'HOẠT ĐỘNG' : 'ĐANG TẢI...'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${workflowStatus === 'active' ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`}></div>
              <span className={`text-sm font-mono font-semibold ${
                workflowStatus === 'active' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {workflowStatus === 'active' ? 'TRỰC TUYẾN' : 'NGOẠI TUYẾN'}
              </span>
            </div>
            <button 
              className="px-5 py-2.5 rounded-md text-sm font-mono hover:bg-gray-100 transition bg-gray-50 text-gray-700 border border-gray-200 font-semibold"
            >
              &gt; CÀI ĐẶT
            </button>
            <button 
              className="px-5 py-2.5 rounded-md text-sm font-mono hover:bg-gray-100 transition bg-gray-50 text-gray-700 border border-gray-200 font-semibold"
            >
              &gt; ĐĂNG XUẤT
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 p-5 rounded shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-mono font-semibold text-gray-600">THỜI GIAN HIỆN TẠI</p>
            </div>
            <p className="text-3xl font-bold font-mono text-gray-900">{currentTime}</p>
            <p className="text-sm font-mono mt-2 text-gray-500">{currentDate}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-5 rounded shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-mono font-semibold text-gray-600">VỊ TRÍ</p>
            </div>
            <p className="text-base font-mono text-gray-600">Không xác định được</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-5 rounded shadow-sm">
              <p className="text-sm font-mono font-semibold text-gray-600 mb-3">TÌM KIẾM</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm trên web..."
                className="flex-1 px-4 py-2.5 rounded-md text-base font-mono bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                className="px-5 py-2.5 rounded-md text-sm font-mono font-bold hover:bg-blue-700 transition bg-blue-600 text-white"
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
