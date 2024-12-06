export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: {
    maxUsers: number;
    governance: boolean;
    learning: boolean;
    analytics: boolean;
  };
}

export interface TenantBilling {
  tenantId: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: Date;
  paymentMethodId?: string;
  autoRenew: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  brand: string;
}

export interface PaymentHistory {
  id: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  date: Date;
  description: string;
}