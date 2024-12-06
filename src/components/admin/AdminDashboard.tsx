import React, { useState } from 'react';
import { Users, BookOpen, BarChart, FileText, BookMarked } from 'lucide-react';
import { Analytics } from '../admin/Analytics';
import { UserManagement } from '../admin/UserManagement';
import { ContentManagement } from '../admin/ContentManagement';
import { GovernanceUploader } from './GovernanceUploader';
import { ReadingUploader } from './ReadingUploader';
import { GovernanceDocumentList } from '../governance/GovernanceDocumentList';
import { RequiredReadingList } from '../reading/RequiredReadingList';
import { useGovernanceDocuments } from '../../hooks/useGovernanceDocuments';
import { useRequiredReading } from '../../hooks/useRequiredReading';

type ActiveSection = 'analytics' | 'users' | 'content' | 'governance' | 'reading';

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('analytics');
  const { documents, loading: docsLoading, deleteDocument } = useGovernanceDocuments();
  const { readings, loading: readingsLoading, deleteReading } = useRequiredReading();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <button
          onClick={() => setActiveSection('analytics')}
          className={`bg-white p-6 rounded-lg shadow transition-colors ${
            activeSection === 'analytics' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            <BarChart className="h-8 w-8 text-blue-500" />
            <h2 className="text-lg font-semibold">Analytics</h2>
          </div>
          <p className="mt-2 text-gray-600">Platform usage and insights</p>
        </button>

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
          <p className="mt-2 text-gray-600">Manage users and their roles</p>
        </button>

        <button
          onClick={() => setActiveSection('content')}
          className={`bg-white p-6 rounded-lg shadow transition-colors ${
            activeSection === 'content' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-500" />
            <h2 className="text-lg font-semibold">Content Management</h2>
          </div>
          <p className="mt-2 text-gray-600">Create and manage learning modules</p>
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
            <BookMarked className="h-8 w-8 text-blue-500" />
            <h2 className="text-lg font-semibold">Required Reading</h2>
          </div>
          <p className="mt-2 text-gray-600">Manage required reading materials</p>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeSection === 'analytics' && <Analytics />}
        {activeSection === 'users' && <UserManagement />}
        {activeSection === 'content' && <ContentManagement />}
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
      </div>
    </div>
  );
}