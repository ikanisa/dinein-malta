import React from 'react';

interface ConnectionIndicatorProps {
  isConnected: boolean;
  className?: string;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ 
  isConnected, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}
        aria-label={isConnected ? 'Connected' : 'Disconnected'}
      />
      <span className={`text-xs font-semibold ${
        isConnected ? 'text-green-500' : 'text-red-500'
      }`}>
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
};
