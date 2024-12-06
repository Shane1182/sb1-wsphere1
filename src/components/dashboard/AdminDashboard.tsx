import React, { useState } from 'react';
import { Users, BookOpen, BarChart } from 'lucide-react';
import { Analytics } from '../admin/Analytics';
import { UserManagement } from '../admin/UserManagement';
import { ContentManagement } from '../admin/ContentManagement';

type ActiveSection = 'analytics' | 'users' | 'content';

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('analytics');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeSection === 'analytics' && <Analytics />}
        {activeSection === 'users' && <UserManagement />}
        {activeSection === 'content' && <ContentManagement />}
      </div>
    </div>
  );
}