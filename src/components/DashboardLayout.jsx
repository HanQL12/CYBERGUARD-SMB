import React, { useState } from 'react';
import { X, Plus, RotateCcw } from 'lucide-react';

const DashboardLayout = ({ children, activeTab, onAddWidget, onRestoreLayout }) => {
  const [closedWidgets, setClosedWidgets] = useState(new Set());

  const handleCloseWidget = (widgetId) => {
    setClosedWidgets(prev => new Set([...prev, widgetId]));
  };

  return (
    <div className="flex-1 ml-64 bg-gray-50 min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900 font-mono">TỔNG QUAN</h1>
          <div className="flex gap-3">
            <button
              onClick={onAddWidget}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base font-mono font-semibold"
            >
              <Plus size={18} />
              Thêm Widget
            </button>
            <button
              onClick={onRestoreLayout}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-base font-mono font-semibold"
            >
              <RotateCcw size={18} />
              Khôi Phục Bố Cục Mặc Định
            </button>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

