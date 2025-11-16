import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const BACKEND_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  endpoints: {
    reportsData: '/reports-data'
  }
};

const ReportsTab = ({ displayStats }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState({
    summary: {
      total_emails: 0,
      threats_detected: 0,
      detection_rate: '0%',
      avg_analysis_time: '0.0s'
    },
    daily_trends: [],
    threat_types: []
  });

  // Fetch reports data
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const days = selectedPeriod === '7days' ? 7 : selectedPeriod === '30days' ? 30 : selectedPeriod === '90days' ? 90 : 7;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(`${BACKEND_CONFIG.baseUrl}${BACKEND_CONFIG.endpoints.reportsData}?days=${days}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setReportsData(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching reports data:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportsData();
  }, [selectedPeriod]);
  
  const handleRefresh = () => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const days = selectedPeriod === '7days' ? 7 : selectedPeriod === '30days' ? 30 : selectedPeriod === '90days' ? 90 : 7;
        
        const response = await fetch(`${BACKEND_CONFIG.baseUrl}${BACKEND_CONFIG.endpoints.reportsData}?days=${days}&refresh=true`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setReportsData(data);
      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportsData();
  };
  
  // Use real data or fallback to empty
  const dailyData = reportsData.daily_trends.length > 0 
    ? reportsData.daily_trends 
    : [
        { date: '15/01', threats: 0, safe: 0, blocked: 0 },
        { date: '16/01', threats: 0, safe: 0, blocked: 0 },
        { date: '17/01', threats: 0, safe: 0, blocked: 0 },
        { date: '18/01', threats: 0, safe: 0, blocked: 0 },
        { date: '19/01', threats: 0, safe: 0, blocked: 0 },
        { date: '20/01', threats: 0, safe: 0, blocked: 0 },
        { date: '21/01', threats: 0, safe: 0, blocked: 0 }
      ];
  
  const threatTypeData = reportsData.threat_types.length > 0
    ? reportsData.threat_types
    : [
        { type: 'URL Độc Hại', count: 0, percentage: 0 },
        { type: 'File Đính Kèm', count: 0, percentage: 0 },
        { type: 'CEO Fraud', count: 0, percentage: 0 }
      ];

  const customTooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    color: '#1f2937',
    fontFamily: 'monospace',
    fontSize: '14px',
    padding: '12px',
    borderRadius: '6px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            <div>
              <h2 className="text-3xl font-mono font-bold text-gray-900">
                BÁO CÁO & PHÂN TÍCH
              </h2>
              <p className="text-base text-gray-600 font-mono mt-2">
                Xem báo cáo chi tiết về tình hình bảo mật email
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-5 py-2.5 rounded-md text-sm font-mono bg-white border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7days">7 Ngày Qua</option>
              <option value="30days">30 Ngày Qua</option>
              <option value="90days">90 Ngày Qua</option>
              <option value="custom">Tùy Chỉnh</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-5 py-2.5 rounded-md text-sm font-mono font-bold hover:bg-gray-200 transition bg-gray-100 text-gray-700 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              LÀM MỚI
            </button>
            <button
              className="px-5 py-2.5 rounded-md text-sm font-mono font-bold hover:bg-blue-700 transition bg-blue-600 text-white flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              XUẤT PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards - Đồng bộ với displayStats từ App.js */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-mono font-semibold text-gray-600">TỔNG EMAIL</p>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-4xl font-bold font-mono text-gray-900">
            {displayStats?.actualTotal ?? reportsData.summary.total_emails ?? 0}
          </p>
          <p className="text-sm font-mono mt-2 text-gray-500">Đã quét</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-mono font-semibold text-gray-600">MỐI ĐE DỌA</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-4xl font-bold font-mono text-red-600">
            {displayStats?.actualPhishing ?? reportsData.summary.threats_detected ?? 0}
          </p>
          <p className="text-sm font-mono mt-2 text-gray-500">Đã phát hiện</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-mono font-semibold text-gray-600">TỶ LỆ PHÁT HIỆN</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-4xl font-bold font-mono text-green-600">
            {displayStats?.phishingRate ?? reportsData.summary.detection_rate ?? '0%'}
          </p>
          <p className="text-sm font-mono mt-2 text-gray-500">Tự động chặn</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-mono font-semibold text-gray-600">THỜI GIAN TRUNG BÌNH</p>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-4xl font-bold font-mono text-blue-600">
            {loading ? '...' : reportsData.summary.avg_analysis_time}
          </p>
          <p className="text-sm font-mono mt-2 text-gray-500">Phân tích</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Trend */}
        <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
          <h3 className="text-xl font-mono mb-5 font-bold text-gray-900">
            XU HƯỚNG HÀNG NGÀY
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} name="Mối Đe Dọa" />
                <Line type="monotone" dataKey="safe" stroke="#22c55e" strokeWidth={2} name="An Toàn" />
                <Line type="monotone" dataKey="blocked" stroke="#2563eb" strokeWidth={2} name="Đã Chặn" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Threat Types */}
        <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
          <h3 className="text-xl font-mono mb-5 font-bold text-gray-900">
            PHÂN LOẠI MỐI ĐE DỌA
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={threatTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="type" stroke="#6b7280" style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontFamily: 'monospace', fontSize: '12px' }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="count" fill="#2563eb" name="Số Lượng" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detailed Report */}
      <div className="bg-white border border-gray-200 p-6 rounded shadow-sm">
        <h3 className="text-xl font-mono mb-5 font-bold text-gray-900">
          BÁO CÁO CHI TIẾT
        </h3>
        <div className="space-y-4">
          {threatTypeData.map((item, idx) => (
            <div key={idx} className="bg-gray-50 border border-gray-200 p-5 rounded">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono font-bold text-base text-gray-900">{item.type}</p>
                <p className="text-base font-mono text-gray-600 font-semibold">
                  {item.count} mối đe dọa ({item.percentage}%)
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full"
                  style={{
                    background: idx === 0 ? '#ef4444' : idx === 1 ? '#f97316' : '#2563eb',
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

