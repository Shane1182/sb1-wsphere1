import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { TenantList } from '../../components/platform/TenantList';
import { TenantCreator } from '../../components/platform/TenantCreator';
import { PlatformAnalytics } from '../../components/platform/PlatformAnalytics';
import { PricingManager } from '../../components/platform/PricingManager';
import { PlatformMessages } from '../../components/platform/PlatformMessages';
import { getTenants } from '../../services/tenant';
import { Tenant } from '../../types/tenant';

type ActiveSection = 'analytics' | 'organizations' | 'pricing' | 'messages';

export function PlatformDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('analytics');

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const loadedTenants = await getTenants();
        setTenants(loadedTenants);
      } catch (error) {
        console.error('Error loading tenants:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTenants();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WorkSphere Platform</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and monitor all organizations using the platform
            </p>
          </div>
          {activeSection === 'organizations' && (
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowCreator(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Organization
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <button
          onClick={() => setActiveSection('analytics')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeSection === 'analytics'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveSection('organizations')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeSection === 'organizations'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Organizations
        </button>
        <button
          onClick={() => setActiveSection('pricing')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeSection === 'pricing'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pricing Plans
        </button>
        <button
          onClick={() => setActiveSection('messages')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeSection === 'messages'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Platform Messages
        </button>
      </div>

      <div className="mt-8">
        {activeSection === 'analytics' ? (
          <PlatformAnalytics />
        ) : activeSection === 'pricing' ? (
          <PricingManager />
        ) : activeSection === 'messages' ? (
          <PlatformMessages />
        ) : loading ? (
          <div className="text-center">
            <p className="text-gray-500">Loading organizations...</p>
          </div>
        ) : showCreator ? (
          <div className="bg-white shadow sm:rounded-lg p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Add New Organization</h2>
              <button
                onClick={() => setShowCreator(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
            <TenantCreator onSuccess={() => setShowCreator(false)} />
          </div>
        ) : (
          <TenantList tenants={tenants} />
        )}
      </div>
    </div>
  );
}