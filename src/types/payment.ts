import { Tenant } from './tenant';

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: {
    maxUsers: number;
    governance: boolean;
    learning: boolean;
    analytics: boolean;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface TenantBilling {
  tenantId: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: Date;
  paymentMethodId?: string;
  autoRenew: boolean;
}

export interface PaymentHistory {
  id: string;
  tenantId: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'pending';
  date: Date;
  description: string;
}