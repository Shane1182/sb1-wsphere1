import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, Settings, MessageSquare } from 'lucide-react';
import { UsersList } from '../platform/UsersList';
import { GovernanceUploader } from '../admin/GovernanceUploader';
import { GovernanceDocumentList } from '../governance/GovernanceDocumentList';
import { ReadingUploader } from '../admin/ReadingUploader';
import { RequiredReadingList } from '../reading/RequiredReadingList';
import { useAuthStore } from '../../store/authStore';
import { useGovernanceDocuments } from '../../hooks/useGovernanceDocuments';
import { useRequiredReading } from '../../hooks/useRequiredReading';
import { TenantSettings } from '../tenant/TenantSettings';
import { MessageDisplay } from '../platform/MessageDisplay';
import { getActivePlatformMessages } from '../../services/platform';
import { PlatformMessage } from '../../types/platform';

type ActiveSection = 'users' | 'governance' | 'reading' | 'settings';

export function TenantAdminDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('users');
  const { user } = useAuthStore();
  const { documents, loading: docsLoading, deleteDocument } = useGovernanceDocuments();
  const { readings, loading: readingsLoading, deleteReading } = useRequiredReading();
  const [messages, setMessages] = useState<PlatformMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const activeMessages = await getActivePlatformMessages('tenant_admin');
        setMessages(activeMessages);
      } catch (error) {
        console.error('Error loading platform messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tenant Administration</h1>

      {!loadingMessages && messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageDisplay key={message.id} message={message} />
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <button
          onClick={() => setActiveSection('users')}
          className={`bg-white p-6 rounded-lg shadow transition-colors ${
            activeSection === 'users' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-500" />
            <h2 className="text-lg font-semibold">User Management</h2>
          </div>
          <p className="mt-2 text-gray-600">Manage staff and NED users</p>
        </button>

        <button
          onClick={() => setActiveSection('governance')}
          className={`bg-white p-6 rounded-lg shadow transition-colors ${
            activeSection === 'governance' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <h2 className="text-lg font-semibold">Governance</h2>
          </div>
          <p className="mt-2 text-gray-600">Manage governance documents</p>
        </button>

        <button
          onClick={() => setActiveSection('reading')}
          className={`bg-white p-6 rounded-lg shadow transition-colors ${
            activeSection === 'reading' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <h2 className="text-lg font-semibold">Required Reading</h2>
          </div>
          <p className="mt-2 text-gray-600">Manage reading materials</p>
        </button>

        <button
          onClick={() => setActiveSection('settings')}
          className={`bg-white p-6 rounded-lg shadow transition-colors ${
            activeSection === 'settings' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-blue-500" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <p className="mt-2 text-gray-600">Tenant settings and branding</p>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeSection === 'users' && user?.tenantId && (
          <UsersList tenantId={user.tenantId} />
        )}
        
        {activeSection === 'governance' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Upload Governance Document</h2>
              <GovernanceUploader />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Governance Documents</h2>
              {docsLoading ? (
                <p>Loading documents...</p>
              ) : (
                <GovernanceDocumentList 
                  documents={documents}
                  isAdmin={true}
                  onDelete={deleteDocument}
                />
              )}
            </div>
          </div>
        )}

        {activeSection === 'reading' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Add Required Reading</h2>
              <ReadingUploader />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Required Reading Materials</h2>
              {readingsLoading ? (
                <p>Loading reading materials...</p>
              ) : (
                <RequiredReadingList 
                  readings={readings}
                  isAdmin={true}
                  onDelete={deleteReading}
                />
              )}
            </div>
          </div>
        )}

        {activeSection === 'settings' && user?.tenantId && (
          <TenantSettings tenantId={user.tenantId} />
        )}
      </div>
    </div>
  );
}