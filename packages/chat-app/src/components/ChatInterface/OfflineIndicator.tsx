import React, { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';

export const OfflineIndicator: React.FC = () => {
  const { isOffline, setOfflineMode } = useChatStore();

  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOfflineMode]);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${
        isOffline ? 'bg-red-500 animate-pulse' : 'bg-green-500'
      }`} />
      <span className={`text-xs font-medium ${
        isOffline 
          ? 'text-red-600 dark:text-red-400' 
          : 'text-green-600 dark:text-green-400'
      }`}>
        {isOffline ? '오프라인' : '온라인'}
      </span>
    </div>
  );
}; 