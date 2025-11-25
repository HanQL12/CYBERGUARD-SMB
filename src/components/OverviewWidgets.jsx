import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
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
      id: 'email-status',
      title: 'Trạng Thái Email',
      content: (
        <div className="flex items-center justify-around mt-4">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">{displayStats.safeEmails || 0}</div>
            <div className="text-base text-gray-600 mt-2 font-medium">Email An Toàn</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">{displayStats.threatsDetected || 0}</div>
            <div className="text-base text-gray-600 mt-2 font-medium">Email Phishing</div>
          </div>
        </div>
      )
    },
    {
      id: 'email-distribution',
      title: 'Phân Bố Email',
      content: (
        <>
          <div className="flex items-center justify-center mt-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                >
                  {statsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <div className="text-2xl font-bold text-gray-900">{displayStats.totalEmails || 0}</div>
            <div className="text-xs text-gray-500">Tổng số email</div>
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

