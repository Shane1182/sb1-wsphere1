import React, { useState, useEffect } from 'react';
import { Building2, Users, BookOpen, BarChart2, TrendingUp } from 'lucide-react';
import { getPlatformStats, PlatformStats } from '../../services/analytics';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
}

function AnalyticsCard({ title, value, icon, loading = false }: AnalyticsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="mt-1 h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          )}
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function PlatformAnalytics() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getPlatformStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load platform statistics');
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Organizations"
          value={stats?.totalOrganizations || 0}
          icon={<Building2 className="h-6 w-6 text-blue-600" />}
          loading={loading}
        />
        <AnalyticsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          loading={loading}
        />
        <AnalyticsCard
          title="Active Modules"
          value={stats?.activeModules || 0}
          icon={<BookOpen className="h-6 w-6 text-blue-600" />}
          loading={loading}
        />
        <AnalyticsCard
          title="Avg. Completion Rate"
          value={`${stats?.averageCompletionRate || 0}%`}
          icon={<BarChart2 className="h-6 w-6 text-blue-600" />}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Growth</h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.organizationGrowth.map((data) => (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{data.month}</span>
                  <div className="flex items-center space-x-2 flex-1 mx-4">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(data.count / (stats?.totalOrganizations || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">{data.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Organizations</h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.topOrganizations.map((org) => (
                <div key={org.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{org.name}</p>
                    <p className="text-xs text-gray-500">{org.users} active users</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${org.completion}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{org.completion}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}