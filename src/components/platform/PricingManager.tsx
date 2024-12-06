import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Check } from 'lucide-react';
import { getPlatformPlans, updatePlatformPlan, deletePlatformPlan } from '../../services/platform';
import { BillingPlan } from '../../types/billing';

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  currency: z.string().default('GBP'),
  billingCycle: z.enum(['monthly', 'yearly']),
  features: z.object({
    maxUsers: z.number().min(1, 'Must allow at least 1 user'),
    governance: z.boolean(),
    learning: z.boolean(),
    analytics: z.boolean(),
  }),
});

type PlanFormData = z.infer<typeof planSchema>;

export function PricingManager() {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<BillingPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      currency: 'GBP',
      billingCycle: 'monthly',
      features: {
        maxUsers: 10,
        governance: true,
        learning: true,
        analytics: false,
      },
    },
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const platformPlans = await getPlatformPlans();
      setPlans(platformPlans);
      setError(null);
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      const planData = {
        ...data,
        id: editingPlan?.id || `plan-${Date.now()}`,
      };

      await updatePlatformPlan(planData);
      await loadPlans();
      setShowForm(false);
      setEditingPlan(null);
      reset();
    } catch (err) {
      console.error('Error saving plan:', err);
      setError('Failed to save pricing plan');
    }
  };

  const handleDelete = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      await deletePlatformPlan(planId);
      await loadPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError('Failed to delete pricing plan');
    }
  };

  const handleEdit = (plan: BillingPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
    reset({
      ...plan,
      features: {
        maxUsers: plan.features.maxUsers,
        governance: plan.features.governance,
        learning: plan.features.learning,
        analytics: plan.features.analytics,
      },
    });
  };

  if (loading) {
    return <div>Loading pricing plans...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Platform Pricing Plans</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingPlan(null);
            reset();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price (GBP)</label>
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Maximum Users</label>
              <input
                type="number"
                {...register('features.maxUsers', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.features?.maxUsers && (
                <p className="mt-1 text-sm text-red-600">{errors.features.maxUsers.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Features</label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('features.governance')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Governance Documents</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('features.learning')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Learning Modules</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('features.analytics')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Analytics</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPlan(null);
                  reset();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-1 text-2xl font-bold text-gray-900">£{plan.price}</p>
                <p className="text-sm text-gray-500">per month</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="text-gray-400 hover:text-blue-500"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

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
                  <span className="ml-2 text-sm text-gray-500">Governance Documents</span>
                </li>
              )}
              {plan.features.learning && (
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="ml-2 text-sm text-gray-500">Learning Modules</span>
                </li>
              )}
              {plan.features.analytics && (
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="ml-2 text-sm text-gray-500">Analytics</span>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}