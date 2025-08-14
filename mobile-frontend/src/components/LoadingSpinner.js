import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="mobile-loading">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
        {text && (
          <p className="text-sm text-gray-500">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner; 