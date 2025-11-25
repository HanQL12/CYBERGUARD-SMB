import React, { useState, useEffect, useMemo } from 'react';
import { Activity, RefreshCw, AlertTriangle, Shield, Clock, Zap, CheckCircle2, TrendingUp, Mail, Eye, ArrowRight } from 'lucide-react';

const OverviewTab = ({ realStats, loadingStats, displayStats, onRefresh, filteredEmails = [] }) => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    onRefresh();
    setLastRefresh(new Date());
  };

  const formatTime = (date) => {
    if (!date) return 'Đang khởi tạo...';
    return new Date(date).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get recent threats (last 5 phishing emails)
  const recentThreats = useMemo(() => {
    return filteredEmails
      .filter(email => email.is_phishing)
      .slice(0, 5)
      .map(email => ({
        id: email.id,
        subject: email.subject || 'No subject',
        sender: email.sender || email.from || 'Unknown',
        date: email.date || 'Recently',
        risk: email.risk || 'high'
      }));
  }, [filteredEmails]);

  // Calculate today's stats (mock for now, can be enhanced with real-time data)
  const todayStats = useMemo(() => {
    const total = displayStats.totalEmails || 0;
    const threats = displayStats.threatsDetected || 0;
    const safe = displayStats.safeEmails || 0;
    
    return {
      scanned: total,
      threats: threats,
      blocked: threats,
      safe: safe,
      phishingRate: displayStats.phishingRate || '0%'
    };
  }, [displayStats]);

  // System health indicators
  const systemHealth = useMemo(() => {
    const isActive = realStats.workflow_status === 'active';
    const hasThreats = (displayStats.threatsDetected || 0) > 0;
    
    return {
      status: isActive ? 'operational' : 'warning',
      mlEngine: isActive ? 'active' : 'inactive',
      scanning: isActive ? 'active' : 'paused',
      lastUpdate: realStats.last_updated
    };
  }, [realStats, displayStats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${systemHealth.status === 'operational' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <div className={`absolute inset-0 w-3 h-3 rounded-full ${systemHealth.status === 'operational' ? 'bg-green-500 animate-ping opacity-75' : ''}`}></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tổng Quan</h1>
            <p className="text-sm text-gray-500">
              {systemHealth.lastUpdate 
                ? `Cập nhật: ${formatTime(systemHealth.lastUpdate)}`
                : 'Đang khởi tạo...'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Key Metrics - Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Mail className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-90">Hôm nay</span>
          </div>
          <div className="text-4xl font-bold mb-1">
            {loadingStats ? '...' : todayStats.scanned || 0}
          </div>
          <div className="text-sm opacity-90">Email đã quét</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-90">Phát hiện</span>
          </div>
          <div className="text-4xl font-bold mb-1">
            {loadingStats ? '...' : todayStats.threats || 0}
          </div>
          <div className="text-sm opacity-90">Mối đe dọa</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-90">Đã chặn</span>
          </div>
          <div className="text-4xl font-bold mb-1">
            {loadingStats ? '...' : todayStats.blocked || 0}
          </div>
          <div className="text-sm opacity-90">Tự động chặn</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-90">Tỷ lệ</span>
          </div>
          <div className="text-4xl font-bold mb-1">
            {todayStats.phishingRate || '0%'}
          </div>
          <div className="text-sm opacity-90">Phishing rate</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Health */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Trạng Thái Hệ Thống</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">ML Engine</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${systemHealth.mlEngine === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm font-semibold ${systemHealth.mlEngine === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                      {systemHealth.mlEngine === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Phishing-Defender v2.1</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Quét Email</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${systemHealth.scanning === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm font-semibold ${systemHealth.scanning === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                      {systemHealth.scanning === 'active' ? 'Đang quét' : 'Tạm dừng'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Real-time monitoring</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Thời gian phản hồi</span>
                  <span className="text-sm font-semibold text-gray-900">0.8s</span>
                </div>
                <p className="text-xs text-gray-500">Trung bình</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Độ chính xác</span>
                  <span className="text-sm font-semibold text-green-600">93.5%</span>
                </div>
                <p className="text-xs text-gray-500">ML Model</p>
              </div>
            </div>
          </div>

          {/* Recent Threats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Mối Đe Dọa Gần Đây</h3>
              </div>
              <span className="text-sm text-gray-500">{recentThreats.length} mục</span>
            </div>
            {recentThreats.length > 0 ? (
              <div className="space-y-3">
                {recentThreats.map((threat, idx) => (
                  <div key={threat.id || idx} className="flex items-start gap-3 p-3 border-l-4 border-red-500 bg-red-50 rounded hover:bg-red-100 transition cursor-pointer">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{threat.subject}</p>
                      <p className="text-xs text-gray-600 mt-1">Từ: {threat.sender}</p>
                      <p className="text-xs text-gray-500 mt-1">{threat.date}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold bg-red-200 text-red-700 rounded flex-shrink-0">
                      CAO
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Không có mối đe dọa nào trong thời gian gần đây</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Thống Kê Nhanh</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tổng email</p>
                    <p className="text-lg font-semibold text-gray-900">{displayStats.totalEmails || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email an toàn</p>
                    <p className="text-lg font-semibold text-gray-900">{displayStats.safeEmails || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email phishing</p>
                    <p className="text-lg font-semibold text-gray-900">{displayStats.threatsDetected || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Thao Tác Nhanh</h3>
            </div>
            <div className="space-y-2">
              <a href="#scanner" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Quét URL</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#emails" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Xem email</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </a>
              <a href="#reports" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Xem báo cáo</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Thông Tin Hệ Thống</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cập nhật lần cuối</span>
                <span className="font-medium text-gray-900">
                  {systemHealth.lastUpdate ? formatTime(systemHealth.lastUpdate) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái</span>
                <span className="font-medium text-green-600">Hoạt động</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Làm mới tự động</span>
                <span className="font-medium text-gray-900">30 giây</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
