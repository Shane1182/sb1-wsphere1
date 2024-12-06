import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload } from 'lucide-react';
import { createTenant, uploadTenantLogo, updateTenant } from '../../services/tenant';

const tenantSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  domain: z.string().min(1, 'Domain is required'),
  adminEmail: z.string().email('Valid email is required'),
  adminName: z.string().min(1, 'Admin name is required'),
  maxUsers: z.number().min(1, 'Must allow at least 1 user'),
  features: z.object({
    governance: z.boolean(),
    learning: z.boolean(),
    analytics: z.boolean(),
  }),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface TenantCreatorProps {
  onSuccess?: () => void;
}

export function TenantCreator({ onSuccess }: TenantCreatorProps) {
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      maxUsers: 10,
      features: {
        governance: true,
        learning: true,
        analytics: true,
      },
    },
  });

  const handleLogoChange = (file: File) => {
    setLogo(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: TenantFormData) => {
    try {
      setCreating(true);
      setError(null);

      const tenantData = {
        name: data.name,
        domain: data.domain,
        status: 'active' as const,
        settings: {
          allowedModules: [],
          maxUsers: data.maxUsers,
          features: data.features,
        },
      };

      const adminData = {
        email: data.adminEmail,
        name: data.adminName,
      };

      const { tenantId } = await createTenant(tenantData, adminData);

      if (logo) {
        const logoUrl = await uploadTenantLogo(tenantId, logo);
        await updateTenant(tenantId, { logoUrl });
      }

      reset();
      setLogo(null);
      setLogoPreview(null);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating tenant:', error);
      setError('Failed to create tenant. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Company Logo</label>
        <div className="mt-2 flex items-center space-x-6">
          {logoPreview && (
            <img
              src={logoPreview}
              alt="Company logo preview"
              className="h-20 w-auto object-contain"
            />
          )}
          <div
            className="flex justify-center items-center w-40 h-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            <input
              id="logo-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoChange(file);
              }}
            />
            <Upload className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
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
          <label className="block text-sm font-medium text-gray-700">Domain</label>
          <input
            type="text"
            {...register('domain')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.domain && (
            <p className="mt-1 text-sm text-red-600">{errors.domain.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Admin Email</label>
          <input
            type="email"
            {...register('adminEmail')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.adminEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.adminEmail.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Admin Name</label>
          <input
            type="text"
            {...register('adminName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.adminName && (
            <p className="mt-1 text-sm text-red-600">{errors.adminName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Maximum Users</label>
        <input
          type="number"
          {...register('maxUsers', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.maxUsers && (
          <p className="mt-1 text-sm text-red-600">{errors.maxUsers.message}</p>
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

      <button
        type="submit"
        disabled={creating}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {creating ? 'Creating...' : 'Create Organization'}
      </button>
    </form>
  );
}