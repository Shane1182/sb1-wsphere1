import React from 'react';
import { Building2, Users, Settings, ArrowRight } from 'lucide-react';
import { Tenant } from '../../types/tenant';
import { useNavigate } from 'react-router-dom';

interface TenantListProps {
  tenants: Tenant[];
}

export function TenantList({ tenants }: TenantListProps) {
  const navigate = useNavigate();

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {tenants.map((tenant) => (
        <div
          key={tenant.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {tenant.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={`${tenant.name} logo`}
                  className="h-12 w-12 object-contain rounded"
                />
              ) : (
                <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{tenant.name}</h3>
                <p className="text-sm text-gray-500">{tenant.domain}</p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/platform/tenants/${tenant.id}`)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {tenant.settings.maxUsers} users allowed
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {Object.entries(tenant.settings.features)
                  .filter(([, enabled]) => enabled)
                  .map(([feature]) => feature)
                  .join(', ')}
              </span>
            </div>
            <div className="text-sm text-gray-500 text-right">
              Created {formatDate(tenant.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}