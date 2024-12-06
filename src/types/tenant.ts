export interface TenantSettings {
  id: string;
  tenantId: string;
  theme: {
    primaryColor: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
  email: {
    supportEmail: string;
    notificationEmail?: string;
    emailFooter?: string;
  };
  features: {
    governance: boolean;
    learning: boolean;
    analytics: boolean;
    maxUsers: number;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enableInAppNotifications: boolean;
    dailyDigest: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  primaryColor?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive';
  settings: {
    allowedModules: string[];
    maxUsers: number;
    features: {
      governance: boolean;
      learning: boolean;
      analytics: boolean;
    };
  };
}

export interface TenantAdmin {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: 'tenant_admin';
  createdAt: Date;
}