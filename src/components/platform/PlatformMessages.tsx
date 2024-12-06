import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { 
  createPlatformMessage, 
  getActivePlatformMessages,
  deletePlatformMessages 
} from '../../services/platform';
import { PlatformMessage } from '../../types/platform';
import { MessageForm } from './MessageForm';
import { MessageList } from './MessageList';

export function PlatformMessages() {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<PlatformMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeMessages = await getActivePlatformMessages('platform_admin');
      setMessages(activeMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load platform messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const messageData = {
        ...data,
        active: true,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      };

      await createPlatformMessage(messageData);
      setShowForm(false);
      await loadMessages();
    } catch (err) {
      console.error('Error creating message:', err);
      setError('Failed to create platform message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (messageIds: string[]) => {
    if (!window.confirm(`Are you sure you want to delete ${messageIds.length} message${messageIds.length === 1 ? '' : 's'}?`)) {
      return;
    }

    try {
      setError(null);
      await deletePlatformMessages(messageIds);
      await loadMessages();
    } catch (err) {
      console.error('Error deleting messages:', err);
      setError('Failed to delete messages');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Platform Messages</h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <MessageList 
        messages={messages}
        loading={loading}
        onDelete={handleDelete}
      />

      {showForm && (
        <MessageForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          submitting={submitting}
        />
      )}
    </div>
  );
}