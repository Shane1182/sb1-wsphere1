import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload } from 'lucide-react';
import { uploadLogo, updateBranding, getBranding } from '../../services/branding';
import { BrandingSettings as BrandingSettingsType } from '../../types/branding';

const brandingSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  primaryColor: z.string().optional(),
});

type BrandingFormData = z.infer<typeof brandingSchema>;

export function BrandingSettings() {
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<BrandingSettingsType | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
  });

  useEffect(() => {
    const loadBranding = async () => {
      const settings = await getBranding();
      if (settings) {
        setCurrentSettings(settings);
        setLogoPreview(settings.logoUrl);
        reset({
          companyName: settings.companyName,
          primaryColor: settings.primaryColor,
        });
      }
    };
    loadBranding();
  }, [reset]);

  const handleLogoChange = (file: File) => {
    setLogo(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: BrandingFormData) => {
    try {
      setSaving(true);
      let logoUrl = currentSettings?.logoUrl;

      if (logo) {
        logoUrl = await uploadLogo(logo);
      }

      await updateBranding({
        ...data,
        logoUrl,
      });

      alert('Branding settings updated successfully');
    } catch (error) {
      console.error('Error updating branding:', error);
      alert('Failed to update branding settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Company Name</label>
        <input
          type="text"
          {...register('companyName')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Primary Color (optional)</label>
        <input
          type="color"
          {...register('primaryColor')}
          className="mt-1 block w-20 h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Branding Settings'}
      </button>
    </form>
  );
}