import React, { useState } from 'react';
import { AlertCircle, Loader2, Trash2, CheckSquare, Square } from 'lucide-react';
import { PlatformMessage } from '../../types/platform';
import { MessageDisplay } from './MessageDisplay';

interface MessageListProps {
  messages: PlatformMessage[];
  loading: boolean;
  onDelete: (messageIds: string[]) => Promise<void>;
}

export function MessageList({ messages, loading, onDelete }: MessageListProps) {
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

  const toggleMessage = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const toggleAll = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map(m => m.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedMessages.size === 0) return;
    
    const messageIds = Array.from(selectedMessages);
    await onDelete(messageIds);
    setSelectedMessages(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">Loading messages...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No active messages</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new platform message.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAll}
            className="text-gray-500 hover:text-gray-700"
          >
            {selectedMessages.size === messages.length ? (
              <CheckSquare className="h-5 w-5" />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>
          <span className="text-sm text-gray-600">
            {selectedMessages.size} selected
          </span>
        </div>
        {selectedMessages.size > 0 && (
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </button>
        )}
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="relative group">
            <div className="absolute left-4 top-4 z-10">
              <button
                onClick={() => toggleMessage(message.id)}
                className="text-gray-400 group-hover:text-gray-600"
              >
                {selectedMessages.has(message.id) ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className={`pl-12 ${selectedMessages.has(message.id) ? 'bg-blue-50' : ''}`}>
              <MessageDisplay message={message} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}