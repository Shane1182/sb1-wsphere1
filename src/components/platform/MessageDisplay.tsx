import React from 'react';
import { AlertCircle, Info, CheckCircle } from 'lucide-react';
import { PlatformMessage } from '../../types/platform';

interface MessageDisplayProps {
  message: PlatformMessage;
}

export function MessageDisplay({ message }: MessageDisplayProps) {
  const getMessageStyles = () => {
    switch (message.type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: <CheckCircle className="h-5 w-5 text-green-400" />,
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: <Info className="h-5 w-5 text-blue-400" />,
        };
    }
  };

  const styles = getMessageStyles();

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-lg p-4`}>
      <div className="flex">
        <div className="flex-shrink-0">{styles.icon}</div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${styles.text}`}>{message.title}</h3>
          <div className={`mt-2 text-sm ${styles.text}`}>
            <p>{message.content}</p>
          </div>
          {message.expiresAt && (
            <p className="mt-2 text-xs text-gray-500">
              Expires: {message.expiresAt.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}