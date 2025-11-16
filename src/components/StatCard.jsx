import React from 'react';

const StatCard = ({ title, value, icon: Icon, iconColor, subtitle, textColor = '#00d9ff' }) => {
  return (
    <div style={{ background: '#0f1a2e', border: '1px solid #1a3a52' }} className="p-4 rounded">
      <div className="flex items-center justify-between mb-2">
        <p style={{ color: '#7a8a99' }} className="text-xs font-mono">{title.toUpperCase()}</p>
        {Icon && <Icon className="w-5 h-5" style={{ color: iconColor || '#00d9ff' }} />}
      </div>
      <p style={{ color: textColor }} className="text-3xl font-bold font-mono mt-2">
        {value === undefined || value === null ? (
          <span className="animate-pulse">...</span>
        ) : (
          value
        )}
      </p>
      {subtitle && (
        <p style={{ color: '#7a8a99' }} className="text-xs font-mono mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
