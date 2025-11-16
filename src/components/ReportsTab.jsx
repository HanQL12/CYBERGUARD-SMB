import React, { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ReportsTab = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  const dailyData = [
    { date: '15/01', threats: 12, safe: 45, blocked: 12 },
    { date: '16/01', threats: 8, safe: 52, blocked: 8 },
    { date: '17/01', threats: 15, safe: 48, blocked: 15 },
    { date: '18/01', threats: 10, safe: 55, blocked: 10 },
    { date: '19/01', threats: 18, safe: 42, blocked: 18 },
    { date: '20/01', threats: 7, safe: 58, blocked: 7 },
    { date: '21/01', threats: 13, safe: 51, blocked: 13 }
  ];

  const threatTypeData = [
    { type: 'URL Độc Hại', count: 45, percentage: 60 },
    { type: 'File Đính Kèm', count: 20, percentage: 27 },
    { type: 'CEO Fraud', count: 10, percentage: 13 }
  ];

  const customTooltipStyle = {
    backgroundColor: '#0f1a2e',
    border: '1px solid #1a3a52',
    color: '#00d9ff',
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '8px'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" style={{ color: '#00d9ff' }} />
            <div>
              <h2 style={{ color: '#00d9ff' }} className="text-2xl font-mono font-bold">
                BÁO CÁO & PHÂN TÍCH
              </h2>
              <p style={{ color: '#7a8a99' }} className="text-sm font-mono mt-1">
                Xem báo cáo chi tiết về tình hình bảo mật email
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                background: '#0a0e27',
                border: '1px solid #1a3a52',
                color: '#00d9ff',
                colorScheme: 'dark'
              }}
              className="px-4 py-2 rounded text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="7days">7 Ngày Qua</option>
              <option value="30days">30 Ngày Qua</option>
              <option value="90days">90 Ngày Qua</option>
              <option value="custom">Tùy Chỉnh</option>
            </select>
            <button
              style={{ background: '#00d9ff', color: '#0a0e27' }}
              className="px-4 py-2 rounded text-xs font-mono font-bold hover:opacity-80 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              XUẤT PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-4 rounded">
          <div className="flex items-center justify-between mb-2">
            <p style={{ color: '#7a8a99' }} className="text-xs font-mono">TỔNG EMAIL</p>
            <FileText className="w-4 h-4" style={{ color: '#00d9ff' }} />
          </div>
          <p style={{ color: '#00d9ff' }} className="text-3xl font-bold font-mono">284</p>
          <p style={{ color: '#7a8a99' }} className="text-xs font-mono mt-1">Đã quét</p>
        </div>
        <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-4 rounded">
          <div className="flex items-center justify-between mb-2">
            <p style={{ color: '#7a8a99' }} className="text-xs font-mono">MỐI ĐE DỌA</p>
            <AlertTriangle className="w-4 h-4" style={{ color: '#ff4444' }} />
          </div>
          <p style={{ color: '#ff4444' }} className="text-3xl font-bold font-mono">37</p>
          <p style={{ color: '#7a8a99' }} className="text-xs font-mono mt-1">Đã phát hiện</p>
        </div>
        <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-4 rounded">
          <div className="flex items-center justify-between mb-2">
            <p style={{ color: '#7a8a99' }} className="text-xs font-mono">TỶ LỆ PHÁT HIỆN</p>
            <TrendingUp className="w-4 h-4" style={{ color: '#44ff44' }} />
          </div>
          <p style={{ color: '#44ff44' }} className="text-3xl font-bold font-mono">100%</p>
          <p style={{ color: '#7a8a99' }} className="text-xs font-mono mt-1">Tự động chặn</p>
        </div>
        <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-4 rounded">
          <div className="flex items-center justify-between mb-2">
            <p style={{ color: '#7a8a99' }} className="text-xs font-mono">THỜI GIAN TRUNG BÌNH</p>
            <Calendar className="w-4 h-4" style={{ color: '#00d9ff' }} />
          </div>
          <p style={{ color: '#00d9ff' }} className="text-3xl font-bold font-mono">0.8s</p>
          <p style={{ color: '#7a8a99' }} className="text-xs font-mono mt-1">Phân tích</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Trend */}
        <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
          <h3 style={{ color: '#00d9ff' }} className="text-lg font-mono mb-4">
            XU HƯỚNG HÀNG NGÀY
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3a52" />
              <XAxis dataKey="date" stroke="#7a8a99" style={{ fontFamily: 'monospace', fontSize: '10px' }} />
              <YAxis stroke="#7a8a99" style={{ fontFamily: 'monospace', fontSize: '10px' }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Line type="monotone" dataKey="threats" stroke="#ff4444" strokeWidth={2} name="Mối Đe Dọa" />
              <Line type="monotone" dataKey="safe" stroke="#44ff44" strokeWidth={2} name="An Toàn" />
              <Line type="monotone" dataKey="blocked" stroke="#00d9ff" strokeWidth={2} name="Đã Chặn" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Types */}
        <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
          <h3 style={{ color: '#00d9ff' }} className="text-lg font-mono mb-4">
            PHÂN LOẠI MỐI ĐE DỌA
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={threatTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3a52" />
              <XAxis dataKey="type" stroke="#7a8a99" style={{ fontFamily: 'monospace', fontSize: '10px' }} />
              <YAxis stroke="#7a8a99" style={{ fontFamily: 'monospace', fontSize: '10px' }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="count" fill="#00d9ff" name="Số Lượng" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Report */}
      <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-6 rounded">
        <h3 style={{ color: '#00d9ff' }} className="text-lg font-mono mb-4">
          BÁO CÁO CHI TIẾT
        </h3>
        <div className="space-y-4">
          {threatTypeData.map((item, idx) => (
            <div key={idx} style={{ background: '#0a0e27', border: '1px solid #1a3a52' }} className="p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <p style={{ color: '#00d9ff' }} className="font-mono font-bold">{item.type}</p>
                <p style={{ color: '#7a8a99' }} className="text-sm font-mono">
                  {item.count} mối đe dọa ({item.percentage}%)
                </p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    background: idx === 0 ? '#ff4444' : idx === 1 ? '#ff8800' : '#00d9ff',
                    width: `${item.percentage}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;

