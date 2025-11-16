import React from 'react';
import { X } from 'lucide-react';

const Widget = ({ 
  id, 
  title, 
  children, 
  className = '', 
  onClose,
  showClose = true 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative ${className}`}>
      {showClose && onClose && (
        <button
          onClick={() => onClose(id)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Đóng widget"
        >
          <X size={18} />
        </button>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-4 pr-8">{title}</h3>
      <div className="text-gray-700 text-base">
        {children}
      </div>
    </div>
  );
};

export default Widget;

