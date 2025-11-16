import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Activity, Shield, AlertTriangle, TrendingUp, CheckCircle2, Play } from 'lucide-react';
import Widget from './Widget';

const OverviewWidgets = ({ realStats, displayStats, onCloseWidget, closedWidgets = new Set() }) => {
  const statsData = [
    { name: 'Phishing', value: displayStats.threatsDetected || 0, color: '#ef4444' },
    { name: 'An Toàn', value: displayStats.safeEmails || 0, color: '#22c55e' }
  ];

  const trendData = [
    { date: '01/01', threats: 5, safe: 35 },
    { date: '02/01', threats: 8, safe: 32 },
    { date: '03/01', threats: 3, safe: 37 },
    { date: '04/01', threats: 12, safe: 28 },
    { date: '05/01', threats: 7, safe: 33 },
    { date: '06/01', threats: 9, safe: 31 },
    { date: '07/01', threats: displayStats.threatsDetected || 0, safe: displayStats.safeEmails || 0 }
  ];

  const widgets = [
    {
      id: 'getting-started-videos',
      title: 'Video Hướng Dẫn Bắt Đầu',
      content: (
        <div className="space-y-3">
          {[
            { label: 'Tour Nhanh', icon: Play },
            { label: 'Thiết Lập Ban Đầu', icon: Play },
            { label: 'Cấu Hình', icon: Play },
            { label: 'Đăng Ký Thiết Bị', icon: Play },
            { label: 'Các Tác Vụ Hàng Ngày', icon: Play }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
              <item.icon size={20} className="text-blue-600" />
              <span className="text-base text-gray-700 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'getting-started-tasks',
      title: 'Tác Vụ Bắt Đầu: 5/5 đã hoàn thành',
      content: (
        <div className="space-y-3">
          {[
            'Wizard khởi động chính sách',
            'Thiết lập Android Enterprise',
            'Wizard chứng chỉ APNs',
            'Wizard thêm thiết bị',
            'Hiển thị widget mặc định'
          ].map((task, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-blue-600" />
              <span className="text-base text-gray-700 font-medium">{task}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'managed-status',
      title: 'Trạng Thái Quản Lý - Tất Cả',
      content: (
        <div className="flex items-center justify-around mt-4">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">{displayStats.totalEmails || 0}</div>
            <div className="text-base text-gray-600 mt-2 font-medium">Đã Quản Lý</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">0</div>
            <div className="text-base text-gray-600 mt-2 font-medium">Chưa Quản Lý</div>
          </div>
        </div>
      )
    },
    {
      id: 'add-device-wizard',
      title: 'Wizard Thêm Thiết Bị',
      content: (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Activity size={48} className="text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">Thêm Thiết Bị</div>
        </div>
      )
    },
    {
      id: 'compliance-status',
      title: 'Trạng Thái Tuân Thủ - Tất Cả',
      content: (
        <>
          <div className="flex items-center justify-center mt-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Tuân Thủ', value: displayStats.safeEmails || 0, color: '#22c55e' },
                    { name: 'Không Tuân Thủ', value: displayStats.threatsDetected || 0, color: '#f97316' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                >
                  {[
                    { name: 'Tuân Thủ', value: displayStats.safeEmails || 0, color: '#22c55e' },
                    { name: 'Không Tuân Thủ', value: displayStats.threatsDetected || 0, color: '#f97316' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <div className="text-2xl font-bold text-gray-900">{displayStats.totalEmails || 0}</div>
            <div className="text-xs text-gray-500">Tổng số</div>
          </div>
        </>
      )
    },
    {
      id: 'compliance-violation',
      title: 'Mức Độ Nghiêm Trọng Vi Phạm Tuân Thủ',
      content: (
        <div className="mt-4 space-y-4">
          {[
            { label: 'Thấp', value: 5, color: '#3b82f6' },
            { label: 'Trung Bình', value: 1, color: '#f97316' },
            { label: 'Cao', value: 1, color: '#ef4444' }
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-base mb-2">
                <span className="text-gray-700 font-medium">{item.label}</span>
                <span className="font-bold text-gray-900">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${(item.value / 7) * 100}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'ownership',
      title: 'Quyền Sở Hữu - Tất Cả',
      content: (
        <div className="flex items-center justify-around mt-4">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">{displayStats.safeEmails || 0}</div>
            <div className="text-base text-gray-600 mt-2 font-medium">Doanh Nghiệp</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">{displayStats.threatsDetected || 0}</div>
            <div className="text-base text-gray-600 mt-2 font-medium">Cá Nhân</div>
          </div>
        </div>
      )
    },
    {
      id: 'devices-per-group',
      title: 'Thiết Bị Theo Nhóm',
      content: (
        <>
          <div className="flex items-center justify-center mt-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Tài Chính', value: 5, color: '#3b82f6' },
                    { name: 'Bán Hàng', value: 4, color: '#8b5cf6' },
                    { name: 'Marketing', value: 3, color: '#ec4899' },
                    { name: 'Kỹ Thuật', value: 6, color: '#10b981' },
                    { name: 'Tư Vấn', value: 2, color: '#f59e0b' },
                    { name: 'Mặc Định', value: 1, color: '#6b7280' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                >
                  {[
                    { name: 'Tài Chính', value: 5, color: '#3b82f6' },
                    { name: 'Bán Hàng', value: 4, color: '#8b5cf6' },
                    { name: 'Marketing', value: 3, color: '#ec4899' },
                    { name: 'Kỹ Thuật', value: 6, color: '#10b981' },
                    { name: 'Tư Vấn', value: 2, color: '#f59e0b' },
                    { name: 'Mặc Định', value: 1, color: '#6b7280' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <div className="text-2xl font-bold text-gray-900">{displayStats.totalEmails || 0}</div>
            <div className="text-xs text-gray-500">Tổng số</div>
          </div>
        </>
      )
    },
    {
      id: 'threat-trend',
      title: 'Xu Hướng Phát Hiện Mối Đe Dọa',
      className: 'lg:col-span-2',
      content: (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Area type="monotone" dataKey="threats" stroke="#ef4444" fillOpacity={1} fill="url(#colorThreats)" name="Mối Đe Dọa" />
              <Area type="monotone" dataKey="safe" stroke="#22c55e" fillOpacity={1} fill="url(#colorSafe)" name="An Toàn" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )
    }
  ];

  return (
    <>
      {widgets
        .filter(widget => !closedWidgets.has(widget.id))
        .map(widget => (
          <Widget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            className={widget.className}
            onClose={onCloseWidget}
          >
            {widget.content}
          </Widget>
        ))}
    </>
  );
};

export default OverviewWidgets;

