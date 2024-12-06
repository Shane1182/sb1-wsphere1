import React from 'react';
import { FileText, Download, Clock, AlertCircle } from 'lucide-react';
import { RequiredReading } from '../../types/reading';

interface RequiredReadingListProps {
  readings: RequiredReading[];
  isAdmin?: boolean;
  onDelete?: (reading: RequiredReading) => void;
}

export function RequiredReadingList({
  readings,
  isAdmin = false,
  onDelete,
}: RequiredReadingListProps) {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getPriorityColor = (priority: RequiredReading['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="space-y-4">
      {readings.map((reading) => (
        <div
          key={reading.id}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900">{reading.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(reading.priority)}`}>
                  {reading.priority.charAt(0).toUpperCase() + reading.priority.slice(1)} Priority
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{reading.description}</p>
              
              {reading.dueDate && (
                <div className="mt-2 flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-gray-600">
                    Due by {formatDate(reading.dueDate)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <a
                href={reading.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </a>

              {isAdmin && onDelete && (
                <button
                  onClick={() => onDelete(reading)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <AlertCircle className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}