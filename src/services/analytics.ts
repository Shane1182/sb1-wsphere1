import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db, collections } from '../lib/firebase';
import { Tenant } from '../types/tenant';

export interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  activeModules: number;
  averageCompletionRate: number;
  organizationGrowth: Array<{
    month: string;
    count: number;
  }>;
  topOrganizations: Array<{
    name: string;
    users: number;
    completion: number;
  }>;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    // Get all tenants
    const tenantsSnapshot = await getDocs(collection(db, collections.tenants));
    const tenants = tenantsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    } as Tenant));

    // Get all users
    const usersSnapshot = await getDocs(collection(db, collections.users));
    const totalUsers = usersSnapshot.size;

    // Get all modules
    const modulesSnapshot = await getDocs(collection(db, collections.modules));
    const activeModules = modulesSnapshot.size;

    // Calculate organization growth by month
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    
    const monthlyGrowth = tenants.reduce((acc, tenant) => {
      if (tenant.createdAt >= threeMonthsAgo) {
        const monthYear = tenant.createdAt.toLocaleString('default', { month: 'long' });
        acc[monthYear] = (acc[monthYear] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const organizationGrowth = Object.entries(monthlyGrowth).map(([month, count]) => ({
      month,
      count,
    }));

    // Calculate top organizations
    const topOrganizations = await Promise.all(
      tenants.slice(0, 3).map(async (tenant) => {
        const userQuery = query(
          collection(db, collections.users),
          where('tenantId', '==', tenant.id)
        );
        const userCount = (await getDocs(userQuery)).size;

        // Get completion rate from progress collection
        const progressQuery = query(
          collection(db, collections.progress),
          where('tenantId', '==', tenant.id)
        );
        const progressDocs = await getDocs(progressQuery);
        const completionRate = progressDocs.size > 0
          ? (progressDocs.docs.filter(doc => doc.data().completed).length / progressDocs.size) * 100
          : 0;

        return {
          name: tenant.name,
          users: userCount,
          completion: Math.round(completionRate),
        };
      })
    );

    // Calculate average completion rate across all organizations
    const averageCompletionRate = Math.round(
      topOrganizations.reduce((sum, org) => sum + org.completion, 0) / topOrganizations.length
    );

    return {
      totalOrganizations: tenants.length,
      totalUsers,
      activeModules,
      averageCompletionRate,
      organizationGrowth,
      topOrganizations,
    };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    throw error;
  }
}