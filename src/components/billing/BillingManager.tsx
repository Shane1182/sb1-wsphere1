import React, { useState, useEffect } from 'react';
import { CreditCard, Check } from 'lucide-react';
import { plans, getTenantBilling, updateTenantBilling } from '../../services/billing';
import { BillingPlan, TenantBilling } from '../../types/billing';
import { useAuthStore } from '../../store/authStore';

export function BillingManager() {
  const { tenantId } = useAuthStore();
  const [billing, setBilling] = useState<TenantBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBilling = async () => {
      if (!tenantId) return;
      try {
        const billingData = await getTenantBilling(tenantId);
        setBilling(billingData);
      } catch (err) {
        console.error('Error loading billing:', err);
        setError('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    loadBilling();
  }, [tenantId]);

  const handlePlanChange = async (plan: BillingPlan) => {
    if (!tenantId) return;
    try {
      setUpdating(true);
      await updateTenantBilling(tenantId, {
        planId: plan.id,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
      });
      
      const updatedBilling = await getTenantBilling(tenantId);
      setBilling(updatedBilling);
    } catch (err) {
      console.error('Error updating plan:', err);
      setError('Failed to update plan');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading billing information...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Subscription Plans</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose the plan that best fits your organization
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-6 ${
                  billing?.planId === plan.id
                    ? 'border-blue-500 ring-2 ring-blue-500'
                    : 'border-gray-200'
                }`}
              >
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold tracking-tight text-gray-900">
                    £{plan.price}
                  </span>
                  <span className="ml-1 text-sm font-medium text-gray-500">/month</span>
                </p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="ml-2 text-sm text-gray-500">
                      Up to {plan.features.maxUsers} users
                    </span>
                  </li>
                  {plan.features.governance && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="ml-2 text-sm text-gray-500">
                        Governance Documents
                      </span>
                    </li>
                  )}
                  {plan.features.learning && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="ml-2 text-sm text-gray-500">
                        Learning Modules
                      </span>
                    </li>
                  )}
                  {plan.features.analytics && (
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="ml-2 text-sm text-gray-500">
                        Advanced Analytics
                      </span>
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => handlePlanChange(plan)}
                  disabled={billing?.planId === plan.id || updating}
                  className={`mt-6 w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${
                    billing?.planId === plan.id
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-blue-600 text-white border-transparent hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {billing?.planId === plan.id ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
          <div className="mt-4">
            <button
              onClick={() => {/* TODO: Implement payment method management */}}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <CreditCard className="h-5 w-5 mr-2 text-gray-400" />
              Add Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}