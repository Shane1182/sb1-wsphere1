import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, CreditCard, Users, Settings, ChevronLeft } from 'lucide-react';
import { getTenantById } from '../../services/tenant';
import { getTenantBilling, plans } from '../../services/billing';
import { Tenant } from '../../types/tenant';
import { TenantBilling } from '../../types/billing';
import { OrganizationDetails } from '../../components/platform/OrganizationDetails';
import { UsersList } from '../../components/platform/UsersList';
import { BillingManager } from '../../components/billing/BillingManager';

export function TenantManager() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [billing, setBilling] = useState<TenantBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'billing' | 'users'>('details');

  useEffect(() => {
    loadTenantData();
  }, [tenantId]);

  const loadTenantData = async () => {
    if (!tenantId) {
      setError('No tenant ID provided');
      setLoading(false);
      return;
    }
    
    try {
      const [tenantData, billingData] = await Promise.all([
        getTenantById(tenantId),
        getTenantBilling(tenantId),
      ]);
      
      if (!tenantData) {
        setError('Tenant not found');
        return;
      }

      setTenant(tenantData);
      setBilling(billingData);
      setError(null);
    } catch (error) {
      console.error('Error loading tenant data:', error);
      setError('Failed to load tenant data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error || 'Tenant not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </button>

      <div className="px-4 sm:px-0">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={`${tenant.name} logo`}
                className="h-12 w-12 rounded-lg object-contain"
              />
            ) : (
              <Building2 className="h-12 w-12 text-gray-400" />
            )}
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
              <p className="text-sm text-gray-500">{tenant.domain}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'details'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Organization Details
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`ml-8 px-4 py-2 text-sm font-medium ${
                activeTab === 'billing'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Billing & Plans
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`ml-8 px-4 py-2 text-sm font-medium ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'details' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <OrganizationDetails tenant={tenant} onUpdate={loadTenantData} />
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <BillingManager />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <UsersList tenantId={tenant.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}