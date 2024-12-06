import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Upload } from 'lucide-react';
import { Tenant } from '../../types/tenant';
import { updateTenant, uploadTenantLogo } from '../../services/tenant';

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  domain: z.string().min(1, 'Domain is required'),
  primaryColor: z.string().optional(),
  settings: z.object({
    maxUsers: z.number().min(1, 'Must allow at least 1 user'),
    features: z.object({
      governance: z.boolean(),
      learning: z.boolean(),
      analytics: z.boolean(),
    }),
  }),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationDetailsProps {
  tenant: Tenant;
  onUpdate: () => void;
}

export function OrganizationDetails({ tenant, onUpdate }: OrganizationDetailsProps) {
  const [logo, setLogo] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(tenant.logoUrl || null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: tenant.name,
      domain: tenant.domain,
      primaryColor: tenant.primaryColor,
      settings: tenant.settings,
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

  const onSubmit = async (data: OrganizationFormData) => {
    try {
      setSaving(true);
      setError(null);

      let logoUrl = tenant.logoUrl;
      if (logo) {
        logoUrl = await uploadTenantLogo(tenant.id, logo);
      }

      await updateTenant(tenant.id, {
        ...data,
        logoUrl,
      });

      onUpdate();
    } catch (err) {
      console.error('Error updating organization:', err);
      setError('Failed to update organization details');
    } finally {
      setSaving(false);
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
        <label className="block text-sm font-medium text-gray-700">Organization Logo</label>
        <div className="mt-2 flex items-center space-x-6">
          {logoPreview && (
            <img
              src={logoPreview}
              alt="Organization logo preview"
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
          <label className="block text-sm font-medium text-gray-700">Organization Name</label>
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Primary Color</label>
        <input
          type="color"
          {...register('primaryColor')}
          className="mt-1 block w-20 h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Maximum Users</label>
        <input
          type="number"
          {...register('settings.maxUsers', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.settings?.maxUsers && (
          <p className="mt-1 text-sm text-red-600">{errors.settings.maxUsers.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Features</label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('settings.features.governance')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Governance Documents</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('settings.features.learning')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Learning Modules</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('settings.features.analytics')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Analytics</label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || (!isDirty && !logo)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saving ? (
            'Saving...'
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}