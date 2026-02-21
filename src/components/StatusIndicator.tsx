import React from 'react';
import { Wifi, WifiOff, Eye, EyeOff } from 'lucide-react';
import { useActiveState } from '../hooks/useActiveState';

interface StatusIndicatorProps {
  className?: string;
  showText?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  className = '', 
  showText = true 
}) => {
  const { isActive, isVisible, isFullyActive } = useActiveState();

  const getStatusInfo = () => {
    if (isFullyActive) {
      return {
        icon: <Wifi className="w-4 h-4" />,
        text: 'Online',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      };
    } else if (isVisible && !isActive) {
      return {
        icon: <Eye className="w-4 h-4" />,
        text: 'Visível',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
      };
    } else if (isActive && !isVisible) {
      return {
        icon: <Wifi className="w-4 h-4" />,
        text: 'Ativo',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
      };
    } else {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: 'Inativo',
        color: 'text-gray-500 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-800'
      };
    }
  };

  const status = getStatusInfo();

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${className}`}>
      <span className={status.color}>
        {status.icon}
      </span>
      {showText && (
        <span className={status.color}>
          {status.text}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
