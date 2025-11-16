import React from 'react';

const StatCard = ({ title, value, icon: Icon, iconColor, subtitle, textColor = '#2563eb' }) => {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-600 text-sm font-mono font-semibold">{title.toUpperCase()}</p>
        {Icon && <Icon className="w-6 h-6" style={{ color: iconColor || '#2563eb' }} />}
      </div>
      <p style={{ color: textColor }} className="text-4xl font-bold font-mono mt-2">
        {value === undefined || value === null ? (
          <span className="animate-pulse">...</span>
        ) : (
          value
        )}
      </p>
      {subtitle && (
        <p className="text-gray-500 text-sm font-mono mt-2">{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
