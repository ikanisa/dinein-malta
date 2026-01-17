import React, { useState, useEffect } from 'react';

interface OrderTimerProps {
  timestamp: number;
  className?: string;
}

export const OrderTimer: React.FC<OrderTimerProps> = ({ timestamp, className = '' }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (minutes < 1) {
        setTimeAgo(`${seconds}s ago`);
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        const hours = Math.floor(minutes / 60);
        setTimeAgo(`${hours}h ${minutes % 60}m ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span className={`text-xs font-semibold text-muted ${className}`}>
      {timeAgo}
    </span>
  );
};
