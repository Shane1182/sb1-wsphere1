import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Upload, Loader2 } from 'lucide-react';
import { getTenantSettings, updateTenantSettings } from '../../services/tenantSettings';
import { uploadTenantLogo } from '../../services/tenant';
import { TenantSettings as TenantSettingsType } from '../../types/tenant';

const settingsSchema = z.object({
  theme: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
  }),
  email: z.object({
    supportEmail: z.string().email('Invalid email address'),
    notificationEmail: z.string().email('Invalid email address').optional(),
    emailFooter: z.string().optional(),
  }),
  features: z.object({
    governance: z.boolean(),
    learning: z.boolean(),
    analytics: z.boolean(),
    maxUsers: z.number().min(1, 'Must allow at least 1 user'),
  }),
  notifications: z.object({
    enableEmailNotifications: z.boolean(),
    enableInAppNotifications: z.boolean(),
    dailyDigest: z.boolean(),
  }),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface TenantSettingsProps {
  tenantId: string;
}

export function TenantSettings({ tenantId }: TenantSettingsProps) {
  const [settings, setSettings] = useState<TenantSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getTenantSettings(tenantId);
        if (data) {
          setSettings(data);
          setLogoPreview(data.theme.logoUrl);
          reset({
            theme: data.theme,
            email: data.email,
            features: data.features,
            notifications: data.notifications,
          });
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load tenant settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [tenantId, reset]);

  const handleLogoChange = (file: File) => {
    setLogo(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setSaving(true);
      setError(null);

      let logoUrl = settings?.theme.logoUrl;
      if (logo) {
        logoUrl = await uploadTenantLogo(tenantId, logo);
      }

      await updateTenantSettings(tenantId, {
        ...data,
        theme: {
          ...data.theme,
          logoUrl,
        },
      });

      setLogo(null);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Branding</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Color</label>
              <input
                type="color"
                {...register('theme.primaryColor')}
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
              <input
                type="color"
                {...register('theme.secondaryColor')}
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Support Email</label>
            <input
              type="email"
              {...register('email.supportEmail')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email?.supportEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.email.supportEmail.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notification Email</label>
            <input
              type="email"
              {...register('email.notificationEmail')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Footer</label>
            <textarea
              {...register('email.emailFooter')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
        <div className="space-y-4">
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

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('features.governance')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable Governance Documents</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('features.learning')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable Learning Modules</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('features.analytics')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable Analytics</label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('notifications.enableEmailNotifications')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Enable Email Notifications</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('notifications.enableInAppNotifications')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Enable In-App Notifications</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('notifications.dailyDigest')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Enable Daily Digest</label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
}